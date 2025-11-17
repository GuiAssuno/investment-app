const authService = require('../services/auth/auth.service');
const twoFAService = require('../services/auth/2fa.service');
const jwtService = require('../services/auth/jwt.service');
const logger = require('../utils/logger');

/**
 * Controller de Autenticação
 * Gerencia requisições HTTP relacionadas à autenticação
 */

/**
 * Registra novo usuário
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, full_name, cpf, phone, date_of_birth } = req.body;

    const result = await authService.register({
      email,
      password,
      full_name,
      cpf,
      phone,
      date_of_birth,
    });

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: result,
    });
  } catch (error) {
    logger.error('Erro no controller de registro:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao registrar usuário',
    });
  }
};

/**
 * Realiza login
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // --- INÍCIO DA MODIFICAÇÃO PARA O USUÁRIO DE TESTE ---
    if (email === 'adm@adm.test' && password === 'adm123') {
      logger.info('Tentativa de login com usuário administrador de teste.');

      // 1. Simula um objeto de usuário que o front-end espera
      const adminUser = {
        id: '000-admin-id-000',
        full_name: 'Administrador',
        email: 'adm@adm.test',
        // Adicione outros campos se o front-end precisar
      };

      // 2. Gera um par de tokens para o admin
      const tokens = jwtService.generateTokenPair(adminUser);

      // 3. Retorna a resposta de sucesso, pulando a verificação no banco de dados
      return res.status(200).json({
        success: true,
        message: 'Login de administrador realizado com sucesso',
        data: {
          user: adminUser,
          tokens: tokens, 
        },
      });
    }

    const result = await authService.login(email, password, ip);

    // Se requer 2FA
    if (result.requires2FA) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        userId: result.userId,
        message: 'Código 2FA necessário',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: result,
    });
  } catch (error) {
    logger.error('Erro no controller de login:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Erro ao fazer login',
    });
  }
};

/**
 * Verifica 2FA e completa login
 * POST /api/v1/auth/verify-2fa
 */
const verify2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const isValid = await twoFAService.verifyToken(userId, token);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Token 2FA inválido',
      });
    }

    // Buscar usuário e gerar tokens
    const User = require('../models/User');
    const user = await User.findByPk(userId);

    const tokens = jwtService.generateTokenPair(user);
    await user.update({ refresh_token: tokens.refreshToken });

    res.status(200).json({
      success: true,
      message: 'Autenticação 2FA bem-sucedida',
      data: {
        user: user.toPublicJSON(),
        tokens,
      },
    });
  } catch (error) {
    logger.error('Erro ao verificar 2FA:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Erro ao verificar 2FA',
    });
  }
};

/**
 * Realiza logout
 * POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    await authService.logout(userId);

    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    logger.error('Erro no controller de logout:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao fazer logout',
    });
  }
};

/**
 * Renova access token
 * POST /api/v1/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token renovado com sucesso',
      data: result,
    });
  } catch (error) {
    logger.error('Erro ao renovar token:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Erro ao renovar token',
    });
  }
};

/**
 * Solicita reset de senha
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    // Sempre retornar sucesso para não revelar se o email existe
    res.status(200).json({
      success: true,
      message: 'Se o email existir, um link de reset será enviado',
    });
  } catch (error) {
    logger.error('Erro ao solicitar reset de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar solicitação',
    });
  }
};

/**
 * Reseta senha
 * POST /api/v1/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Senha resetada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao resetar senha:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao resetar senha',
    });
  }
};

/**
 * Verifica email
 * POST /api/v1/auth/verify-email
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    await authService.verifyEmail(token);

    res.status(200).json({
      success: true,
      message: 'Email verificado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao verificar email:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao verificar email',
    });
  }
};

/**
 * Obtém perfil do usuário autenticado
 * GET /api/v1/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: user.toPublicJSON(),
    });
  } catch (error) {
    logger.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter perfil',
    });
  }
};

/**
 * Gera secret para 2FA
 * POST /api/v1/auth/2fa/generate
 */
const generate2FASecret = async (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;

    const result = await twoFAService.generateSecret(userId, email);

    res.status(200).json({
      success: true,
      message: 'Secret 2FA gerado com sucesso',
      data: result,
    });
  } catch (error) {
    logger.error('Erro ao gerar secret 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar secret 2FA',
    });
  }
};

/**
 * Habilita 2FA
 * POST /api/v1/auth/2fa/enable
 */
const enable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { secret, token } = req.body;

    await twoFAService.enable2FA(userId, secret, token);

    res.status(200).json({
      success: true,
      message: '2FA habilitado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao habilitar 2FA:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao habilitar 2FA',
    });
  }
};

/**
 * Desabilita 2FA
 * POST /api/v1/auth/2fa/disable
 */
const disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    await twoFAService.disable2FA(userId, token);

    res.status(200).json({
      success: true,
      message: '2FA desabilitado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao desabilitar 2FA:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao desabilitar 2FA',
    });
  }
};

module.exports = {
  register,
  login,
  verify2FA,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getProfile,
  generate2FASecret,
  enable2FA,
  disable2FA,
};

