const Order = require('../../models/Order');
const Account = require('../../models/Account');
const Position = require('../../models/Position');
const { sequelize } = require('../../config/database');
const logger = require('../../utils/logger');
const marketDataService = require('../market/market-data.service');

/**
 * Serviço de Ordens
 * Gerencia criação, modificação e cancelamento de ordens
 */

/**
 * Cria uma nova ordem
 * @param {string} accountId - ID da conta
 * @param {Object} orderData - Dados da ordem
 * @returns {Promise<Object>} Ordem criada
 */
const createOrder = async (accountId, orderData) => {
  const transaction = await sequelize.transaction();

  try {
    const { symbol, side, type, quantity, price, stop_price, time_in_force } = orderData;

    // Buscar conta
    const account = await Account.findByPk(accountId, { transaction });
    if (!account) {
      throw new Error('Conta não encontrada');
    }

    if (!account.isActive()) {
      throw new Error('Conta não está ativa');
    }

    // Obter cotação atual
    const quote = await marketDataService.getQuote(symbol);
    if (!quote) {
      throw new Error(`Ativo ${symbol} não encontrado`);
    }

    // Validar ordem
    await validateOrder(account, { symbol, side, type, quantity, price, stop_price }, quote);

    // Calcular valor estimado da ordem
    const estimatedPrice = type === 'market' ? quote.regularMarketPrice : price;
    const estimatedValue = quantity * estimatedPrice;

    // Para ordens de compra, bloquear saldo
    if (side === 'buy') {
      const availableBalance = account.getAvailableBalance();
      if (estimatedValue > availableBalance) {
        throw new Error('Saldo insuficiente');
      }

      // Bloquear saldo
      await account.update(
        {
          blocked_balance: parseFloat(account.blocked_balance) + estimatedValue,
        },
        { transaction }
      );
    }

    // Para ordens de venda, verificar posição
    if (side === 'sell') {
      const position = await Position.findOne({
        where: { account_id: accountId, symbol },
        transaction,
      });

      if (!position || position.quantity < quantity) {
        throw new Error('Quantidade insuficiente do ativo');
      }
    }

    // Criar ordem
    const order = await Order.create(
      {
        account_id: accountId,
        symbol,
        side,
        type,
        quantity,
        price,
        stop_price,
        time_in_force: time_in_force || 'day',
        status: 'pending',
      },
      { transaction }
    );

    await transaction.commit();

    logger.info(`Ordem criada: ${order.id} - ${side} ${quantity} ${symbol}`);

    return order.toPublicJSON();
  } catch (error) {
    await transaction.rollback();
    logger.error('Erro ao criar ordem:', error);
    throw error;
  }
};

/**
 * Valida uma ordem
 */
const validateOrder = async (account, orderData, quote) => {
  const { symbol, side, type, quantity, price, stop_price } = orderData;

  // Validar quantidade
  if (quantity <= 0) {
    throw new Error('Quantidade deve ser maior que zero');
  }

  // Validar tipo de ordem
  if (!['market', 'limit', 'stop', 'stop_limit'].includes(type)) {
    throw new Error('Tipo de ordem inválido');
  }

  // Validar preço para ordens limit
  if ((type === 'limit' || type === 'stop_limit') && (!price || price <= 0)) {
    throw new Error('Preço deve ser especificado para ordens limit');
  }

  // Validar stop price para ordens stop
  if ((type === 'stop' || type === 'stop_limit') && (!stop_price || stop_price <= 0)) {
    throw new Error('Stop price deve ser especificado para ordens stop');
  }

  // Validar limites de risco
  if (account.max_position_size) {
    const estimatedPrice = type === 'market' ? quote.regularMarketPrice : price;
    const positionValue = quantity * estimatedPrice;

    if (positionValue > account.max_position_size) {
      throw new Error(`Tamanho máximo de posição excedido (limite: R$ ${account.max_position_size})`);
    }
  }

  return true;
};

/**
 * Cancela uma ordem
 * @param {string} orderId - ID da ordem
 * @param {string} accountId - ID da conta
 * @returns {Promise<boolean>} Sucesso
 */
