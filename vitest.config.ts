import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './quality-core/tests/unit/setup.ts',
    include: [
      'quality-core/tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'quality-core/tests/core/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      exclude: [
        'node_modules/',
        '.astro/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        'quality-core/tests/unit/setup.ts',
        'quality-core/dashboard/',
      ],
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)
