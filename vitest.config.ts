/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './packages/tests/setup.ts',
    include: ['packages/tests/**/*.{test,spec}.{js,ts,jsx,tsx}', 'src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
});
