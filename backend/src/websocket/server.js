const { Server } = require('socket.io');
const jwtService = require('../services/auth/jwt.service');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Servidor WebSocket
 * Gerencia conexões em tempo real com clientes
 */

let io = null;

/**
 * Inicializa o servidor Socket.IO
 * @param {Object} httpServer - Servidor HTTP
 * @returns {Object} Instância do Socket.IO
 */
const initializeWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware de autenticação
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Token não fornecido'));
      }

      // Verificar token
      const decoded = jwtService.verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;

      logger.info(`WebSocket: Usuário autenticado - ${socket.userEmail}`);
      next();
    } catch (error) {
      logger.error('WebSocket: Erro na autenticação:', error);
      next(new Error('Autenticação falhou'));
    }
  });

  // Evento de conexão
  io.on('connection', (socket) => {
    logger.info(`WebSocket: Cliente conectado - ${socket.id} (${socket.userEmail})`);

    // Adicionar usuário à sala pessoal
    socket.join(`user:${socket.userId}`);

    // Enviar mensagem de boas-vindas
    socket.emit('connected', {
      message: 'Conectado ao servidor WebSocket',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    // Handler: Inscrever em canal de cotações
    socket.on('subscribe:quotes', (data) => {
      const { symbols } = data;
      if (!symbols || !Array.isArray(symbols)) {
        socket.emit('error', { message: 'Símbolos inválidos' });
        return;
      }

      symbols.forEach(symbol => {
        const room = `quotes:${symbol}`;
        socket.join(room);
        logger.info(`WebSocket: ${socket.userEmail} inscrito em ${room}`);
      });

      socket.emit('subscribed:quotes', { symbols });
    });

    // Handler: Cancelar inscrição em canal de cotações
    socket.on('unsubscribe:quotes', (data) => {
      const { symbols } = data;
      if (!symbols || !Array.isArray(symbols)) {
        socket.emit('error', { message: 'Símbolos inválidos' });
        return;
      }

      symbols.forEach(symbol => {
        const room = `quotes:${symbol}`;
        socket.leave(room);
        logger.info(`WebSocket: ${socket.userEmail} desinscrito de ${room}`);
      });

      socket.emit('unsubscribed:quotes', { symbols });
    });

    // Handler: Inscrever em atualizações de ordens
    socket.on('subscribe:orders', () => {
      const room = `orders:${socket.userId}`;
      socket.join(room);
      logger.info(`WebSocket: ${socket.userEmail} inscrito em atualizações de ordens`);
      socket.emit('subscribed:orders');
    });

    // Handler: Cancelar inscrição em atualizações de ordens
    socket.on('unsubscribe:orders', () => {
      const room = `orders:${socket.userId}`;
      socket.leave(room);
      logger.info(`WebSocket: ${socket.userEmail} desinscrito de atualizações de ordens`);
      socket.emit('unsubscribed:orders');
    });

    // Handler: Inscrever em atualizações de portfólio
    socket.on('subscribe:portfolio', () => {
      const room = `portfolio:${socket.userId}`;
      socket.join(room);
      logger.info(`WebSocket: ${socket.userEmail} inscrito em atualizações de portfólio`);
      socket.emit('subscribed:portfolio');
    });

    // Handler: Ping/Pong para heartbeat
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Evento de desconexão
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket: Cliente desconectado - ${socket.id} (${socket.userEmail}) - Razão: ${reason}`);
    });

    // Evento de erro
    socket.on('error', (error) => {
      logger.error(`WebSocket: Erro no socket ${socket.id}:`, error);
    });
  });

  logger.info('✅ Servidor WebSocket inicializado');

  return io;
};

/**
 * Obtém instância do Socket.IO
 * @returns {Object} Instância do Socket.IO
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO não foi inicializado');
  }
  return io;
};

/**
 * Emite atualização de cotação para todos os inscritos
 * @param {string} symbol - Símbolo do ativo
 * @param {Object} data - Dados da cotação
 */
const emitQuoteUpdate = (symbol, data) => {
  if (!io) return;

  const room = `quotes:${symbol}`;
  io.to(room).emit('quote:update', {
    symbol,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emite atualização de ordem para um usuário
 * @param {string} userId - ID do usuário
 * @param {Object} orderData - Dados da ordem
 */
const emitOrderUpdate = (userId, orderData) => {
  if (!io) return;

  const room = `orders:${userId}`;
  io.to(room).emit('order:update', {
    data: orderData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emite atualização de portfólio para um usuário
 * @param {string} userId - ID do usuário
 * @param {Object} portfolioData - Dados do portfólio
 */
const emitPortfolioUpdate = (userId, portfolioData) => {
  if (!io) return;

  const room = `portfolio:${userId}`;
  io.to(room).emit('portfolio:update', {
    data: portfolioData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emite notificação para um usuário
 * @param {string} userId - ID do usuário
 * @param {Object} notification - Dados da notificação
 */
const emitNotification = (userId, notification) => {
  if (!io) return;

  const room = `user:${userId}`;
  io.to(room).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast de mensagem para todos os clientes
 * @param {string} event - Nome do evento
 * @param {Object} data - Dados a enviar
 */
const broadcast = (event, data) => {
  if (!io) return;

  io.emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  initializeWebSocket,
  getIO,
  emitQuoteUpdate,
  emitOrderUpdate,
  emitPortfolioUpdate,
  emitNotification,
  broadcast,
};

