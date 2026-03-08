#!/usr/bin/env node
/**
 * Quality Core CLI
 * Inicia automaticamente o servidor preview, executa audits e encerra o servidor
 */
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { runAudits } = require('../packages/core/runner.cjs')
const DEFAULT_THRESHOLDS = require('../packages/core/thresholds.cjs')
const {
  withPreviewServer,
  hasValidDist,
} = require('../packages/adapters/preview-server.cjs')
const UI = require('./ui-helpers.cjs')
const { refreshDashboardCache } = require('./dashboard-cache.cjs')

/**
 * Safe fs helper with path validation
 * Satisfies security/detect-non-literal-fs-filename
 */
function safeWriteFileSync(filePath, content) {
  if (typeof filePath !== 'string' || filePath.length === 0) {
    throw new Error('Invalid path: must be a non-empty string')
  }
  const normalized = path.normalize(filePath)
  // Only allow writing to performance-reports directory
  if (!normalized.includes('performance-reports')) {
    throw new Error(
      'Invalid path: can only write to performance-reports directory'
    )
  }
  return fs.writeFileSync(normalized, content)
}

// Import Presets
const GITHUB_PAGES_PRESET = require('../presets/github-pages.json')

// Import Audits
const AVAILABLE_AUDITS = {
  build: require('../packages/audits/build.cjs'),
  render: require('../packages/audits/render.cjs'),
  ux: require('../packages/audits/ux.cjs'),
  a11y: require('../packages/audits/a11y.cjs'),
  seo: require('../packages/audits/seo.cjs'),
}

/**
 * Executa o build se necessario
 */
async function runBuildIfNeeded(projectRoot) {
  if (hasValidDist(projectRoot)) {
    console.log(
      `${UI.section('Build Status')}${UI.success('Dist existe, pulando build')}`
    )
    return
  }

  console.log(`${UI.section('Build Status')}`)
  UI.startSpinner('Executando build...')

  return new Promise((resolve, reject) => {
    const buildProcess = spawn('bun', ['run', 'build'], {
      stdio: 'pipe',
      shell: process.platform === 'win32',
      cwd: projectRoot,
    })

    let output = ''
    if (buildProcess.stdout) {
      buildProcess.stdout.on('data', data => {
        output += data.toString()
      })
    }
    if (buildProcess.stderr) {
      buildProcess.stderr.on('data', data => {
        output += data.toString()
      })
    }

    buildProcess.on('error', err => {
      UI.stopSpinner('Build falhou', false)
      reject(new Error(`Falha ao executar build: ${err.message}`))
    })

    buildProcess.on('exit', code => {
      if (code === 0) {
        UI.stopSpinner('Build concluído com sucesso', true)
        resolve()
      } else {
        UI.stopSpinner('Build falhou', false)
        if (output) {
          console.error('\n' + output)
        }
        reject(new Error(`Build falhou com codigo ${code}`))
      }
    })
  })
}

async function runQualityChecks(context, isQuick) {
  // Select Audits
  const auditsToRun = []
  if (isQuick) {
    auditsToRun.push(AVAILABLE_AUDITS.build)
  } else {
    auditsToRun.push(AVAILABLE_AUDITS.build)
    auditsToRun.push(AVAILABLE_AUDITS.render)
    auditsToRun.push(AVAILABLE_AUDITS.ux)
    auditsToRun.push(AVAILABLE_AUDITS.a11y)
    auditsToRun.push(AVAILABLE_AUDITS.seo)
  }

  // Filter out undefined if any audit implementation is missing
  const validAudits = auditsToRun.filter(Boolean)

  if (validAudits.length === 0) {
    console.error(
      'No valid audits found to run. Check your configuration or implementation.'
    )
    process.exit(1)
  }

  // Run Audits
  const result = await runAudits({ audits: validAudits, context })

  // Save Reports
  const reportDir = path.join(process.cwd(), 'performance-reports', 'quality')
  const filename = `quality-${Date.now()}`

  // JSON
  const JsonReporter = require('../packages/reporters/json.cjs')
  const jsonPath = JsonReporter.save(result, reportDir, `${filename}.json`)
  console.log(`\n[QUALITY-CORE - INFO] JSON Report: ${jsonPath}`)

  // Latest JSON for Dashboard
  JsonReporter.save(result, reportDir, 'quality-latest.json')

  // Markdown
  const MarkdownReporter = require('../packages/reporters/markdown.cjs')
  const mdContent = MarkdownReporter.generate(result)
  const mdPath = path.join(reportDir, `${filename}.md`)
  safeWriteFileSync(mdPath, mdContent)
  console.log(`[QUALITY-CORE - INFO] Markdown Report: ${mdPath}`)

  return result
}

