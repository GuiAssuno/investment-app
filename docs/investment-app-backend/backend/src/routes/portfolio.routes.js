const express = require('express');
const portfolioController = require('../controllers/portfolio.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * Rotas de Portfólio
 * Prefixo: /api/v1/portfolio
 */

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas de portfólio
router.get('/summary', portfolioController.getPortfolioSummary);
router.get('/positions', portfolioController.getPositions);
router.get('/performance', portfolioController.getPerformance);
router.get('/allocation', portfolioController.getAllocation);
router.get('/diversification', portfolioController.getDiversification);

module.exports = router;

