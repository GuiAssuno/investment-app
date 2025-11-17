/**
 * Constantes da aplicação
 */

// Status do mercado
export const MARKET_STATUS = {
  CLOSED: 'closed',
  OPEN: 'open',
  PRE_MARKET: 'pre_market',
  AFTER_HOURS: 'after_hours',
};

// Tipos de ordem
export const ORDER_TYPES = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP: 'stop',
  STOP_LIMIT: 'stop_limit',
};

// Lados da ordem
export const ORDER_SIDES = {
  BUY: 'buy',
  SELL: 'sell',
};

// Status da ordem
export const ORDER_STATUS = {
  PENDING: 'pending',
  FILLED: 'filled',
  PARTIALLY_FILLED: 'partially_filled',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

// Tipos de ativos
export const ASSET_TYPES = {
  STOCK: 'stock',
  ETF: 'etf',
  REIT: 'reit', // FII
  BDR: 'bdr',
  OPTION: 'option',
  FUTURE: 'future',
  BOND: 'bond',
  CRYPTO: 'crypto',
};

// Setores do mercado
export const MARKET_SECTORS = {
  TECHNOLOGY: 'technology',
  FINANCE: 'finance',
  HEALTHCARE: 'healthcare',
  ENERGY: 'energy',
  UTILITIES: 'utilities',
  MATERIALS: 'materials',
  INDUSTRIALS: 'industrials',
  CONSUMER_DISCRETIONARY: 'consumer_discretionary',
  CONSUMER_STAPLES: 'consumer_staples',
  REAL_ESTATE: 'real_estate',
  TELECOMMUNICATIONS: 'telecommunications',
};

// Intervalos de tempo para gráficos
export const TIME_INTERVALS = {
  '1m': { label: '1 min', value: '1m', seconds: 60 },
  '5m': { label: '5 min', value: '5m', seconds: 300 },
  '15m': { label: '15 min', value: '15m', seconds: 900 },
  '30m': { label: '30 min', value: '30m', seconds: 1800 },
  '1h': { label: '1 hora', value: '1h', seconds: 3600 },
  '4h': { label: '4 horas', value: '4h', seconds: 14400 },
  '1d': { label: '1 dia', value: '1d', seconds: 86400 },
  '1w': { label: '1 semana', value: '1w', seconds: 604800 },
  '1M': { label: '1 mês', value: '1M', seconds: 2592000 },
};

// Períodos para análise
export const TIME_PERIODS = {
  '1D': { label: '1 Dia', value: '1D' },
  '5D': { label: '5 Dias', value: '5D' },
  '1M': { label: '1 Mês', value: '1M' },
  '3M': { label: '3 Meses', value: '3M' },
  '6M': { label: '6 Meses', value: '6M' },
  '1Y': { label: '1 Ano', value: '1Y' },
  '2Y': { label: '2 Anos', value: '2Y' },
  '5Y': { label: '5 Anos', value: '5Y' },
  'MAX': { label: 'Máximo', value: 'MAX' },
};

// Tipos de gráfico
export const CHART_TYPES = {
  CANDLESTICK: 'candlestick',
  LINE: 'line',
  AREA: 'area',
  BAR: 'bar',
  VOLUME: 'volume',
};

// Indicadores técnicos
export const TECHNICAL_INDICATORS = {
  SMA: { label: 'SMA', value: 'sma', name: 'Média Móvel Simples' },
  EMA: { label: 'EMA', value: 'ema', name: 'Média Móvel Exponencial' },
  RSI: { label: 'RSI', value: 'rsi', name: 'Índice de Força Relativa' },
  MACD: { label: 'MACD', value: 'macd', name: 'MACD' },
  BOLLINGER: { label: 'Bollinger', value: 'bollinger', name: 'Bandas de Bollinger' },
  STOCHASTIC: { label: 'Stochastic', value: 'stochastic', name: 'Estocástico' },
  VOLUME: { label: 'Volume', value: 'volume', name: 'Volume' },
};

// Configurações de WebSocket
export const WEBSOCKET_CONFIG = {
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 30000,
};

// Configurações de API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Configurações de paginação
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Limites de trading
export const TRADING_LIMITS = {
  MIN_ORDER_VALUE: 100, // R$ 100
  MAX_ORDER_VALUE: 1000000, // R$ 1M
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999999,
};

// Horários do mercado B3
export const MARKET_HOURS = {
  PRE_MARKET_START: '09:00',
  MARKET_OPEN: '10:00',
  MARKET_CLOSE: '17:30',
  AFTER_HOURS_END: '18:00',
  TIMEZONE: 'America/Sao_Paulo',
};

// Configurações de notificação
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Temas disponíveis
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Idiomas suportados
export const LANGUAGES = {
  PT_BR: 'pt-BR',
  EN_US: 'en-US',
};

// Configurações de localStorage
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  WATCHLIST: 'watchlist',
  PORTFOLIO: 'portfolio',
  TRADING_SETTINGS: 'trading_settings',
  CHART_SETTINGS: 'chart_settings',
};

// Regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  TICKER: /^[A-Z]{4}\d{1,2}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// URLs externas
export const EXTERNAL_URLS = {
  B3_WEBSITE: 'https://www.b3.com.br',
  CVM_WEBSITE: 'https://www.gov.br/cvm',
  ANBIMA_WEBSITE: 'https://www.anbima.com.br',
  HELP_CENTER: 'https://help.investmentapp.com',
  PRIVACY_POLICY: 'https://investmentapp.com/privacy',
  TERMS_OF_SERVICE: 'https://investmentapp.com/terms',
};

export default {
  MARKET_STATUS,
  ORDER_TYPES,
  ORDER_SIDES,
  ORDER_STATUS,
  ASSET_TYPES,
  MARKET_SECTORS,
  TIME_INTERVALS,
  TIME_PERIODS,
  CHART_TYPES,
  TECHNICAL_INDICATORS,
  WEBSOCKET_CONFIG,
  API_CONFIG,
  PAGINATION_CONFIG,
  TRADING_LIMITS,
  MARKET_HOURS,
  NOTIFICATION_TYPES,
  THEMES,
  LANGUAGES,
  STORAGE_KEYS,
  REGEX_PATTERNS,
  EXTERNAL_URLS,
};
