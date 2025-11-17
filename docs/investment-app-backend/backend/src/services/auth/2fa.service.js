const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../../models/User');
const config = require('../../config/environment');
const logger = require('../../utils/logger');

/**
 * Serviço de Autenticação de Dois Fatores (2FA)
 * Gerencia configuração e verificação de TOTP
 */

/**
 * Gera secret para 2FA
 * @param {string} userId - ID do usuário
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} Secret e QR Code
 */
const generateSecret = async (userId, email) => {
  try {
    // Gerar secret
    const secret = speakeasy.generateSecret({
      name: `${config.twoFactor.appName} (${email})`,
      issuer: config.twoFactor.appName,
      length: 32,
    });

    // Gerar QR Code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    logger.info(`2FA secret gerado para usuário: ${userId}`);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauthUrl: secret.otpauth_url,
    };
  } catch (error) {
    logger.error('Erro ao gerar secret 2FA:', error);
    throw error;
  }
};

/**
 * Habilita 2FA para um usuário
 * @param {string} userId - ID do usuário
 * @param {string} secret - Secret gerado
 * @param {string} token - Token TOTP para verificação
 * @returns {Promise<boolean>} Sucesso
 */
const enable2FA = async (userId, secret, token) => {
  try {
    // Verificar token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Aceitar tokens de até 2 períodos antes/depois
    });

    if (!isValid) {
      throw new Error('Token inválido');
    }

    // Atualizar usuário
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await user.update({
      two_factor_enabled: true,
      two_factor_secret: secret,
    });

    logger.info(`2FA habilitado para usuário: ${userId}`);

    return true;
  } catch (error) {
    logger.error('Erro ao habilitar 2FA:', error);
    throw error;
  }
};

/**
 * Desabilita 2FA para um usuário
 * @param {string} userId - ID do usuário
 * @param {string} token - Token TOTP para verificação
 * @returns {Promise<boolean>} Sucesso
 */
const disable2FA = async (userId, token) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!user.two_factor_enabled) {
      throw new Error('2FA não está habilitado');
    }

    // Verificar token
    const isValid = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new Error('Token inválido');
    }

    // Desabilitar 2FA
    await user.update({
      two_factor_enabled: false,
      two_factor_secret: null,
    });

    logger.info(`2FA desabilitado para usuário: ${userId}`);

    return true;
  } catch (error) {
    logger.error('Erro ao desabilitar 2FA:', error);
    throw error;
  }
};

/**
 * Verifica token TOTP
 * @param {string} userId - ID do usuário
 * @param {string} token - Token TOTP
 * @returns {Promise<boolean>} Token válido
 */
const verifyToken = async (userId, token) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!user.two_factor_enabled) {
      throw new Error('2FA não está habilitado');
    }

    // Verificar token
    const isValid = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      logger.warn(`Token 2FA inválido para usuário: ${userId}`);
      return false;
    }

    logger.info(`Token 2FA verificado para usuário: ${userId}`);
    return true;
  } catch (error) {
    logger.error('Erro ao verificar token 2FA:', error);
    throw error;
  }
};

/**
 * Gera códigos de backup
 * @param {number} count - Número de códigos
 * @returns {Array<string>} Códigos de backup
 */
const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Gerar código de 8 dígitos
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
};

module.exports = {
  generateSecret,
  enable2FA,
  disable2FA,
  verifyToken,
  generateBackupCodes,
};

