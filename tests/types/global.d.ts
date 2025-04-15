declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    JWT_EXPIRATION: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

declare module '@jest/globals' {
  export const jest: {
    fn: () => jest.Mock;
    clearAllMocks: () => void;
    restoreAllMocks: () => void;
  };
  export const beforeEach: (fn: () => void) => void;
  export const afterAll: (fn: () => void) => void;
} 