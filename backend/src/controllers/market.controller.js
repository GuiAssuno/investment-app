const marketDataService = require('../services/market/market-data.service');
const logger = require('../utils/logger');

/**
 * Controller de Mercado
 * Gerencia requisições HTTP relacionadas a dados de mercado
 */

/**
 * Obtém cotação de um ativo
 * GET /api/v1/market/quote/:symbol
 */
const getQuote = async (req, res) => {
  try {
    const { symbol } = req.params;

    const quote = await marketDataService.getQuote(symbol.toUpperCase());

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    logger.error('Erro ao obter cotação:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter cotação',
    });
  }
};

/**
 * Obtém cotações de múltiplos ativos
 * GET /api/v1/market/quotes?symbols=PETR4,VALE3,ITUB4
 */
const getQuotes = async (req, res) => {
  try {
    const { symbols } = req.query;

    if (!symbols) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro symbols é obrigatório',
      });
    }

    const symbolsArray = symbols.split(',').map(s => s.trim().toUpperCase());
    const quotes = await marketDataService.getQuotes(symbolsArray);

    res.status(200).json({
      success: true,
      data: quotes,
    });
  } catch (error) {
    logger.error('Erro ao obter cotações:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter cotações',
    });
  }
};

/**
 * Obtém dados históricos de um ativo
 * GET /api/v1/market/historical/:symbol?interval=1d&range=1mo
 */
const getHistoricalData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1d', range = '1mo' } = req.query;

    const data = await marketDataService.getHistoricalData(
      symbol.toUpperCase(),
      interval,
      range
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Erro ao obter dados históricos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter dados históricos',
    });
  }
};

/**
 * Busca ativos
 * GET /api/v1/market/search?q=petro
 */
const searchAssets = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Termo de busca deve ter pelo menos 2 caracteres',
      });
    }

    const results = await marketDataService.searchAssets(q);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error('Erro ao buscar ativos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar ativos',
    });
  }
};

/**
 * Obtém lista de ativos disponíveis
 * GET /api/v1/market/available
 */
const getAvailableAssets = async (req, res) => {
  try {
    const assets = await marketDataService.getAvailableAssets();

    res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    logger.error('Erro ao obter ativos disponíveis:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter ativos disponíveis',
    });
  }
};

/**
 * Obtém maiores altas do dia
 * GET /api/v1/market/top-gainers
 */
const getTopGainers = async (req, res) => {
  try {
    const gainers = await marketDataService.getTopGainers();

    res.status(200).json({
      success: true,
      data: gainers,
    });
  } catch (error) {
    logger.error('Erro ao obter maiores altas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter maiores altas',
    });
  }
};

/**
 * Obtém maiores baixas do dia
 * GET /api/v1/market/top-losers
 */
const getTopLosers = async (req, res) => {
  try {
    const losers = await marketDataService.getTopLosers();

    res.status(200).json({
      success: true,
      data: losers,
    });
  } catch (error) {
    logger.error('Erro ao obter maiores baixas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter maiores baixas',
    });
  }
};

/**
 * Obtém status do mercado
 * GET /api/v1/market/status
 */
const getMarketStatus = async (req, res) => {
  try {
    const status = await marketDataService.getMarketStatus();

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Erro ao obter status do mercado:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter status do mercado',
    });
  }
};

module.exports = {
  getQuote,
  getQuotes,
  getHistoricalData,
  searchAssets,
  getAvailableAssets,
  getTopGainers,
  getTopLosers,
  getMarketStatus,
};

