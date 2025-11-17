const Redis = require('ioredis');
const config = require('./environment');
const logger = require('../utils/logger');

/**
 * Cliente Redis para cache e pub/sub
 */
const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    logger.error('Redis reconnect on error:', err.message);
    return true;
  },
});

/**
 * Cliente Redis para Pub/Sub (conexão separada)
 */
const redisPubClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
});

/**
 * Cliente Redis para Subscriber (conexão separada)
 */
const redisSubClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
});

// Event listeners
redisClient.on('connect', () => {
  logger.info('✅ Redis client conectado');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis client pronto');
});

redisClient.on('error', (err) => {
  logger.error('❌ Erro no Redis client:', err);
});

redisClient.on('close', () => {
  logger.warn('⚠️ Redis client desconectado');
});

redisPubClient.on('connect', () => {
  logger.info('✅ Redis Pub client conectado');
});

redisSubClient.on('connect', () => {
  logger.info('✅ Redis Sub client conectado');
});

/**
 * Utilitários para operações comuns de cache
 */
const cacheUtils = {
  /**
   * Define um valor no cache com TTL opcional
   */
  async set(key, value, ttlSeconds = null) {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await redisClient.setex(key, ttlSeconds, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Erro ao definir cache para ${key}:`, error);
      return false;
    }
  },

  /**
   * Obtém um valor do cache
   */
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Erro ao obter cache para ${key}:`, error);
      return null;
    }
  },

  /**
   * Deleta uma chave do cache
   */
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error(`Erro ao deletar cache para ${key}:`, error);
      return false;
    }
  },

  /**
   * Deleta múltiplas chaves por padrão
   */
  async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error(`Erro ao deletar cache por padrão ${pattern}:`, error);
      return false;
    }
  },

  /**
   * Verifica se uma chave existe
   */
  async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Erro ao verificar existência de ${key}:`, error);
      return false;
    }
  },

  /**
   * Define TTL para uma chave existente
   */
  async expire(key, ttlSeconds) {
    try {
      await redisClient.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      logger.error(`Erro ao definir TTL para ${key}:`, error);
      return false;
    }
  },
};

/**
 * Fecha todas as conexões Redis
 */
const closeConnections = async () => {
  try {
    await redisClient.quit();
    await redisPubClient.quit();
    await redisSubClient.quit();
    logger.info('✅ Conexões Redis fechadas');
  } catch (error) {
    logger.error('❌ Erro ao fechar conexões Redis:', error);
  }
};

module.exports = {
  redisClient,
  redisPubClient,
  redisSubClient,
  cacheUtils,
  closeConnections,
};

