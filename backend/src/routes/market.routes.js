const express = require('express');
const marketController = require('../controllers/market.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * Rotas de Mercado
 * Prefixo: /api/v1/market
 */

// Aplicar autenticação opcional (algumas rotas podem ser públicas)
router.use(optionalAuthenticate);

// Rotas de cotações
router.get('/quote/:symbol', marketController.getQuote);
router.get('/quotes', marketController.getQuotes);
router.get('/historical/:symbol', marketController.getHistoricalData);

// Rotas de busca e listagem
router.get('/search', marketController.searchAssets);
router.get('/available', marketController.getAvailableAssets);

// Rotas de rankings
router.get('/top-gainers', marketController.getTopGainers);
router.get('/top-losers', marketController.getTopLosers);

// Status do mercado
router.get('/status', marketController.getMarketStatus);

module.exports = router;

