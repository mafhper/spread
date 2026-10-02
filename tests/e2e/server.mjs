import { spawn, spawnSync } from 'node:child_process'
import { E2E_PORT, E2E_URL } from '../../scripts/portas.mjs'

// ============================================================================
// POR QUE `PORT=<E2E_PORT>` E NAO `--port <E2E_PORT>`
// ============================================================================
//
// E' a emenda que o `astro.config.mjs` ja oferecia: ele le `process.env.PORT`.
// Passar `--port` no CLI sobrescreve a config, mas a sonda (`findSafePort`) roda
// DENTRO do `server.port` do config — e e a sonda que garante a porta livre no
// loopback antes do bind. Injetando pelo env, o numero percorre exatamente o
// mesmo caminho do dev nomeado: env -> `DEV_PORT` -> `findSafePort` -> `strictPort`.
//
// Sem isso, `astro dev` sem `--port` herda 4321 (default do Astro), que esta
// dentro da faixa de incremento: se 4321 estivesse ocupado, o servidor subiria
// em 4322 e o `baseURL` do Playwright apontaria para o vazio.

// Idempotencia: limpar qualquer daemon de uma execucao ANTERIOR antes de subir.
//
// SIGKILL nao pode ser capturado (o `playwright` encerra o processo nessa
// situacao), entao nao existe `handler` que salve essa execucao. A unica
// correcao honesta e tornar o START idempotente: se sobrou daemon, `astro dev
// stop` derruba antes de comecar. Sem isso, o `.astro/dev.json` stale faz o
// proximo `astro dev` sair daqui mesmo, so reportando "Dev server running" —
// e o E2E mede um servidor velho em vez do codigo novo.
spawnSync('npx', ['astro', 'dev', 'stop'], {
  cwd: process.cwd(),
  stdio: 'ignore',
  shell: true,
})

// `--host 127.0.0.1` e' OBRIGATORIO, e nao cosmetico.
//
// Sem ele, o Astro assume `::` e escuta SO em IPv6 (`[::1]`). O `webServer.url`
// do Playwright — e o `E2E_URL` aqui — apontam para `127.0.0.1`, que nesse caso
// nunca responde: o `webServer` estoura o timeout com o servidor no ar e
// answering em outro endereco. Medido: `127.0.0.1` deu FALHOU e `[::1]` deu
// HTTP 200, no mesmo servidor, na mesma hora.
//
// Este `--host` estava no `server.mjs` original e se perdeu numa reescrita. A
// classe do defeito e GTH-N6: em Windows, `host` muda para que lado o socket
// responde, e nenhum dos dois lados da URL denuncia isso.
const server = spawn('npx astro dev --host 127.0.0.1', {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: String(E2E_PORT) },
})

console.log(`Servidor de teste disponível em ${E2E_URL}`)

let stopping = false
const stop = () => {
  if (stopping) return
  stopping = true
  if (!server.killed) server.kill()
  spawnSync('npx astro dev stop', {
    cwd: process.cwd(),
    stdio: 'ignore',
    shell: true,
  })
  process.exit(0)
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)
server.on('error', error => {
  console.error(error)
  process.exit(1)
})
server.on('exit', code => {
  // Se o daemon detachou, este `exit` e' do LANCADOR e nao do servidor: o
  // `code` e' 0 e nao ha nada a reportar. A limpeza do daemon fica com o
  // `astro dev stop` do teardown.
  if (code && !stopping) process.exit(code)
})

// Astro can detach into its native background server in managed terminals.
// Keep this parent alive so Playwright owns a stable lifecycle either way.
setInterval(() => undefined, 60_000)
