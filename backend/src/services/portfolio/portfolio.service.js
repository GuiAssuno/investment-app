const Account = require('../../models/Account');
const Position = require('../../models/Position');
const Order = require('../../models/Order');
const marketDataService = require('../market/market-data.service');
const logger = require('../../utils/logger');

/**
 * Serviço de Portfólio
 * Gerencia posições, performance e análise de portfólio
 */

/**
 * Obtém resumo do portfólio
 * @param {string} accountId - ID da conta
 * @returns {Promise<Object>} Resumo do portfólio
 */
const getPortfolioSummary = async (accountId) => {
  try {
    // Buscar conta
    const account = await Account.findByPk(accountId);
    if (!account) {
      throw new Error('Conta não encontrada');
    }

    // Buscar posições
    const positions = await Position.findAll({
      where: { account_id: accountId },
    });

    // Se não há posições, retornar apenas dados da conta
    if (positions.length === 0) {
      return {
        account: account.toPublicJSON(),
        positions: [],
        totalValue: parseFloat(account.balance),
        totalInvested: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
      };
    }

    // Obter cotações atuais
    const symbols = positions.map(p => p.symbol);
    const quotes = await marketDataService.getQuotes(symbols);

    // Criar mapa de cotações
    const quoteMap = {};
    quotes.forEach(q => {
      quoteMap[q.symbol] = q;
    });

    // Calcular valores
    let totalValue = parseFloat(account.balance);
    let totalInvested = 0;
    let totalProfitLoss = 0;
    let dayChange = 0;

    const positionsWithData = positions.map(position => {
      const quote = quoteMap[position.symbol];
      if (!quote) {
        return null;
      }

      const currentPrice = quote.regularMarketPrice;
      const positionValue = position.getTotalValue(currentPrice);
      const positionPnL = position.getProfitLoss(currentPrice);
      const positionCost = parseFloat(position.total_cost);

      totalValue += positionValue;
      totalInvested += positionCost;
      totalProfitLoss += positionPnL;

      // Calcular variação do dia
      const previousClose = quote.regularMarketPreviousClose;
      const positionDayChange = (currentPrice - previousClose) * position.quantity;
      dayChange += positionDayChange;

      return {
        ...position.toPublicJSON(currentPrice),
        allocation: 0, // Será calculado depois
      };
    }).filter(p => p !== null);

    // Calcular alocações
    positionsWithData.forEach(position => {
      position.allocation = (position.total_value / totalValue) * 100;
    });

    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0;

    return {
      account: account.toPublicJSON(),
      positions: positionsWithData,
      totalValue,
      totalInvested,
      totalProfitLoss,
      totalProfitLossPercent,
      dayChange,
      dayChangePercent,
      positionCount: positionsWithData.length,
    };
  } catch (error) {
    logger.error('Erro ao obter resumo do portfólio:', error);
    throw error;
  }
};

/**
 * Obtém posições do portfólio
 * @param {string} accountId - ID da conta
 * @returns {Promise<Array>} Lista de posições
 */
const getPositions = async (accountId) => {
  try {
    const positions = await Position.findAll({
      where: { account_id: accountId },
    });

    if (positions.length === 0) {
      return [];
    }

    // Obter cotações atuais
    const symbols = positions.map(p => p.symbol);
    const quotes = await marketDataService.getQuotes(symbols);

    // Criar mapa de cotações
    const quoteMap = {};
    quotes.forEach(q => {
      quoteMap[q.symbol] = q;
    });

    // Retornar posições com dados atuais
    return positions.map(position => {
      const quote = quoteMap[position.symbol];
      if (!quote) {
        return position.toPublicJSON();
      }

      return position.toPublicJSON(quote.regularMarketPrice);
    });
  } catch (error) {
    logger.error('Erro ao obter posições:', error);
    throw error;
  }
};

/**
 * Obtém performance do portfólio
 * @param {string} accountId - ID da conta
 * @param {string} period - Período (1d, 1w, 1m, 3m, 6m, 1y, ytd, all)
 * @returns {Promise<Object>} Dados de performance
 */
const getPerformance = async (accountId, period = '1m') => {
  try {
    // TODO: Implementar cálculo de performance histórica
    // Por enquanto, retornar dados básicos

    const summary = await getPortfolioSummary(accountId);

    return {
      period,
      totalReturn: summary.totalProfitLoss,
      totalReturnPercent: summary.totalProfitLossPercent,
      dayChange: summary.dayChange,
      dayChangePercent: summary.dayChangePercent,
      // TODO: Adicionar dados históricos
      historicalData: [],
    };
  } catch (error) {
    logger.error('Erro ao obter performance:', error);
    throw error;
  }
};

/**
 * Obtém alocação de ativos
 * @param {string} accountId - ID da conta
 * @returns {Promise<Object>} Dados de alocação
 */
const getAllocation = async (accountId) => {
  try {
    const summary = await getPortfolioSummary(accountId);

    // Agrupar por tipo de ativo (simplificado)
    const allocation = {
      cash: {
        value: parseFloat(summary.account.balance),
        percent: (parseFloat(summary.account.balance) / summary.totalValue) * 100,
      },
      stocks: {
        value: 0,
        percent: 0,
        positions: [],
      },
    };

    summary.positions.forEach(position => {
      allocation.stocks.value += position.total_value;
      allocation.stocks.positions.push({
        symbol: position.symbol,
        value: position.total_value,
        percent: position.allocation,
      });
    });

    allocation.stocks.percent = (allocation.stocks.value / summary.totalValue) * 100;

    return allocation;
  } catch (error) {
    logger.error('Erro ao obter alocação:', error);
    throw error;
  }
};

/**
 * Calcula diversificação do portfólio
 * @param {string} accountId - ID da conta
 * @returns {Promise<Object>} Métricas de diversificação
 */
const getDiversification = async (accountId) => {
  try {
    const positions = await getPositions(accountId);

    if (positions.length === 0) {
      return {
        positionCount: 0,
        diversificationScore: 0,
        concentration: 0,
        largestPosition: null,
      };
    }

    // Calcular índice de concentração (Herfindahl-Hirschman Index)
    let hhi = 0;
    let largestPosition = null;
    let largestAllocation = 0;

    positions.forEach(position => {
      const allocation = position.allocation || 0;
      hhi += Math.pow(allocation, 2);

      if (allocation > largestAllocation) {
        largestAllocation = allocation;
        largestPosition = {
          symbol: position.symbol,
          allocation,
        };
      }
    });

    // Normalizar HHI para escala 0-100 (100 = bem diversificado)
    const diversificationScore = Math.max(0, 100 - (hhi / 100));

    return {
      positionCount: positions.length,
      diversificationScore: Math.round(diversificationScore),
      concentration: Math.round(hhi),
      largestPosition,
    };
  } catch (error) {
    logger.error('Erro ao calcular diversificação:', error);
    throw error;
  }
};

module.exports = {
  getPortfolioSummary,
  getPositions,
  getPerformance,
  getAllocation,
  getDiversification,
};