const cancelOrder = async (orderId, accountId) => {
  const transaction = await sequelize.transaction();

  try {
    // Buscar ordem
    const order = await Order.findOne({
      where: { id: orderId, account_id: accountId },
      transaction,
    });

    if (!order) {
      throw new Error('Ordem não encontrada');
    }

    if (!order.isActive()) {
      throw new Error('Ordem não pode ser cancelada');
    }

    // Desbloquear saldo se for ordem de compra
    if (order.side === 'buy') {
      const account = await Account.findByPk(accountId, { transaction });
      const estimatedValue = order.quantity * (order.price || 0);

      await account.update(
        {
          blocked_balance: Math.max(0, parseFloat(account.blocked_balance) - estimatedValue),
        },
        { transaction }
      );
    }

    // Atualizar status da ordem
    await order.update(
      {
        status: 'cancelled',
        cancelled_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    logger.info(`Ordem cancelada: ${orderId}`);

    return true;
  } catch (error) {
    await transaction.rollback();
    logger.error('Erro ao cancelar ordem:', error);
    throw error;
  }
};

/**
 * Obtém ordens de uma conta
 * @param {string} accountId - ID da conta
 * @param {Object} filters - Filtros (status, symbol)
 * @returns {Promise<Array>} Lista de ordens
 */
const getOrders = async (accountId, filters = {}) => {
  try {
    const where = { account_id: accountId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.symbol) {
      where.symbol = filters.symbol;
    }

    const orders = await Order.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: filters.limit || 100,
    });

    return orders.map(order => order.toPublicJSON());
  } catch (error) {
    logger.error('Erro ao obter ordens:', error);
    throw error;
  }
};

/**
 * Obtém uma ordem específica
 * @param {string} orderId - ID da ordem
 * @param {string} accountId - ID da conta
 * @returns {Promise<Object>} Ordem
 */
const getOrder = async (orderId, accountId) => {
  try {
    const order = await Order.findOne({
      where: { id: orderId, account_id: accountId },
    });

    if (!order) {
      throw new Error('Ordem não encontrada');
    }

    return order.toPublicJSON();
  } catch (error) {
    logger.error('Erro ao obter ordem:', error);
    throw error;
  }
};

/**
 * Simula execução de ordem (para paper trading)
 * @param {string} orderId - ID da ordem
 * @returns {Promise<Object>} Ordem executada
 */
const simulateOrderExecution = async (orderId) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, { transaction });
    if (!order) {
      throw new Error('Ordem não encontrada');
    }

    if (!order.isActive()) {
      throw new Error('Ordem não está ativa');
    }

    // Obter cotação atual
    const quote = await marketDataService.getQuote(order.symbol);
    const executionPrice = order.type === 'market' ? quote.regularMarketPrice : order.price;

    // Calcular valores
    const executedValue = order.quantity * executionPrice;
    const fees = executedValue * 0.0003; // 0.03% de taxa

    // Atualizar ordem
    await order.update(
      {
        status: 'filled',
        filled_quantity: order.quantity,
        total_executed_value: executedValue,
        fees,
        executed_at: new Date(),
      },
      { transaction }
    );

    // Atualizar conta
    const account = await Account.findByPk(order.account_id, { transaction });

    if (order.side === 'buy') {
      // Desbloquear saldo e debitar
      const totalCost = executedValue + fees;
      await account.update(
        {
          balance: parseFloat(account.balance) - totalCost,
          blocked_balance: Math.max(0, parseFloat(account.blocked_balance) - executedValue),
        },
        { transaction }
      );

      // Atualizar ou criar posição
      let position = await Position.findOne({
        where: { account_id: account.id, symbol: order.symbol },
        transaction,
      });

      if (position) {
        const newQuantity = position.quantity + order.quantity;
        const newTotalCost = parseFloat(position.total_cost) + totalCost;
        const newAveragePrice = newTotalCost / newQuantity;

        await position.update(
          {
            quantity: newQuantity,
            average_price: newAveragePrice,
            total_cost: newTotalCost,
          },
          { transaction }
        );
      } else {
        position = await Position.create(
          {
            account_id: account.id,
            symbol: order.symbol,
            quantity: order.quantity,
            average_price: executionPrice,
            total_cost: totalCost,
          },
          { transaction }
        );
      }
    } else if (order.side === 'sell') {
      // Creditar saldo
      const totalRevenue = executedValue - fees;
      await account.update(
        {
          balance: parseFloat(account.balance) + totalRevenue,
        },
        { transaction }
      );

      // Atualizar posição
      const position = await Position.findOne({
        where: { account_id: account.id, symbol: order.symbol },
        transaction,
      });

      if (position) {
        const newQuantity = position.quantity - order.quantity;
        const realizedPnL = (executionPrice - position.average_price) * order.quantity - fees;

        if (newQuantity === 0) {
          await position.destroy({ transaction });
        } else {
          const newTotalCost = position.average_price * newQuantity;
          await position.update(
            {
              quantity: newQuantity,
              total_cost: newTotalCost,
              realized_pnl: parseFloat(position.realized_pnl) + realizedPnL,
            },
            { transaction }
          );
        }
      }
    }

    await transaction.commit();

    logger.info(`Ordem executada (simulação): ${orderId}`);

    return order.toPublicJSON();
  } catch (error) {
    await transaction.rollback();
    logger.error('Erro ao simular execução de ordem:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  cancelOrder,
  getOrders,
  getOrder,
  simulateOrderExecution,
};

