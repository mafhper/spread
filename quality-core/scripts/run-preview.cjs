#!/usr/bin/env node
const { spawn } = require('child_process')
const path = require('path')

const root = path.resolve(__dirname, '../..')
const forwardedArgs = process.argv.slice(2)

function resolveRunner(runner) {
  if (process.platform !== 'win32') return runner
  if (runner === 'npm') return 'npm.cmd'
  return runner
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

  const previewArgs =
    runner === 'npm'
      ? ['run', 'preview:serve', '--', ...forwardedArgs]
      : ['run', 'preview:serve', ...forwardedArgs]
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
