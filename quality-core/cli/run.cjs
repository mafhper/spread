/**
 * Quality Gate - Orquestrador Principal
 *
 * Executa verificacoes de qualidade antes de commit/push
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const config = require('./config.cjs')
const UI = require('./ui-helpers.cjs')
const History = require('./history.cjs')

// Flags
const args = process.argv.slice(2)
const isQuiet = args.includes('--quiet') || args.includes('-q')
const isSilent = args.includes('--silent') || args.includes('-s')
const isQuick = args.includes('--quick')

// Constants
const c = UI.colors
const symbols = UI.symbols

// Global State
const results = []
const startTime = Date.now()

/**
 * Format duration helper
 */
function formatDuration(ms) {
  return (ms / 1000).toFixed(2) + 's'
}

/**
 * Get timestamp helper
 */
function getTimestamp() {
  const now = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}_${p(now.getHours())}-${p(now.getMinutes())}`
}

/**
 * Run a command and capture output
 */
function runCommand(command, args = [], options = {}) {
  return new Promise(resolve => {
    const start = Date.now()
    let output = ''
    let error = ''

    const isWindows = process.platform === 'win32'
    let finalCommand = command
    let finalArgs = args

    if (isWindows) {
      finalCommand = process.env.ComSpec || 'cmd.exe'
      finalArgs = ['/c', command, ...args]
    }

    const child = spawn(finalCommand, finalArgs, {
      cwd: config.paths.root,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    })

    child.stdout?.on('data', data => {
      output += data.toString()
    })

    child.stderr?.on('data', data => {
      error += data.toString()
    })

    child.on('error', err => {
      resolve({
        success: false,
        duration: Date.now() - start,
        output,
        error: err.message,
      })
    })

    child.on('close', code => {
      resolve({
        success: code === 0,
        exitCode: code,
        duration: Date.now() - start,
        output,
        error,
      })
    })
  })
}

/**
 * Task Definitions
 */
const TASKS = [
  {
    name: 'Integridade',
    id: 'integrity',
    run: async () => {
      const issues = []
      config.requiredDirs.forEach(d => {
        if (!fs.existsSync(path.join(config.paths.root, d)))
          issues.push(`Pasta faltando: ${d}`)
      })
      config.requiredFiles.forEach(f => {
        if (!fs.existsSync(path.join(config.paths.root, f)))
          issues.push(`Arquivo faltando: ${f}`)
      })
      return {
        success: issues.length === 0,
        issues,
        message:
          issues.length === 0 ? 'Estrutura OK' : `${issues.length} issues`,
      }
    },
  },
  {
    name: 'i18n',
    id: 'i18n',
    run: async () => {
      if (
        !fs.existsSync(
          path.join(config.paths.root, 'quality-core/scripts/i18n-audit.cjs')
        )
      )
        return { success: true, skipped: true, message: 'Script missing' }

      const res = await runCommand('node', [
        'quality-core/scripts/i18n-audit.cjs',
      ])
      const count =
        (res.output.match(/Total de problemas: (\d+)/) || [])[1] || 0
      return {
        success: true,
        warning: count > 0,
        message: count > 0 ? `${count} warnings` : 'OK',
        output: res.output,
      }
    },
  },
  {
    name: 'Segurança (Audit)',
    id: 'security',
    run: async () => {
      const res = await runCommand('npm', ['audit', '--audit-level=high'])
      const hasIssue =
        res.output.includes('high') || res.output.includes('critical')
      return {
        success: !hasIssue,
        message: hasIssue ? 'Vulnerabilities found' : 'OK',
        output: res.output,
      }
    },
  },
  {
    name: 'Secrets Scan',
    id: 'secrets',
    run: async () => {
      if (
        !fs.existsSync(
          path.join(config.paths.root, 'quality-core/scripts/security-scan.cjs')
        )
      )
        return { success: true, skipped: true, message: 'Script missing' }

      const res = await runCommand('node', [
        'quality-core/scripts/security-scan.cjs',
      ])
      const crit = res.output.includes('CRITICAL') && res.exitCode !== 0
      const high = res.output.includes('HIGH')
      return {
        success: !crit,
        warning: high && !crit,
        message: crit ? 'Secrets exposed!' : high ? 'Possible leaks' : 'OK',
        output: res.output,
      }
    },
  },
  {
    name: 'Linting',
    id: 'lint',
    run: async () => {
      const res = await runCommand('bun', ['run', 'lint'])
      // Simple error check based on exit code or common error strings
      const hasError = res.exitCode !== 0
      return {
        success: !hasError,
        message: hasError ? 'Linting failed' : 'OK',
        output: res.output,
      }
    },
  },
  {
    name: 'Build',
    id: 'build',
    run: async () => {
      if (isQuick)
        return { success: true, skipped: true, message: 'Skipped (--quick)' }
      const res = await runCommand('bun', ['run', 'build'])
      return {
        success: res.success,
        message: res.success ? 'OK' : 'Build failed',
        output: res.success ? '' : res.error + res.output, // Full output on fail
      }
    },
  },
  {
    name: 'Performance',
    id: 'performance',
    run: async () => {
      // Simplified check logic to read latest lighthouse report
      const lhDir = config.paths.lighthouse
      if (!fs.existsSync(lhDir))
        return { success: true, skipped: true, message: 'No reports' }

      const files = fs
        .readdirSync(lhDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()
      if (files.length === 0)
        return { success: true, skipped: true, message: 'No JSON reports' }

      try {
        const report = JSON.parse(
          fs.readFileSync(path.join(lhDir, files[0]), 'utf8')
        )
        const getScore = cat => {
          const catScore = report.categories?.[cat]?.score // eslint-disable-line security/detect-object-injection
          const lhrScore = report.lhr?.categories?.[cat]?.score // eslint-disable-line security/detect-object-injection
          const val = catScore || lhrScore
          return val ? Math.round(val * 100) : 0
        }

        const perf = getScore('performance')
        const a11y = getScore('accessibility')

        return {
          success: perf >= 70,
          warning: perf > 0 && perf < 70,
          message: `Perf: ${perf} | A11y: ${a11y}`,
          report: files[0],
        }
      } catch (e) {
        return {
          success: true,
          warning: true,
          message: `Error reading report: ${e.message}`,
        }
      }
    },
  },
]

/**
 * Main Orchestrator
 */
async function main() {
  // 1. Setup UI
  if (!isSilent && !isQuiet) {
    console.clear()
    console.log(`${c.cyan}${c.bold}
