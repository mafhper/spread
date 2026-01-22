/**
 * Configuração do Astro para deploy no GitHub Pages
 * 
 * Define o base path correto para o repositório e integra
 * o Tailwind CSS v4 através do plugin Vite nativo.
 */

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  // Substitua 'spread' pelo nome do seu repositório
  site: 'https://mafhp.github.io',
  base: '/spread',
  
  integrations: [react()],
  
  vite: {
    plugins: [tailwindcss()],
  },
});