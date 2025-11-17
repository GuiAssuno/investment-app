const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * Rotas de Autenticação
 * Prefixo: /api/v1/auth
 */

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-2fa', authController.verify2FA);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Rotas protegidas (requerem autenticação)
router.use(authenticate);

router.get('/profile', authController.getProfile);
router.post('/logout', authController.logout);

// Rotas de 2FA
router.post('/2fa/generate', authController.generate2FASecret);
router.post('/2fa/enable', authController.enable2FA);
router.post('/2fa/disable', authController.disable2FA);

module.exports = router;

