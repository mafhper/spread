#!/usr/bin/env node
/**
 * Playwright launcher hardened for mixed Bun/Node environments.
 * Mirrors `personalnews/quality-core/scripts/run-playwright.cjs` — see the
 * comment there and `SPD-N6` in this repo's `.dev` for the full diagnosis.
 *
 * WHY THIS EXISTS (and why `npx playwright test` broke this project):
 *
 * This repo declares `packageManager: "bun@1.3.13"` and has a `bun.lock`, so
 * `node_modules/.bin/` is bun layout: every CLI is a compiled `.exe` shim
 * (identical 16 KB binary for astro/vite/playwright) that embeds the Bun
 * runtime. That shim has no `.cmd` counterpart, so on Windows `playwright test`
 * is forced through it — and it runs the Playwright CLI under **Bun**.
 *
 * The Playwright test runner is NOT runtime-agnostic. It relies on
 * same-process module identity (`_currentSuite` is a singleton in
 * `@playwright/test`). Under Bun, the `import { test } from '@playwright/test'`
 * in each spec resolves to a different module instance than the one the CLI
 * holds — so `test()` registers on the wrong registry and the runner aborts
 * collection with "did not expect test() to be called here".
 *
 * Measured 2026-10-02 (this project):
 *   npx playwright test --list   -> Error: did not expect test() to be called here
 *   node node_modules/@playwright/test/cli.js test --list
 *                               -> Listing tests: [desktop] › studio.spec.ts:3 › …
 *
 * The fix: invoke the official CLI through the Node runtime directly, never
 * through the bun bunx shim.
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))

function resolveNodeRuntime() {
  if (process.execPath && existsSync(process.execPath)) {
    return process.execPath
  }
  return process.platform === 'win32' ? 'node.exe' : 'node'
}

function resolvePlaywrightCli() {
  // The bun layout keeps the real CLI here; require.resolve is the fallback
  // that survives a layout change.
  const fromRoot = resolve(__dirname, '../node_modules/@playwright/test/cli.js')
  if (existsSync(fromRoot)) return fromRoot
  const require = createRequire(import.meta.url)
  return require.resolve('@playwright/test/cli.js')
}

function main() {
  const runtime = resolveNodeRuntime()
  const cliPath = resolvePlaywrightCli()
  const forwardedArgs = process.argv.slice(2)

  const child = spawn(runtime, [cliPath, ...forwardedArgs], {
    cwd: resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: false,
    env: process.env,
  })

  child.on('error', err => {
    console.error(`[playwright] Failed to start CLI: ${err.message}`)
    process.exit(1)
  })

  child.on('close', (code, signal) => {
    if (signal) process.exit(1)
    process.exit(code ?? 1)
  })
}

main()
