// As portas do Spread, em um lugar so.
//
// ============================================================================
// POR QUE ESTE ARQUIVO EXISTE
// ============================================================================
//
// A onda 2 nomeou a porta de DEV em 5260 (fora das faixas de incremento do
// Astro, 4321-4323 e 5173-5175). Mas o resto do projeto continuava em 4321, o
// default do Astro, e esse numero aparecia em quatro lugares:
//
//   astro.config.mjs            (via process.env.PORT, indiretamente)
//   playwright.config.ts        baseURL + webServer.url
//   tests/e2e/server.mjs        `npx astro dev` sem --port -> herdava 4321
//   .claude/launch.json         dev e preview
//   tests/e2e/studio.spec.ts    ~12 URLs hard-coded
//
// O sintoma nao era o dev: era o E2E. `playwright.config.ts` diz `baseURL:
// 4321`, mas o servidor sobe em 5260 desde a onda 2, entao o Playwright esperava
// um servidor que nao existia. Pior: como o `server.mjs` nao passa `--port`,
// ele dependia do DEFAULT do Astro, e `strictPort: true` + incremento automatico
// significa que, se 4321 estivesse ocupado, o servidor subiria em 4322 e o
// `baseURL` apontaria para o vazio.
//
// Este arquivo torna a porta uma CONSTANTE nomeada, e o `process.env.PORT` que
// o `astro.config.mjs` ja le vira o ponto de injecao unico: tanto o dev quanto
// o E2E passam a consumir daqui.
//
// ============================================================================
// A PORTA DE E2E E' 5261, E NAO 4321
// ============================================================================
//
// 4321 esta dentro da faixa de incremento do Astro. Uma porta nomeada ali
// seria indistinguivel de um incremento — que e exatamente o defeito que a onda
// 2 eliminou. 5261 fica no mesmo bloco do dev (5260), entao:
//
//   5260  dev     (astro dev / npm run dev)
//   5261  e2e     (npm run test:e2e, sobe `astro dev` com PORT=5261)
//   5262  preview (astro preview)
//
// O E2E usa uma porta PRÓPRIA de proposito: se dividisse a 5260 com o dev e
// ambos subissem juntos, um mediria o servidor do outro. Mesmo bloco, numeros
// vizinhos, zero colisao com a frota (5260 e' o proprio spread; 5261 e 5262 nao
// sao usados por ninguem; mpov e' 5270).

/** Porta do dev server (`astro dev`, `npm run dev`). */
export const DEV_PORT = 5260

/**
 * Porta do servidor de teste E2E. Precisa ser injetada em `process.env.PORT`
 * ANTES do `astro dev` subir, porque e o `astro.config.mjs` que le esse valor
 * (e nao o `astro dev --port`). O `tests/e2e/server.mjs` faz isso via `set`.
 */
export const E2E_PORT = 5261

/** Base path do site (o repo e publicado em `mafhper.github.io/spread`). */
export const BASE_PATH = '/spread/'

/** URL completa do dev, util para `baseURL` e mensagens. */
export const DEV_URL = `http://127.0.0.1:${DEV_PORT}${BASE_PATH}`

/** URL completa do servidor de E2E. */
export const E2E_URL = `http://127.0.0.1:${E2E_PORT}${BASE_PATH}`

/**
 * Porta do `astro preview`. Sem isto, `astro preview` sobe em 4321 (o default
 * do Astro) — dentro da faixa de incremento, entao um 4321 ocupado a empurra
 * para 4322 sem aviso. Mesmo bloco do dev e do E2E.
 */
export const PREVIEW_PORT = 5262
