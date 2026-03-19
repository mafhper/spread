#!/usr/bin/env node
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')

const withCoverage = process.argv.includes('--with-coverage')
const repoRoot = process.cwd()
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spread-preflight-'))

function resolveCommand(command) {
  if (process.platform !== 'win32') return command
  if (command === 'npm') return 'npm.cmd'
  return command
}

function runStep(step) {
  return new Promise((resolve, reject) => {
    console.log(`\n[preflight] ${step.name}`)
    const child = spawn(resolveCommand(step.command), step.args, {
      cwd: step.cwd || repoRoot,
      stdio: 'inherit',
      shell: false,
    })

    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`${step.name} failed with exit code ${code}`))
    })
  })
}

const steps = [
  { name: 'Type check', command: 'bun', args: ['run', 'type-check'] },
  { name: 'Lint', command: 'bun', args: ['run', 'lint'] },
  { name: 'Format check', command: 'bun', args: ['run', 'format:check'] },
  { name: 'Tests', command: 'bun', args: ['run', 'test'] },
  {
    name: 'Security audit (root)',
    command: process.execPath,
    args: [
      path.join('quality-core', 'scripts', 'run-audit.cjs'),
      '--tool=npm',
      `--output=${path.join(tempDir, 'audit-root.json')}`,
    ],
  },
  {
    name: 'Security audit (dashboard)',
    command: process.execPath,
    args: [
      path.join('quality-core', 'scripts', 'run-audit.cjs'),
      '--tool=npm',
      '--cwd=quality-core/dashboard',
      `--output=${path.join(tempDir, 'audit-dashboard.json')}`,
    ],
  },
]

if (withCoverage) {
  steps.push({
    name: 'Coverage',
    command: 'bun',
    args: ['run', 'test:coverage'],
  })
}

async function main() {
  try {
    for (const step of steps) {
      await runStep(step)
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

main().catch(err => {
  console.error(`\n[preflight] ${err.message}`)
  process.exit(1)
})
