const portfolioService = require('../services/portfolio/portfolio.service');
const logger = require('../utils/logger');

/**
 * Controller de Portfólio
 * Gerencia requisições HTTP relacionadas a portfólio e posições
 */

/**
 * Obtém resumo do portfólio
 * GET /api/v1/portfolio/summary?accountId=xxx
 */
const getPortfolioSummary = async (req, res) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'accountId é obrigatório',
      });
    }

    const summary = await portfolioService.getPortfolioSummary(accountId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Erro ao obter resumo do portfólio:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter resumo do portfólio',
    });
  }
};

/**
 * Obtém posições do portfólio
 * GET /api/v1/portfolio/positions?accountId=xxx
 */
const getPositions = async (req, res) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'accountId é obrigatório',
      });
    }

    const positions = await portfolioService.getPositions(accountId);

    res.status(200).json({
      success: true,
      data: positions,
    });
  } catch (error) {
    logger.error('Erro ao obter posições:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter posições',
    });
  }
};

/**
 * Obtém performance do portfólio
 * GET /api/v1/portfolio/performance?accountId=xxx&period=1m
 */
const getPerformance = async (req, res) => {
  try {
    const { accountId, period = '1m' } = req.query;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'accountId é obrigatório',
      });
    }

    const performance = await portfolioService.getPerformance(accountId, period);

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    logger.error('Erro ao obter performance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter performance',
    });
  }
};

/**
 * Obtém alocação de ativos
 * GET /api/v1/portfolio/allocation?accountId=xxx
 */
const getAllocation = async (req, res) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'accountId é obrigatório',
      });
    }

    const allocation = await portfolioService.getAllocation(accountId);

    res.status(200).json({
      success: true,
      data: allocation,
    });
  } catch (error) {
    logger.error('Erro ao obter alocação:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter alocação',
    });
  }
};

/**
 * Obtém métricas de diversificação
 * GET /api/v1/portfolio/diversification?accountId=xxx
 */
const getDiversification = async (req, res) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'accountId é obrigatório',
      });
    }

    const diversification = await portfolioService.getDiversification(accountId);

    res.status(200).json({
      success: true,
      data: diversification,
    });
  } catch (error) {
    logger.error('Erro ao obter diversificação:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter diversificação',
    });
  }
};

module.exports = {
  getPortfolioSummary,
  getPositions,
  getPerformance,
  getAllocation,
  getDiversification,
};

