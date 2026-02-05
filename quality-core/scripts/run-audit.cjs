#!/usr/bin/env node
/* eslint-disable security/detect-object-injection */
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const argv = process.argv.slice(2)

function parseArgs(args) {
  const opts = {}
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg.startsWith('--tool=')) {
      opts.tool = arg.split('=')[1]
    } else if (arg === '--tool') {
      opts.tool = args[i + 1]
      i += 1
    } else if (arg.startsWith('--cwd=')) {
      opts.cwd = arg.split('=')[1]
    } else if (arg === '--cwd') {
      opts.cwd = args[i + 1]
      i += 1
    } else if (arg.startsWith('--output=')) {
      opts.output = arg.split('=')[1]
    } else if (arg === '--output') {
      opts.output = args[i + 1]
      i += 1
    } else if (arg.startsWith('--check=')) {
      opts.check = arg.split('=')[1]
    } else if (arg === '--check') {
      opts.check = args[i + 1]
      i += 1
    } else if (arg === '--no-check') {
      opts.check = false
    }
  }
  return opts
}

function resolveCommand(command) {
  if (process.platform !== 'win32') return command
  if (command === 'npm') return 'npm.cmd'
  if (command === 'npx') return 'npx.cmd'
  return command
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
      stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', data => {
      stdout += data.toString()
    })

    child.stderr?.on('data', data => {
      stderr += data.toString()
    })

    child.on('error', err => {
      if (err.code === 'ENOENT') {
        resolve({ ok: false, missing: true, error: err })
        return
      }
      resolve({ ok: false, error: err, stdout, stderr })
    })

    child.on('close', code => {
      resolve({ ok: code === 0, exitCode: code, stdout, stderr })
    })
  })
}

async function main() {
  const opts = parseArgs(argv)
  const tool = opts.tool || 'npm'
  const cwd = opts.cwd ? path.resolve(process.cwd(), opts.cwd) : process.cwd()
  const outputFile = opts.output || 'audit.json'
  const outputPath = path.resolve(cwd, outputFile)
  const checkScript =
    opts.check === false
      ? null
      : path.resolve(
          process.cwd(),
          opts.check || path.join('quality-core', 'scripts', 'check-audit.js')
        )

  const command = resolveCommand(tool)
  const auditResult = await runCommand(command, ['audit', '--json'], { cwd })

  if (auditResult.missing) {
    console.error(`[audit] Tool not found: ${tool}`)
    process.exit(1)
  }

  const payload = auditResult.stdout.trim()
    ? auditResult.stdout
    : auditResult.stderr

  if (!payload || !payload.trim()) {
    console.error('[audit] No JSON output captured from audit command.')
    process.exit(1)
  }

  fs.writeFileSync(outputPath, payload)
  console.log(`[audit] Report saved: ${outputPath}`)

  if (checkScript) {
    const checkResult = await runCommand(
      process.execPath,
      [checkScript, outputPath],
      { stdio: 'inherit' }
    )
    if (!checkResult.ok) {
      process.exit(checkResult.exitCode || 1)
    }
  }
}

main().catch(err => {
  console.error(`[audit] ${err.message}`)
  process.exit(1)
})
