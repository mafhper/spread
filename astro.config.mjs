/**
 * Configuração do Astro para deploy no GitHub Pages
 *
 * Define o base path correto para o repositório e integra
 * o Tailwind CSS v4 através do plugin Vite nativo.
 */

import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { visualizer } from 'rollup-plugin-visualizer'
import { findSafePort } from './scripts/sonda-porta'
import {
  DEV_PORT as DEV_PORT_NOMEADO,
  PREVIEW_PORT,
} from './scripts/portas.mjs'

// Porta nomeada: fora das faixas de incremento do Astro/Vite (4321-4323 e
// 5173-5175), que e o default que este projeto herdava. A sonda garante que
// ela esteja livre no loopback antes do bind.
//
// `process.env.PORT` e' o ponto de injecao: e por ele que o servidor de E2E
// (`tests/e2e/server.mjs`) levanta o MESMO dev em 5261 sem duplicar numero
// aqui. Ver `scripts/portas.mjs`.
const DEV_PORT = Number(process.env.PORT) || DEV_PORT_NOMEADO

// Check if analysis mode is enabled
const isAnalyze = process.env.ANALYZE === 'true'

function normalizeBasePath(basePath) {
  if (!basePath) return '/'
  let normalized = String(basePath).trim()
  if (!normalized.startsWith('/')) normalized = `/${normalized}`
  if (!normalized.endsWith('/')) normalized += '/'
  return normalized
}

function previewRedirectPlugin(basePath) {
  const target = normalizeBasePath(basePath)
  return {
    name: 'preview-redirect',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req?.url) return next()
        const url = req.url.split('?')[0]
        if (url === '/' || url === '') {
          res.statusCode = 302
          res.setHeader('Location', target)
          res.end()
          return
        }
        next()
      })
    },
  }
}

// Base Vite plugins
const vitePlugins = [tailwindcss(), previewRedirectPlugin('/spread')]

// Add bundle visualizer in analyze mode
if (isAnalyze) {
  console.log('[ANALYSIS - INFO] Bundle visualization enabled')
  vitePlugins.push(
    visualizer({
      filename: 'performance-reports/analysis/bundle-visual.html',
      title: 'Spread - Bundle Analysis',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
    visualizer({
      filename: 'performance-reports/analysis/bundle-stats.json',
      open: false,
      template: 'raw-data',
      gzipSize: true,
      brotliSize: true,
    })
  )
}

export default defineConfig({
  // Substitua 'spread' pelo nome do seu repositório
  site: 'https://mafhp.github.io',
  base: '/spread',
  output: 'static',
  devToolbar: { enabled: false },

  // `strictPort` + sonda: sem isso, `astro dev` cai na proxima porta e avisa,
  // mas quem chegou pela URL documentada bate no servidor errado.
  server: {
    port: await findSafePort(DEV_PORT, { rotulo: 'spread' }),
    strictPort: true,
  },

  // `astro preview` tinha o default do Astro (4321), que esta dentro da faixa de
  // incremento: com 4321 ocupado, ele subia em 4322 sem avisar. Nomeado em 5262.
  preview: {
    port: PREVIEW_PORT,
    strictPort: true,
  },

  integrations: [react(), sitemap()],

  vite: {
    plugins: vitePlugins,
    build: {
      // Configure manual chunks for better caching and smaller initial load
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('react/') ||
                id.includes('react-dom/') ||
                id.includes('scheduler/') ||
                id.includes('object-assign/')
              ) {
                return 'vendor-react'
              }
              if (id.includes('lucide')) {
                return 'vendor-icons'
              }
              return 'vendor-base'
            }
          },
        },
      },
      // Reduce chunk size warnings
      chunkSizeWarningLimit: 500,
    },
    // Optimize deps for faster dev and smaller bundles
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'zustand',
        'lucide-react',
        'clsx',
        'tailwind-merge',
      ],
    },
  },

  // Enable compression for production
  compressHTML: true,
})
