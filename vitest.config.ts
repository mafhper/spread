import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './packages/tests/setup.ts',
    include: [
      'packages/tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/',
        '.astro/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        'packages/tests/setup.ts',
      ],
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)
