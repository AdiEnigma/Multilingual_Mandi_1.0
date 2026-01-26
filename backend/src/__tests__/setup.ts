import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock Redis for tests
jest.mock('@/config/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    ttl: jest.fn(),
    sadd: jest.fn(),
    srem: jest.fn(),
    smembers: jest.fn(),
    expire: jest.fn(),
  },
  connectRedis: jest.fn().mockResolvedValue(undefined),
}));

// Mock logger for tests
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock environment validation
jest.mock('@/config/env', () => ({
  validateEnv: jest.fn().mockReturnValue({
    NODE_ENV: 'test',
    PORT: 8000,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes-only',
    JWT_EXPIRES_IN: '7d',
    AZURE_TRANSLATOR_KEY: 'test-key',
    AZURE_TRANSLATOR_REGION: 'test-region',
    OPENAI_API_KEY: 'test-key',
    FRONTEND_URL: 'http://localhost:3000',
    BACKEND_URL: 'http://localhost:8000',
    RATE_LIMIT_WINDOW_MS: 900000,
    RATE_LIMIT_MAX_REQUESTS: 100,
  }),
  getEnv: jest.fn().mockReturnValue({
    NODE_ENV: 'test',
    PORT: 8000,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes-only',
    JWT_EXPIRES_IN: '7d',
    AZURE_TRANSLATOR_KEY: 'test-key',
    AZURE_TRANSLATOR_REGION: 'test-region',
    OPENAI_API_KEY: 'test-key',
    FRONTEND_URL: 'http://localhost:3000',
    BACKEND_URL: 'http://localhost:8000',
    RATE_LIMIT_WINDOW_MS: 900000,
    RATE_LIMIT_MAX_REQUESTS: 100,
  }),
}));

// Mock cleanup job
jest.mock('@/jobs/cleanup', () => ({
  cleanupJob: {
    start: jest.fn(),
    stop: jest.fn(),
    runManualCleanup: jest.fn(),
  },
}));

// Mock socket handlers
jest.mock('@/sockets', () => ({
  initializeSocketHandlers: jest.fn(),
}));

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});