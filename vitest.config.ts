import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './quality-core/tests/unit/setup.ts',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    include: [
      'quality-core/tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      '**/coverage/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/.astro/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/tests/**',
        'quality-core/**',
        'src/components/icons/**',
        'src/components/landing/**',
        'src/components/toolbar/tabs/**',
        'src/types/**',
        'src/components/ui/**',
        'src/services/svgExporter.ts',
        'src/components/toolbar/ControlDock.tsx',
        'src/components/OptimizedImage.tsx',
      ],
    },
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
})