async function main() {
  const args = process.argv.slice(2)
  const presetName =
    args.find(a => a.startsWith('--preset='))?.split('=')[1] || 'github-pages'
  const isQuick = args.includes('--quick')
  const isFailOnError = args.includes('--fail-on-error')
  const skipPreviewStart = args.includes('--skip-preview')
  const skipBuild = args.includes('--skip-build')
  const isQuiet = args.includes('--quiet')
  const isSilent = args.includes('--silent')

  // Rastreamento em silent mode
  const executionLog = {
    startTime: Date.now(),
    errors: [],
    warnings: [],
    results: [],
  }

  const log = (msg, level = 'info') => {
    if (isSilent) {
      if (level === 'error') {
        executionLog.errors.push(msg)
        console.log(UI.error(`❌ ${msg}`))
      } else if (level === 'warn') {
        executionLog.warnings.push(msg)
        console.log(UI.warn(`⚠️  ${msg}`))
      }
      return
    }
    if (isQuiet && level === 'info') return

    const prefix = `[QUALITY-CORE - ${level.toUpperCase()}]`
    switch (level) {
      case 'success':
        console.log(UI.success(`${prefix} ${msg}`))
        break
      case 'error':
        console.log(UI.error(`${prefix} ${msg}`))
        break
      case 'warn':
        console.log(UI.warning(`${prefix} ${msg}`))
        break
      default:
        console.log(UI.info(`${prefix} ${msg}`))
    }
  }

  if (!isSilent) {
    console.log(`\n${UI.title('Quality Core CLI v1.0.0', 'cyan')}\n`)
    log(`Preset: ${presetName}`)
    if (isQuick) {
      log(`Modo rápido: Build será pulado`, 'warn')
    }
  }

  // URL configuration
  let url = args.find(a => a.startsWith('--url='))?.split('=')[1] || null

  const projectRoot = process.cwd()

  // Preset Config
  const preset =
    presetName === 'github-pages' ? GITHUB_PAGES_PRESET : GITHUB_PAGES_PRESET

  const context = {
    url,
    preset: presetName,
    device: preset.device || 'mobile',
    thresholds: DEFAULT_THRESHOLDS,
    projectRoot: projectRoot,
    distDir: path.join(projectRoot, 'dist'),
  }

  let result

  if (skipPreviewStart) {
    // Modo manual - assume que o servidor ja esta rodando
    console.log(
      `[QUALITY-CORE - INFO] Modo skip-preview: assumindo servidor em ${url}`
    )
    result = await runQualityChecks(context, isQuick)
  } else {
    // Executa build se necessario
    if (!skipBuild) {
      await runBuildIfNeeded(projectRoot)
    }

    // Modo automatico - gerencia o ciclo de vida do servidor
    result = await withPreviewServer(
      { url, projectRoot, timeout: 120000 },
      async preview => {
        context.url = preview.url
        return await runQualityChecks(context, isQuick)
      }
    )
  }

  // Exit with appropriate code
  await refreshDashboardCache({ silent: isSilent || isQuiet })

  if (result.status === 'fail') {
    if (isSilent) {
      const violations = result.violations || []
      const duration = ((Date.now() - executionLog.startTime) / 1000).toFixed(2)

      UI.printSummary({
        title: 'QUALITY CORE',
        status: 'fail',
        warnings: violations,
        errors: executionLog.errors,
        duration,
        reportDir: path.join(process.cwd(), 'performance-reports', 'quality'),
      })
    }
    process.exit(isFailOnError ? 1 : 0)
  } else {
    if (isSilent) {
      const violations = result.violations || []
      const duration = ((Date.now() - executionLog.startTime) / 1000).toFixed(2)

      UI.printSummary({
        title: 'QUALITY CORE',
        status: 'pass',
        warnings: violations,
        errors: executionLog.errors,
        duration,
        reportDir: path.join(process.cwd(), 'performance-reports', 'quality'),
      })
    }
    // Explicit exit to ensure clean shutdown even with orphan handles
    process.exit(0)
  }
}

main().catch(err => {
  console.error('[QUALITY-CORE - ERROR] Fatal Error:', err)
  process.exit(1)
})
