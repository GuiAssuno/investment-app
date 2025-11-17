const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const config = require('../config/environment');

/**
 * Formato customizado para logs
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

/**
 * Transporte para arquivo rotativo (erros)
 */
const errorFileTransport = new DailyRotateFile({
  filename: `${config.logging.filePath}/error-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d',
  format: customFormat,
});

/**
 * Transporte para arquivo rotativo (todos os logs)
 */
const combinedFileTransport = new DailyRotateFile({
  filename: `${config.logging.filePath}/combined-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: customFormat,
});

/**
 * Transporte para console (desenvolvimento)
 */
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      if (stack) {
        return `${timestamp} ${level}: ${message}\n${stack}`;
      }
      return `${timestamp} ${level}: ${message}`;
    })
  ),
});

/**
 * Configuração do logger
 */
const logger = winston.createLogger({
  level: config.logging.level,
  format: customFormat,
  transports: [
    errorFileTransport,
    combinedFileTransport,
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: `${config.logging.filePath}/exceptions-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: `${config.logging.filePath}/rejections-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// Adicionar console transport em desenvolvimento
if (config.env === 'development') {
  logger.add(consoleTransport);
}

/**
 * Stream para Morgan (HTTP logging)
 */
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;

