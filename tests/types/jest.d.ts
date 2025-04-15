import '@jest/globals';

declare global {
  namespace NodeJS {
    interface Global {
      console: Console;
    }
  }
} 