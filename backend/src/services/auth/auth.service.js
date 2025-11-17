const User = require('../../models/User');
const { hashPassword, comparePassword, generateToken } = require('../../utils/encryption');
const jwtService = require('./jwt.service');
const { cacheUtils } = require('../../config/redis');
const logger = require('../../utils/logger');

/**
 * Serviço de Autenticação
 * Gerencia registro, login, logout e renovação de tokens
 */

/**
 * Registra um novo usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Promise<Object>} Usuário criado e tokens
 */
const register = async (userData) => {
  try {
    // Verificar se email já existe
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Verificar se CPF já existe
    const existingCPF = await User.findOne({ where: { cpf: userData.cpf } });
    if (existingCPF) {
      throw new Error('CPF já cadastrado');
    }

    // Hash da senha
    const passwordHash = await hashPassword(userData.password);

    // Criar usuário
    const user = await User.create({
      email: userData.email,
      password_hash: passwordHash,
      full_name: userData.full_name,
      cpf: userData.cpf,
      phone: userData.phone,
      date_of_birth: userData.date_of_birth,
      email_verification_token: generateToken(32),
    });

    // Gerar tokens
    const tokens = jwtService.generateTokenPair(user);

    // Salvar refresh token no banco
    await user.update({ refresh_token: tokens.refreshToken });

    logger.info(`Novo usuário registrado: ${user.email}`);

    return {
      user: user.toPublicJSON(),
      tokens,
    };
  } catch (error) {
    logger.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

/**
 * Realiza login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @param {string} ip - IP do cliente
 * @returns {Promise<Object>} Usuário e tokens
 */
const login = async (email, password, ip = null) => {
  try {
    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar se conta está bloqueada
    if (user.locked_until && new Date() < user.locked_until) {
      const minutesLeft = Math.ceil((user.locked_until - new Date()) / 60000);
      throw new Error(`Conta bloqueada. Tente novamente em ${minutesLeft} minutos`);
    }

    // Verificar se conta está ativa
    if (user.account_status !== 'active') {
      throw new Error('Conta inativa ou suspensa');
    }

    // Comparar senha
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      // Incrementar tentativas falhadas
      const failedAttempts = user.failed_login_attempts + 1;
      const updateData = { failed_login_attempts: failedAttempts };

      // Bloquear conta após 5 tentativas
      if (failedAttempts >= 5) {
        updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
        logger.warn(`Conta bloqueada por múltiplas tentativas: ${email}`);
      }

      await user.update(updateData);
      throw new Error('Credenciais inválidas');
    }

    // Reset tentativas falhadas
    await user.update({
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date(),
      last_login_ip: ip,
    });

    // Se 2FA está habilitado, retornar flag
    if (user.two_factor_enabled) {
      return {
        requires2FA: true,
        userId: user.id,
      };
    }

    // Gerar tokens
    const tokens = jwtService.generateTokenPair(user);

    // Salvar refresh token no banco
    await user.update({ refresh_token: tokens.refreshToken });

    // Cachear dados do usuário
    await cacheUtils.set(`user:${user.id}`, user.toPublicJSON(), 3600);

    logger.info(`Usuário autenticado: ${user.email}`);

    return {
      user: user.toPublicJSON(),
      tokens,
    };
  } catch (error) {
    logger.error('Erro ao fazer login:', error);
    throw error;
  }
};

/**
 * Realiza logout do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} Sucesso
 */
const logout = async (userId) => {
  try {
    // Remover refresh token do banco
    await User.update(
      { refresh_token: null },
      { where: { id: userId } }
    );

    // Remover cache do usuário
    await cacheUtils.del(`user:${userId}`);

    logger.info(`Usuário desconectado: ${userId}`);

    return true;
  } catch (error) {
    logger.error('Erro ao fazer logout:', error);
    throw error;
  }
};

/**
 * Renova access token usando refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} Novos tokens
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Verificar refresh token
    const decoded = jwtService.verifyRefreshToken(refreshToken);

    // Buscar usuário
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se refresh token corresponde ao armazenado
    if (user.refresh_token !== refreshToken) {
      throw new Error('Refresh token inválido');
    }

    // Verificar se conta está ativa
    if (user.account_status !== 'active') {
      throw new Error('Conta inativa ou suspensa');
    }

    // Gerar novos tokens
    const tokens = jwtService.generateTokenPair(user);

    // Atualizar refresh token no banco
    await user.update({ refresh_token: tokens.refreshToken });

    logger.info(`Token renovado para usuário: ${user.email}`);

    return {
      user: user.toPublicJSON(),
      tokens,
    };
  } catch (error) {
    logger.error('Erro ao renovar token:', error);
    throw error;
  }
};

/**
 * Solicita reset de senha
 * @param {string} email - Email do usuário
 * @returns {Promise<string>} Token de reset
 */
const requestPasswordReset = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Não revelar se o email existe
      logger.warn(`Tentativa de reset para email inexistente: ${email}`);
      return null;
    }

    // Gerar token de reset
    const resetToken = generateToken(32);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: resetExpires,
    });

    logger.info(`Reset de senha solicitado: ${email}`);

    return resetToken;
  } catch (error) {
    logger.error('Erro ao solicitar reset de senha:', error);
    throw error;
  }
};

/**
 * Reseta a senha usando token
 * @param {string} token - Token de reset
 * @param {string} newPassword - Nova senha
 * @returns {Promise<boolean>} Sucesso
 */
const resetPassword = async (token, newPassword) => {
  try {
    const user = await User.findOne({
      where: {
        password_reset_token: token,
      },
    });

    if (!user) {
      throw new Error('Token inválido');
    }

    // Verificar se token expirou
    if (new Date() > user.password_reset_expires) {
      throw new Error('Token expirado');
    }

    // Hash da nova senha
    const passwordHash = await hashPassword(newPassword);

    // Atualizar senha e limpar token
    await user.update({
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null,
      refresh_token: null, // Invalidar refresh tokens existentes
    });

    logger.info(`Senha resetada para usuário: ${user.email}`);

    return true;
  } catch (error) {
    logger.error('Erro ao resetar senha:', error);
    throw error;
  }
};

/**
 * Verifica email usando token
 * @param {string} token - Token de verificação
 * @returns {Promise<boolean>} Sucesso
 */
const verifyEmail = async (token) => {
  try {
    const user = await User.findOne({
      where: {
        email_verification_token: token,
      },
    });

    if (!user) {
      throw new Error('Token inválido');
    }

    await user.update({
      email_verified: true,
      email_verification_token: null,
    });

    logger.info(`Email verificado: ${user.email}`);

    return true;
  } catch (error) {
    logger.error('Erro ao verificar email:', error);
    throw error;
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
};

