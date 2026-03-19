#!/usr/bin/env node
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')

const repoRoot = process.cwd()
const worktreeDir = fs.mkdtempSync(
  path.join(os.tmpdir(), 'spread-preflight-clean-')
)

function resolveCommand(command) {
  if (process.platform !== 'win32') return command
  if (command === 'npm') return 'npm.cmd'
  return command
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(resolveCommand(command), args, {
      cwd: options.cwd || repoRoot,
      stdio: 'inherit',
      shell: false,
      env: options.env || process.env,
    })

    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolve()
      else
        reject(
          new Error(
            `${command} ${args.join(' ')} failed with exit code ${code}`
          )
        )
    })
  })
}

async function cleanup() {
  try {
    await runCommand('git', ['worktree', 'remove', '--force', worktreeDir], {
      cwd: repoRoot,
    })
  } catch (err) {
    console.warn(`[preflight-clean] cleanup warning: ${err.message}`)
  } finally {
    fs.rmSync(worktreeDir, { recursive: true, force: true })
  }
}

async function main() {
  try {
    console.log(`[preflight-clean] preparing worktree: ${worktreeDir}`)
    await runCommand('git', [
      'worktree',
      'add',
      '--detach',
      worktreeDir,
      'HEAD',
    ])
    await runCommand('bun', ['install', '--frozen-lockfile'], {
      cwd: worktreeDir,
    })
    await runCommand('bun', ['run', 'preflight:github'], {
      cwd: worktreeDir,
    })
  } finally {
    await cleanup()
  }
}

main().catch(err => {
  console.error(`\n[preflight-clean] ${err.message}`)
  process.exit(1)
})
