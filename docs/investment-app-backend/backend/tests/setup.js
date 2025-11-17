/**
 * Setup para testes com Jest
 */

// Configurar timeout global
jest.setTimeout(10000);

// Mock de variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.DB_NAME = 'investment_app_test';

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

