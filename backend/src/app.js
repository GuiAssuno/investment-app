const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config/environment');
const logger = require('./utils/logger');

/**
 * Configuração da aplicação Express
 */

const app = express();

// Middlewares de segurança
app.use(helmet());

// CORS
app.use(cors(config.cors));

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging HTTP
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API Routes
const authRoutes = require('./routes/auth.routes');
const marketRoutes = require('./routes/market.routes');
const tradingRoutes = require('./routes/trading.routes');
const portfolioRoutes = require('./routes/portfolio.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/trading', tradingRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

module.exports = app;

