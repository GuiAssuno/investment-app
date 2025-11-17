const orderService = require('../services/trading/order.service');
const logger = require('../utils/logger');

/**
 * Controller de Trading
 * Gerencia requisições HTTP relacionadas a ordens e trading
 */

/**
 * Cria uma nova ordem
 * POST /api/v1/trading/orders
 */
const createOrder = async (req, res) => {
  try {
    // TODO: Obter accountId do usuário autenticado
    // Por enquanto, usar do body
    const { accountId, ...orderData } = req.body;

    const order = await orderService.createOrder(accountId, orderData);

    res.status(201).json({
      success: true,
      message: 'Ordem criada com sucesso',
      data: order,
    });
  } catch (error) {
    logger.error('Erro ao criar ordem:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar ordem',
    });
  }
};

/**
 * Cancela uma ordem
 * DELETE /api/v1/trading/orders/:orderId
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { accountId } = req.body;

    await orderService.cancelOrder(orderId, accountId);

    res.status(200).json({
      success: true,
      message: 'Ordem cancelada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao cancelar ordem:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao cancelar ordem',
    });
  }
};

/**
 * Obtém ordens
 * GET /api/v1/trading/orders?accountId=xxx&status=pending
 */
const getOrders = async (req, res) => {
  try {
    const { accountId, status, symbol, limit } = req.query;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'accountId é obrigatório',
      });
    }

    const orders = await orderService.getOrders(accountId, { status, symbol, limit });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    logger.error('Erro ao obter ordens:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter ordens',
    });
  }
};

/**
 * Obtém uma ordem específica
 * GET /api/v1/trading/orders/:orderId?accountId=xxx
 */
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'accountId é obrigatório',
      });
    }

    const order = await orderService.getOrder(orderId, accountId);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error('Erro ao obter ordem:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Ordem não encontrada',
    });
  }
};

/**
 * Simula execução de ordem (paper trading)
 * POST /api/v1/trading/orders/:orderId/execute
 */
const executeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderService.simulateOrderExecution(orderId);

    res.status(200).json({
      success: true,
      message: 'Ordem executada com sucesso',
      data: order,
    });
  } catch (error) {
    logger.error('Erro ao executar ordem:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao executar ordem',
    });
  }
};

module.exports = {
  createOrder,
  cancelOrder,
  getOrders,
  getOrder,
  executeOrder,
};

