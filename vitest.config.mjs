import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    clearMocks: true,
    coverage: {
      include: ['src/**'],
      exclude: [],
      provider: 'v8',
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    environment: 'jsdom',
    exclude: ['**/node_modules/**'],
    globals: true,
  },
});
