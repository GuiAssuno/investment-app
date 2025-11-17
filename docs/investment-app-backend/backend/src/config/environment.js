require('dotenv').config();

/**
 * Configurações de ambiente da aplicação
 * Centraliza todas as variáveis de ambiente em um único local
 */
module.exports = {
  // Ambiente
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  wsPort: parseInt(process.env.WS_PORT, 10) || 3001,
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'investment_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // 2FA
  twoFactor: {
    appName: process.env.TWO_FACTOR_APP_NAME || 'Investment App B3',
  },
  
  // Analytics Engine
  analyticsEngine: {
    url: process.env.ANALYTICS_ENGINE_URL || 'http://localhost:5000',
  },
  
  // B3 Integration
  b3: {
    apiUrl: process.env.B3_API_URL || 'https://api.b3.com.br',
    apiKey: process.env.B3_API_KEY,
    apiSecret: process.env.B3_API_SECRET,
    pumaUrl: process.env.PUMA_TRADING_URL || 'https://puma.b3.com.br',
    pumaUsername: process.env.PUMA_USERNAME,
    pumaPassword: process.env.PUMA_PASSWORD,
  },
  
  // SERPRO (KYC)
  serpro: {
    apiUrl: process.env.SERPRO_API_URL || 'https://gateway.apiserpro.serpro.gov.br',
    apiKey: process.env.SERPRO_API_KEY,
  },
  
  // PIX
  pix: {
    apiUrl: process.env.PIX_API_URL || 'https://api.bcb.gov.br/pix',
    clientId: process.env.PIX_CLIENT_ID,
    clientSecret: process.env.PIX_CLIENT_SECRET,
  },
  
  // Tesouro Direto
  tesouroDireto: {
    url: process.env.TESOURO_DIRETO_URL || 'https://www.tesourodireto.com.br/api',
    apiKey: process.env.TESOURO_DIRETO_API_KEY,
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: true,
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },
  
  // Bull Queue
  bull: {
    redis: {
      host: process.env.BULL_REDIS_HOST || 'localhost',
      port: parseInt(process.env.BULL_REDIS_PORT, 10) || 6379,
    },
  },
  
  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@investmentapp.com',
  },
  
  // Market Data Provider
  marketData: {
    provider: process.env.MARKET_DATA_PROVIDER || 'brapi',
    brapi: {
      url: process.env.BRAPI_API_URL || 'https://brapi.dev/api',
      apiKey: process.env.BRAPI_API_KEY,
    },
  },
  
  // WebSocket
  websocket: {
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL, 10) || 30000,
    reconnectAttempts: parseInt(process.env.WS_RECONNECT_ATTEMPTS, 10) || 5,
    reconnectDelay: parseInt(process.env.WS_RECONNECT_DELAY, 10) || 3000,
  },
  
  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  },
  
  // Feature Flags
  features: {
    enable2FA: process.env.ENABLE_2FA === 'true',
    enableKYC: process.env.ENABLE_KYC_VERIFICATION === 'true',
    enablePaperTrading: process.env.ENABLE_PAPER_TRADING === 'true',
    enableAnalyticsEngine: process.env.ENABLE_ANALYTICS_ENGINE === 'true',
  },
};

