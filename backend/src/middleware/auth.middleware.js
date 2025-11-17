const jwtService = require('../services/auth/jwt.service');
const { cacheUtils } = require('../config/redis');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware de Autenticação
 * Verifica e valida tokens JWT
 */

/**
 * Middleware para verificar autenticação
 */
const authenticate = async (req, res, next) => {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      });
    }

    // Verificar token
    const decoded = jwtService.verifyAccessToken(token);

    // Tentar obter usuário do cache
    let user = await cacheUtils.get(`user:${decoded.id}`);

    // Se não estiver no cache, buscar no banco
    if (!user) {
      const userModel = await User.findByPk(decoded.id);
      if (!userModel) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado',
        });
      }

      user = userModel.toPublicJSON();
      // Cachear por 1 hora
      await cacheUtils.set(`user:${decoded.id}`, user, 3600);
    }

    // Verificar se conta está ativa
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Conta inativa ou suspensa',
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Erro no middleware de autenticação:', error);

    if (error.message === 'Token expirado') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Não falha se o token não estiver presente
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return next();
    }

    const decoded = jwtService.verifyAccessToken(token);
    let user = await cacheUtils.get(`user:${decoded.id}`);

    if (!user) {
      const userModel = await User.findByPk(decoded.id);
      if (userModel) {
        user = userModel.toPublicJSON();
        await cacheUtils.set(`user:${decoded.id}`, user, 3600);
      }
    }

    if (user && user.account_status === 'active') {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    // Ignorar erros e continuar sem autenticação
    next();
  }
};

/**
 * Middleware para verificar KYC aprovado
 */
const requireKYC = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária',
    });
  }

  if (req.user.kyc_status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'KYC não aprovado',
      code: 'KYC_NOT_APPROVED',
    });
  }

  next();
};

/**
 * Middleware para verificar email verificado
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária',
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      message: 'Email não verificado',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  next();
};

/**
 * Middleware para verificar roles/permissões
 * @param {Array<string>} allowedRoles - Roles permitidas
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária',
      });
    }

    // TODO: Implementar sistema de roles
    // Por enquanto, apenas admin
    if (!allowedRoles.includes(req.user.role || 'user')) {
      return res.status(403).json({
        success: false,
        message: 'Permissão negada',
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireKYC,
  requireEmailVerified,
  requireRole,
};

