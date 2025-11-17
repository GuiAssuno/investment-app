const jwt = require('jsonwebtoken');
const config = require('../../config/environment');
const logger = require('../../utils/logger');

/**
 * Serviço de JWT (JSON Web Token)
 * Gerencia criação, verificação e renovação de tokens
 */

/**
 * Gera access token JWT
 * @param {Object} payload - Dados do usuário
 * @returns {string} Token JWT
 */
const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        type: 'access',
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
        issuer: 'investment-app',
        audience: 'investment-app-users',
      }
    );
    
    return token;
  } catch (error) {
    logger.error('Erro ao gerar access token:', error);
    throw new Error('Falha ao gerar token de acesso');
  }
};

/**
 * Gera refresh token JWT
 * @param {Object} payload - Dados do usuário
 * @returns {string} Refresh token JWT
 */
const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        type: 'refresh',
      },
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: 'investment-app',
        audience: 'investment-app-users',
      }
    );
    
    return token;
  } catch (error) {
    logger.error('Erro ao gerar refresh token:', error);
    throw new Error('Falha ao gerar refresh token');
  }
};

/**
 * Gera par de tokens (access + refresh)
 * @param {Object} user - Objeto do usuário
 * @returns {Object} Objeto com accessToken e refreshToken
 */
const generateTokenPair = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  };
  
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verifica e decodifica access token
 * @param {string} token - Token JWT
 * @returns {Object} Payload decodificado
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'investment-app',
      audience: 'investment-app-users',
    });
    
    if (decoded.type !== 'access') {
      throw new Error('Token inválido: tipo incorreto');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    throw error;
  }
};

/**
 * Verifica e decodifica refresh token
 * @param {string} token - Refresh token JWT
 * @returns {Object} Payload decodificado
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'investment-app',
      audience: 'investment-app-users',
    });
    
    if (decoded.type !== 'refresh') {
      throw new Error('Token inválido: tipo incorreto');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Refresh token inválido');
    }
    throw error;
  }
};

/**
 * Decodifica token sem verificar assinatura
 * @param {string} token - Token JWT
 * @returns {Object} Payload decodificado
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Erro ao decodificar token:', error);
    return null;
  }
};

/**
 * Verifica se o token está expirado
 * @param {string} token - Token JWT
 * @returns {boolean} True se expirado
 */
const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Extrai token do header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token ou null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  extractTokenFromHeader,
};

