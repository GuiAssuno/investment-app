const Queue = require('bull');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Configuração de Filas (Bull Queue)
 * Gerencia tarefas assíncronas e jobs em background
 */

/**
 * Configuração padrão para filas
 */
const defaultQueueOptions = {
  redis: config.bull.redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};

/**
 * Fila de emails
 */
const emailQueue = new Queue('email', defaultQueueOptions);

/**
 * Fila de notificações
 */
const notificationQueue = new Queue('notification', defaultQueueOptions);

/**
 * Fila de atualização de cotações
 */
const marketDataQueue = new Queue('market-data', {
  ...defaultQueueOptions,
  defaultJobOptions: {
    ...defaultQueueOptions.defaultJobOptions,
    repeat: {
      every: 30000, // A cada 30 segundos
    },
  },
});

/**
 * Fila de processamento de ordens
 */
const orderProcessingQueue = new Queue('order-processing', defaultQueueOptions);

/**
 * Fila de cálculo de portfólio
 */
const portfolioCalculationQueue = new Queue('portfolio-calculation', defaultQueueOptions);

// Event listeners para monitoramento
const setupQueueListeners = (queue, queueName) => {
  queue.on('completed', (job, result) => {
    logger.info(`[${queueName}] Job ${job.id} completado`);
  });

  queue.on('failed', (job, err) => {
    logger.error(`[${queueName}] Job ${job.id} falhou:`, err);
  });

  queue.on('error', (error) => {
    logger.error(`[${queueName}] Erro na fila:`, error);
  });

  queue.on('waiting', (jobId) => {
    logger.debug(`[${queueName}] Job ${jobId} aguardando`);
  });

  queue.on('active', (job) => {
    logger.debug(`[${queueName}] Job ${job.id} ativo`);
  });

  queue.on('stalled', (job) => {
    logger.warn(`[${queueName}] Job ${job.id} travado`);
  });
};

// Configurar listeners
setupQueueListeners(emailQueue, 'email');
setupQueueListeners(notificationQueue, 'notification');
setupQueueListeners(marketDataQueue, 'market-data');
setupQueueListeners(orderProcessingQueue, 'order-processing');
setupQueueListeners(portfolioCalculationQueue, 'portfolio-calculation');

/**
 * Fecha todas as filas
 */
const closeQueues = async () => {
  try {
    await Promise.all([
      emailQueue.close(),
      notificationQueue.close(),
      marketDataQueue.close(),
      orderProcessingQueue.close(),
      portfolioCalculationQueue.close(),
    ]);
    logger.info('✅ Todas as filas fechadas');
  } catch (error) {
    logger.error('❌ Erro ao fechar filas:', error);
  }
};

module.exports = {
  emailQueue,
  notificationQueue,
  marketDataQueue,
  orderProcessingQueue,
  portfolioCalculationQueue,
  closeQueues,
};

