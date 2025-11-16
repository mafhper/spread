import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Remove o tailwind() da lista de integrations
  integrations: [],
  
  // Adicione o plugin Vite
  vite: {
    plugins: [tailwindcss()],
  },
});