#!/usr/bin/env node
const { spawn } = require('child_process')
const path = require('path')
const {
  findAvailablePort,
  DEFAULT_PORT,
} = require('../packages/adapters/preview-server.cjs')

const root = path.resolve(__dirname, '../..')
const forwardedArgs = process.argv.slice(2)
const basePath = process.env.PREVIEW_BASE || '/spread'

function resolveRunner(runner) {
  if (process.platform !== 'win32') return runner
  if (runner === 'npm') return 'npm.cmd'
  return runner
}

function normalizeBasePath(input) {
  if (!input) return '/'
  let base = String(input).trim()
  if (!base.startsWith('/')) base = `/${base}`
  if (!base.endsWith('/')) base += '/'
  return base
}

function getArgValue(args, key) {
  const direct = args.find(arg => arg.startsWith(`${key}=`))
  if (direct) return direct.split('=').slice(1).join('=')
  const index = args.indexOf(key)
  if (index >= 0) return args[index + 1]
  return null
}

function hasArg(args, key) {
  return args.includes(key) || args.some(arg => arg.startsWith(`${key}=`))
}

function upsertArg(args, key, value) {
  const result = []
  let replaced = false

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index]
    if (current === key) {
      result.push(key, String(value))
      index += 1
      replaced = true
      continue
    }

    if (current.startsWith(`${key}=`)) {
      result.push(`${key}=${value}`)
      replaced = true
      continue
    }

    result.push(current)
  }

  if (!replaced) {
    result.push(key, String(value))
  }

  return result
}

function runCommand(command, args, options = {}) {
  return new Promise(resolve => {
    const useCmd =
      process.platform === 'win32' && command.toLowerCase().endsWith('.cmd')
    const finalCommand = useCmd ? process.env.ComSpec || 'cmd.exe' : command
    const finalArgs = useCmd ? ['/c', command, ...args] : args
    const child = spawn(finalCommand, finalArgs, {
      cwd: options.cwd,
      shell: false,
      stdio: options.stdio || 'inherit',
    })

    child.on('error', err => {
      if (err.code === 'ENOENT') {
        resolve({ ok: false, missing: true, error: err })
        return
      }
      resolve({ ok: false, error: err, exitCode: 1 })
    })

    child.on('close', code => {
      resolve({ ok: code === 0, exitCode: code })
    })
  })
}

function detectRunner() {
  const userAgent = process.env.npm_config_user_agent || ''
  if (userAgent.includes('bun')) return 'bun'
  return 'npm'
}

async function runWithRunner(runner) {
  const command = resolveRunner(runner)
  const build = await runCommand(command, ['run', 'build'], { cwd: root })
  if (build.missing) return { missing: true }
  if (!build.ok) return { ok: false, exitCode: build.exitCode || 1 }

  const base = normalizeBasePath(basePath)
  const requestedPort =
    getArgValue(forwardedArgs, '--port') ||
    process.env.PREVIEW_PORT ||
    DEFAULT_PORT
  const strictPort = hasArg(forwardedArgs, '--strictPort')
  const port = strictPort
    ? Number.parseInt(String(requestedPort), 10) || DEFAULT_PORT
    : await findAvailablePort(requestedPort)
  const previewArgsSource = strictPort
    ? forwardedArgs
    : upsertArg(forwardedArgs, '--port', port)
  const url = `http://localhost:${port}${base}`
  if (!strictPort && String(port) !== String(requestedPort)) {
    console.log(
      `[preview] Porta ${requestedPort} indisponivel. Usando ${port}.`
    )
  }
  console.log(`[preview] Open ${url}`)

  const previewArgsBase =
    runner === 'npm'
      ? ['run', 'preview:serve', '--', ...previewArgsSource]
      : ['run', 'preview:serve', ...previewArgsSource]
  const previewArgs = [...previewArgsBase]
  if (!hasArg(previewArgsSource, '--port')) {
    previewArgs.push('--port', String(port))
  }
  const preview = await runCommand(command, previewArgs, { cwd: root })
  return preview
}

async function main() {
  const preferred = process.env.PREVIEW_RUNNER || detectRunner()
  const candidates = Array.from(
    new Set([preferred, preferred === 'bun' ? 'npm' : 'bun'])
  )

  for (const runner of candidates) {
    const result = await runWithRunner(runner)
    if (result.missing) continue
    const code =
      typeof result.exitCode === 'number' ? result.exitCode : result.ok ? 0 : 1
    process.exit(code)
  }

  console.error('[preview] Nenhum runner encontrado. Instale Bun ou Node/npm.')
  process.exit(1)
}

main().catch(err => {
  console.error(`[preview] ${err.message}`)
  process.exit(1)
})
