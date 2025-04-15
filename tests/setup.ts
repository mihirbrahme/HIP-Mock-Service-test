import type { Config } from '@jest/types';
import { jest } from '@jest/globals';

declare global {
  namespace NodeJS {
    interface Global {
      console: Console;
    }
  }
}

// Set timezone for consistent date handling in tests
process.env.TZ = 'UTC';

// Configure Jest timeout (30 seconds)
const config: Config.InitialOptions = {
  testTimeout: 30000,
};
jest.setTimeout(config.testTimeout);

// Global mocks
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRY = '1h';
process.env.REFRESH_TOKEN_EXPIRY = '7d';

// Global beforeAll hook
beforeAll(() => {
  // Add any global setup here
});

// Global afterAll hook
afterAll(() => {
  // Clean up any global resources
  jest.clearAllMocks();
});

// Global beforeEach hook
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

// Clean up after each test
afterEach((): void => {
  jest.clearAllMocks();
  jest.resetModules();
});

// Mock console.error to keep test output clean
console.error = jest.fn();

// Export common test utilities
export const mockRequest = () => {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
  };
};

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = jest.fn();