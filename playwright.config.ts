import { defineConfig, devices } from '@playwright/test'
import { E2E_URL } from './scripts/portas.mjs'

// O `baseURL` e o `webServer.url` sao a MESMA constante (`E2E_URL`), porque o
// servidor de E2E sobe com `PORT=E2E_PORT` (ver `scripts/portas.mjs`). Antes
// estes dois numeros viviam soltos aqui e nao conversavam com o `server.mjs`, que
// subia `astro dev` sem `--port` e heredava 4321 — o default do Astro.
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './output/playwright/results',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: E2E_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node tests/e2e/server.mjs',
    url: E2E_URL,
    // `reuseExistingServer: false` SEMPRE, e nao so em CI.
    //
    // `true` localmente seria o padrao do Playwright e pareceria comfy, mas o
    // Astro 7 desliga o dev server em daemon de fundo (ver `tests/e2e/server.mjs`
    // e a nota SPD-N6). Com `true`, o Playwright NAO roda o `command` e usa o que
    // ja escuta na porta — que pode ser o daemon de uma execucao anterior. O E2E
    // entao aprova (ou reprova) contra codigo velho, e o sintoma e um teste que
    // "passou sozinho" ou falhou sem ninguem ter tocado em nada.
    //
    // O `server.mjs` roda `astro dev stop` antes de subir, entao a porta e
    // limpa na entrada: com `false`, o Playwright sempre mede o codigo atual.
    reuseExistingServer: false,
    // 120s, e nao 60s: o primeiro `astro dev` deste projeto mede `ready in
    // ~3.2s`, mas em maquina carregada e com o build do content layer o
    // arranque ja passou de 60s — e o sintoma (timeout) e indistinguivel do
    // sintoma de "subiu no endereco errado" (GTH-N6). Teto maior deixa o
    // primeiro sinal ser o do log do Astro, nao o do Playwright.
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1600, height: 1000 },
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
    },
  ],
})
