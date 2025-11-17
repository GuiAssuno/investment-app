const http = require('http');
const app = require('./app');
const config = require('./config/environment');
const { testConnection, syncDatabase } = require('./config/database');
const { redisClient } = require('./config/redis');
const { initializeWebSocket } = require('./websocket/server');
const logger = require('./utils/logger');

/**
 * Servidor principal da aplicação
 */

// Criar servidor HTTP
const server = http.createServer(app);

// Inicializar WebSocket
initializeWebSocket(server);

/**
 * Inicializa a aplicação
 */
const startServer = async () => {
  try {
    // Testar conexão com PostgreSQL
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Falha ao conectar com PostgreSQL');
    }

    // Sincronizar modelos (apenas em desenvolvimento)
    if (config.env === 'development') {
      await syncDatabase({ alter: true });
      logger.info('✅ Modelos sincronizados com o banco de dados');
    }

    // Testar conexão com Redis
    await redisClient.ping();
    logger.info('✅ Conexão com Redis estabelecida');

    // Iniciar servidor
    server.listen(config.port, () => {
      logger.info(`🚀 Servidor rodando na porta ${config.port}`);
      logger.info(`📡 Ambiente: ${config.env}`);
      logger.info(`🔗 API: http://localhost:${config.port}/api/v1`);
      logger.info(`🔌 WebSocket: ws://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} recebido. Encerrando servidor...`);

  server.close(async () => {
    logger.info('Servidor HTTP fechado');

    try {
      const { closeConnection } = require('./config/database');
      const { closeConnections } = require('./config/redis');

      await closeConnection();
      await closeConnections();

      logger.info('✅ Aplicação encerrada com sucesso');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Erro ao encerrar aplicação:', error);
      process.exit(1);
    }
  });

  // Forçar encerramento após 10 segundos
  setTimeout(() => {
    logger.error('⚠️ Forçando encerramento...');
    process.exit(1);
  }, 10000);
};

// Handlers de sinais
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handler de erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Iniciar servidor
startServer();