╔═════════════════════════════════════════════╗
║           QUALITY GATE                      ║
║   Sistema de Verificacao Pre-Commit         ║
╚═════════════════════════════════════════════╝${c.reset}`)

    // Print Execution Plan
    UI.printPlan(TASKS)
  }

  // 2. Execute Tasks
  for (let i = 0; i < TASKS.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    const task = TASKS[i]
    const taskStart = Date.now()

    // Show Start
    if (!isSilent && !isQuiet) {
      UI.printScriptStart(task.name, i + 1, TASKS.length)
    }

    // Run Logic
    let result
    try {
      result = await task.run()
    } catch (e) {
      result = { success: false, message: e.message, output: e.stack }
    }

    const taskDuration = Date.now() - taskStart

    // Save History
    if (!task.skipped) {
      History.saveExecutionTime(task.id, taskDuration)
    }
    const avg = History.getAverageDuration(task.id)

    // Store Result
    results.push({
      ...task,
      ...result,
      duration: taskDuration,
    })

    // Show End & Output
    if (!isSilent) {
      // Print truncated output if present and not silent
      if (result.output && !isQuiet) {
        // If failed, show more lines, otherwise truncate heavily
        const maxLines = result.success ? 5 : 50
        console.log(
          c.dim +
            UI.truncateOutput(result.output.trim(), maxLines) +
            c.reset +
            '\n'
        )
      }

      if (!isQuiet) {
        UI.printScriptEnd(task.name, taskDuration, avg, result.success)
      }
    }
  }

  // 3. Generate Report & Summary
  const totalDuration = Date.now() - startTime
  const failed = results.filter(r => !r.success && !r.skipped)
  const warnings = results.filter(r => r.warning)
  const status = failed.length === 0 ? 'pass' : 'fail'

  if (isSilent) {
    // Standardized Silent Summary
    const metrics = [
      `Tasks: ${results.length}`,
      `Passed: ${results.filter(r => r.success).length}`,
      `Failed: ${failed.length}`,
    ]

    UI.printSummary({
      title: 'QUALITY GATE',
      status,
      metrics,
      errors: failed.map(f => `${f.name}: ${f.message}`),
      warnings: warnings.map(w => `${w.name}: ${w.message}`),
      duration: (totalDuration / 1000).toFixed(2),
      reportDir: config.paths.logs,
    })
  } else {
    // Normal Summary
    console.log(UI.separator(50, '='))
    console.log(`${c.bold}📊 FINAL RESULTS${c.reset}`)
    console.log(UI.separator(50, '-'))

    results.forEach(r => {
      const icon = r.skipped
        ? symbols.arrow
        : r.success
          ? r.warning
            ? symbols.warning
            : symbols.success
          : symbols.error
      console.log(`${icon} ${r.name.padEnd(20)} ${r.message}`)
    })

    console.log(
      '\n' + UI.metric('Total Time', (totalDuration / 1000).toFixed(2), 's')
    )
    console.log(UI.separator(50, '=') + '\n')
  }

  // 4. Save Markdown Log
  saveMarkdownReport(results, totalDuration, status)

  process.exit(status === 'pass' ? 0 : 1)
}

function saveMarkdownReport(results, duration, status) {
  const logsDir = config.paths.logs
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })

  const timestamp = getTimestamp()
  const reportPath = path.join(
    logsDir,
    `Quality-Gate_${status.toUpperCase()}_${timestamp}.md`
  )

  let md = `# Quality Gate Report\n\n`
  md += `**Date:** ${new Date().toLocaleString()}\n`
  md += `**Status:** ${status.toUpperCase()}\n`
  md += `**Duration:** ${formatDuration(duration)}\n\n`

  md += `| Task | Status | Duration | Message |\n|---|---|---|---|\n`
  results.forEach(r => {
    const s = r.skipped
      ? 'Skipped'
      : r.success
        ? r.warning
          ? 'Warn'
          : 'Pass'
        : 'Fail'
    md += `| ${r.name} | ${s} | ${formatDuration(r.duration)} | ${r.message} |\n`
  })

  // Add detailed failures
  const failed = results.filter(r => !r.success)
  if (failed.length > 0) {
    md += `\n## Failures\n`
    failed.forEach(f => {
      md += `### ${f.name}\n\`\`\`\n${f.output || 'No output'}\n\`\`\`\n`
    })
  }

  fs.writeFileSync(reportPath, md)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
