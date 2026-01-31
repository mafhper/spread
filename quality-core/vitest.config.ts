import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/unit/setup.ts',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    include: [
      'tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/core/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    pool: 'forks',
    isolate: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: '../coverage',
      exclude: [
        'node_modules/',
        '.astro/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        'tests/unit/setup.ts',
        'dashboard/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@store': path.resolve(__dirname, '../src/store'),
      '@hooks': path.resolve(__dirname, '../src/hooks'),
      '@services': path.resolve(__dirname, '../src/services'),
    },
  },
})
