const { Sequelize } = require('sequelize');
const config = require('./environment');
const logger = require('../utils/logger');

/**
 * Configuração e inicialização do Sequelize para PostgreSQL
 */
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: config.database.pool,
    logging: config.database.logging,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    dialectOptions: {
      // Para TimescaleDB e extensões PostgreSQL
      application_name: 'investment-app-backend',
    },
  }
);

/**
 * Testa a conexão com o banco de dados
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexão com PostgreSQL estabelecida com sucesso');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao conectar com PostgreSQL:', error);
    return false;
  }
};

/**
 * Sincroniza os modelos com o banco de dados
 * ATENÇÃO: Usar apenas em desenvolvimento
 */
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    logger.info('✅ Modelos sincronizados com o banco de dados');
  } catch (error) {
    logger.error('❌ Erro ao sincronizar modelos:', error);
    throw error;
  }
};

/**
 * Fecha a conexão com o banco de dados
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('✅ Conexão com PostgreSQL fechada');
  } catch (error) {
    logger.error('❌ Erro ao fechar conexão:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  closeConnection,
};

