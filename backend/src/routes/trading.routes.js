const express = require('express');
const tradingController = require('../controllers/trading.controller');
const { authenticate, requireKYC } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * Rotas de Trading
 * Prefixo: /api/v1/trading
 */

// Todas as rotas requerem autenticação e KYC aprovado
router.use(authenticate);
router.use(requireKYC);

// Rotas de ordens
router.post('/orders', tradingController.createOrder);
router.get('/orders', tradingController.getOrders);
router.get('/orders/:orderId', tradingController.getOrder);
router.delete('/orders/:orderId', tradingController.cancelOrder);

// Execução de ordem (paper trading)
router.post('/orders/:orderId/execute', tradingController.executeOrder);

module.exports = router;

