import { spawn, spawnSync } from 'node:child_process'

const command = 'npx astro dev --host 127.0.0.1'
const server = spawn(command, {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
})

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
  if (code && !stopping) process.exit(code)
})

// Astro can detach into its native background server in managed terminals.
// Keep this parent alive so Playwright owns a stable lifecycle either way.
setInterval(() => undefined, 60_000)
