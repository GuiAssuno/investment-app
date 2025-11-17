const axios = require('axios');
const config = require('../../config/environment');
const { cacheUtils } = require('../../config/redis');
const logger = require('../../utils/logger');

/**
 * Serviço de Dados de Mercado
 * Obtém cotações, dados históricos e informações de mercado
 */

/**
 * Cliente HTTP para API de mercado
 */
const marketApiClient = axios.create({
  baseURL: config.marketData.brapi.url,
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${config.marketData.brapi.apiKey}`,
  },
});

/**
 * Obtém cotação de um ativo
 * @param {string} symbol - Símbolo do ativo
 * @returns {Promise<Object>} Dados da cotação
 */
const getQuote = async (symbol) => {
  try {
    // Tentar obter do cache
    const cacheKey = `quote:${symbol}`;
    const cached = await cacheUtils.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar da API
    const response = await marketApiClient.get(`/quote/${symbol}`);
    const quote = response.data.results[0];

    if (!quote) {
      throw new Error(`Ativo ${symbol} não encontrado`);
    }

    const formattedQuote = {
      symbol: quote.symbol,
      shortName: quote.shortName,
      longName: quote.longName,
      currency: quote.currency,
      marketCap: quote.marketCap,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketDayHigh: quote.regularMarketDayHigh,
      regularMarketDayLow: quote.regularMarketDayLow,
      regularMarketVolume: quote.regularMarketVolume,
      regularMarketPreviousClose: quote.regularMarketPreviousClose,
      regularMarketChange: quote.regularMarketChange,
      regularMarketChangePercent: quote.regularMarketChangePercent,
      regularMarketTime: quote.regularMarketTime,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      averageDailyVolume10Day: quote.averageDailyVolume10Day,
      averageDailyVolume3Month: quote.averageDailyVolume3Month,
    };

    // Cachear por 30 segundos
    await cacheUtils.set(cacheKey, formattedQuote, 30);

    return formattedQuote;
  } catch (error) {
    logger.error(`Erro ao obter cotação de ${symbol}:`, error);
    throw error;
  }
};

/**
 * Obtém cotações de múltiplos ativos
 * @param {Array<string>} symbols - Array de símbolos
 * @returns {Promise<Array>} Array de cotações
 */
const getQuotes = async (symbols) => {
  try {
    const symbolsString = symbols.join(',');
    const cacheKey = `quotes:${symbolsString}`;
    
    // Tentar obter do cache
    const cached = await cacheUtils.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar da API
    const response = await marketApiClient.get(`/quote/${symbolsString}`);
    const quotes = response.data.results;

    // Cachear por 30 segundos
    await cacheUtils.set(cacheKey, quotes, 30);

    return quotes;
  } catch (error) {
    logger.error('Erro ao obter cotações:', error);
    throw error;
  }
};

/**
 * Obtém dados históricos de um ativo
 * @param {string} symbol - Símbolo do ativo
 * @param {string} interval - Intervalo (1d, 1wk, 1mo)
 * @param {string} range - Período (1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
 * @returns {Promise<Object>} Dados históricos
 */
const getHistoricalData = async (symbol, interval = '1d', range = '1mo') => {
  try {
    const cacheKey = `historical:${symbol}:${interval}:${range}`;
    
    // Tentar obter do cache
    const cached = await cacheUtils.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar da API
    const response = await marketApiClient.get(`/quote/${symbol}`, {
      params: {
        range,
        interval,
      },
    });

    const data = response.data.results[0];
    
    if (!data || !data.historicalDataPrice) {
      throw new Error(`Dados históricos não disponíveis para ${symbol}`);
    }

    // Cachear por 5 minutos para dados diários, 1 hora para outros
    const ttl = interval === '1d' ? 300 : 3600;
    await cacheUtils.set(cacheKey, data.historicalDataPrice, ttl);

    return data.historicalDataPrice;
  } catch (error) {
    logger.error(`Erro ao obter dados históricos de ${symbol}:`, error);
    throw error;
  }
};

/**
 * Busca ativos por termo
 * @param {string} query - Termo de busca
 * @returns {Promise<Array>} Resultados da busca
 */
const searchAssets = async (query) => {
  try {
    const cacheKey = `search:${query.toLowerCase()}`;
    
    // Tentar obter do cache
    const cached = await cacheUtils.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar da API
    const response = await marketApiClient.get('/available', {
      params: {
        search: query,
      },
    });

    const results = response.data.stocks || [];

    // Cachear por 1 hora
    await cacheUtils.set(cacheKey, results, 3600);

    return results;
  } catch (error) {
    logger.error('Erro ao buscar ativos:', error);
    throw error;
  }
};

/**
 * Obtém lista de ativos disponíveis
 * @returns {Promise<Array>} Lista de ativos
 */
const getAvailableAssets = async () => {
  try {
    const cacheKey = 'available:assets';
    
    // Tentar obter do cache
    const cached = await cacheUtils.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar da API
    const response = await marketApiClient.get('/available');
    const assets = response.data.stocks || [];

    // Cachear por 24 horas
    await cacheUtils.set(cacheKey, assets, 86400);

    return assets;
  } catch (error) {
    logger.error('Erro ao obter ativos disponíveis:', error);
    throw error;
  }
};

/**
 * Obtém maiores altas do dia
 * @returns {Promise<Array>} Maiores altas
 */
const getTopGainers = async () => {
  try {
    const cacheKey = 'market:top_gainers';
    
    // Tentar obter do cache
    const cached = await cacheUtils.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar principais ações
    const response = await marketApiClient.get('/quote/list');
    const stocks = response.data.stocks || [];

    // Ordenar por variação percentual
    const gainers = stocks
      .filter(s => s.regularMarketChangePercent > 0)
      .sort((a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent)
      .slice(0, 10);

    // Cachear por 5 minutos
    await cacheUtils.set(cacheKey, gainers, 300);

    return gainers;
  } catch (error) {
    logger.error('Erro ao obter maiores altas:', error);
    throw error;
  }
};

/**
 * Obtém maiores baixas do dia
 * @returns {Promise<Array>} Maiores baixas
 */
const getTopLosers = async () => {
  try {
    const cacheKey = 'market:top_losers';
    
    // Tentar obter do cache
    const cached = await cacheUtils.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar principais ações
    const response = await marketApiClient.get('/quote/list');
    const stocks = response.data.stocks || [];

    // Ordenar por variação percentual
    const losers = stocks
      .filter(s => s.regularMarketChangePercent < 0)
      .sort((a, b) => a.regularMarketChangePercent - b.regularMarketChangePercent)
      .slice(0, 10);

    // Cachear por 5 minutos
    await cacheUtils.set(cacheKey, losers, 300);

    return losers;
  } catch (error) {
    logger.error('Erro ao obter maiores baixas:', error);
    throw error;
  }
};

/**
 * Obtém status do mercado
 * @returns {Promise<Object>} Status do mercado
 */
const getMarketStatus = async () => {
  try {
    // Horário de funcionamento da B3: 10h às 17h (horário de Brasília)
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Verificar se é dia útil (segunda a sexta)
    const isWeekday = day >= 1 && day <= 5;

    // Verificar se está no horário de pregão
    const isMarketHours = hour >= 10 && hour < 17;

    const status = {
      isOpen: isWeekday && isMarketHours,
      nextOpen: null,
      nextClose: null,
      timezone: 'America/Sao_Paulo',
    };

    return status;
  } catch (error) {
    logger.error('Erro ao obter status do mercado:', error);
    throw error;
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

