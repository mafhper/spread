/**
 * CLI UI Enhancements
 * Provides better visual feedback for CLI scripts
 */

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
}

const SYMBOLS = {
  success: '✅',
  error: '❌',
  warning: '⚠️ ',
  info: 'ℹ️ ',
  spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  arrow: '→',
  bullet: '•',
  check: '✓',
  cross: '✕',
  star: '⭐',
  clock: '⏱️ ',
  package: '📦',
  rocket: '🚀',
  folder: '📁',
  file: '📄',
  bar: '▓',
}

let spinnerIndex = 0
let spinnerInterval = null

/**
 * Format a title with styling
 */
function title(text, style = 'blue') {
  // eslint-disable-next-line security/detect-object-injection
  const color = c[style]
  return `${color}${c.bold}═══ ${text} ═══${c.reset}`
}

/**
 * Format a success message
 */
function success(text, prefix = true) {
  return `${prefix ? c.green + SYMBOLS.success + c.reset + ' ' : ''}${c.green}${text}${c.reset}`
}

/**
 * Format an error message
 */
function error(text, prefix = true) {
  return `${prefix ? c.red + SYMBOLS.error + c.reset + ' ' : ''}${c.red}${text}${c.reset}`
}

/**
 * Format a warning message
 */
function warning(text, prefix = true) {
  return `${prefix ? c.yellow + SYMBOLS.warning + c.reset + ' ' : ''}${c.yellow}${text}${c.reset}`
}

/**
 * Format an info message
 */
function info(text, prefix = true) {
  return `${prefix ? c.blue + SYMBOLS.info + c.reset + ' ' : ''}${c.blue}${text}${c.reset}`
}

/**
 * Create a progress bar
 */
function progressBar(current, total, width = 20) {
  const percentage = current / total
  const filled = Math.round((width * percentage) / 1)
  const empty = width - filled
  const bar =
    c.green + SYMBOLS.bar.repeat(filled) + c.dim + '░'.repeat(empty) + c.reset
  const percent = Math.round(percentage * 100)
  return `${bar} ${percent}%`
}

/**
 * Start a spinner
 */
function startSpinner(message = 'Loading...') {
  spinnerIndex = 0
  spinnerInterval = setInterval(() => {
    process.stdout.write(
      `\r${c.cyan}${SYMBOLS.spinner[spinnerIndex % SYMBOLS.spinner.length]}${c.reset} ${message}`
    )
    spinnerIndex++
  }, 80)
}

/**
 * Stop spinner
 */
function stopSpinner(finalMessage = '', success = true) {
  if (spinnerInterval) {
    clearInterval(spinnerInterval)
    spinnerInterval = null
  }
  const symbol = success ? SYMBOLS.success : SYMBOLS.error
  const color = success ? c.green : c.red
  process.stdout.write(`\r${color}${symbol}${c.reset} ${finalMessage}\n`)
}

/**
 * Create a horizontal separator
 */
function separator(length = 50, char = '─') {
  return c.dim + char.repeat(length) + c.reset
}

/**
 * Format a metric display
 */
function metric(label, value, unit = '', color = 'cyan') {
  // eslint-disable-next-line security/detect-object-injection
  return `${label}: ${c[color]}${c.bold}${value}${unit}${c.reset}`
}

/**
 * Create a section header
 */
function section(title, level = 1) {
  const chars = ['═', '─', '·']
  const char = chars[level - 1] || '·'
  const padding = char.repeat(3)
  return `\n${c.bold}${padding} ${title} ${padding}${c.reset}\n`
}

/**
 * Display a table-like structure
 */
function table(data, options = {}) {
  const { headers = [], widths = [] } = options

  let output = '\n'

  // Print headers
  if (headers.length > 0) {
    const headerRow = headers
      .map((h, i) => {
        // eslint-disable-next-line security/detect-object-injection
        const width = widths[i] || 20
        return h.padEnd(width)
      })
      .join(' ')
    output += `${c.bold}${c.cyan}${headerRow}${c.reset}\n`
    output += separator(50) + '\n'
  }

  // Print rows
  data.forEach(row => {
    const rowStr = row
      .map((cell, i) => {
        // eslint-disable-next-line security/detect-object-injection
        const width = widths[i] || 20
        return String(cell).padEnd(width)
      })
      .join(' ')
    output += rowStr + '\n'
  })

  output += '\n'
  return output
}

/**
 * Clear current line
 */
function clearLine() {
  process.stdout.write('\x1b[2K\r')
}

/**
 * Print a standardized summary for silent mode
 * @param {Object} options
 * @param {string} options.title - Title of the summary
 * @param {string[]} [options.metrics] - List of metrics to display
 * @param {'pass'|'fail'|null} [options.status] - Status of the execution
 * @param {string[]} [options.errors] - List of errors
 * @param {string[]} [options.warnings] - List of warnings
 * @param {number|string} [options.duration] - Execution duration in seconds
 * @param {string|null} [options.reportDir] - Directory where reports are saved
 */
function printSummary({
  title,
  metrics = [],
  status = null,
  errors = [],
  warnings = [],
  duration = 0,
  reportDir = null,
}) {
  console.log('\n' + separator(50, '='))
  console.log(`📊 RESUMO DA EXECUÇÃO - ${title}`)
  console.log(separator(50, '='))

  if (status) {
    const statusIcon = status === 'pass' ? SYMBOLS.success : SYMBOLS.error
    const statusText = status === 'pass' ? 'PASSOU' : 'FALHOU'
    console.log(`${statusIcon} Status: ${statusText}`)
  }

  if (metrics.length > 0) {
    metrics.forEach(metric => console.log(metric))
  }

  if (warnings.length > 0) {
    console.log(`\n${SYMBOLS.warning} Avisos (${warnings.length}):`)
    warnings.forEach(w => console.log(`   - ${w}`))
  }

  if (errors.length > 0) {
    console.log(`\n${SYMBOLS.error} Erros (${errors.length}):`)
    errors.forEach(e => console.log(`   - ${e}`))
  }

  console.log(`\n${SYMBOLS.clock} Tempo de execução: ${duration}s`)
  if (reportDir) {
    console.log(`${SYMBOLS.folder} Relatórios: ${reportDir}`)
  }
  console.log(separator(50, '=') + '\n')
}

module.exports = {
  colors: c,
  symbols: SYMBOLS,
  title,
  success,
  error,
  warning,
  info,
  progressBar,
  startSpinner,
  stopSpinner,
  separator,
  metric,
  section,
  table,
  clearLine,
  printSummary,
  truncateOutput,
  printPlan,
  printScriptStart,
  printScriptEnd,
}

/**
 * Truncate long output to keep console clean
 * @param {string} output
 * @param {number} maxLines
 * @returns {string}
 */
function truncateOutput(output, maxLines = 15) {
  if (!output) return ''
  const lines = output.split('\n')
  if (lines.length <= maxLines) return output

  const head = lines.slice(0, Math.ceil(maxLines / 2))
  const tail = lines.slice(-Math.floor(maxLines / 2))

  return [
    ...head,
    `... (${lines.length - maxLines} lines truncated) ...`,
    ...tail,
  ].join('\n')
}

/**
 * Print the initial execution plan
 * @param {Array<{name: string, command: string}>} tasks
 */
function printPlan(tasks) {
  console.log('\n' + title('Execution Plan', 'magenta'))
  tasks.forEach((task, index) => {
    console.log(`${c.dim} ${index + 1}. ${task.name}${c.reset}`)
  })
  console.log(separator(50) + '\n')
}

/**
 * Print script start header
 * @param {string} name
 * @param {number} index
 * @param {number} total
 */
function printScriptStart(name, index, total) {
  const progress = `[${index}/${total}]`
  console.log(`${c.cyan}${c.bold}▶ ${progress} [START] ${name}${c.reset}`)
}

/**
 * Print script end footer with stats
 * @param {string} name
 * @param {number} durationMs
 * @param {string|null} avgDuration
 * @param {boolean} success
 */
function printScriptEnd(name, durationMs, avgDuration, success) {
  const duration = (durationMs / 1000).toFixed(2) + 's'
  const color = success ? c.green : c.red
  const icon = success ? SYMBOLS.success : SYMBOLS.error

  let stats = `${c.bold}Elapsed: ${duration}${c.reset}`
  if (avgDuration) {
    stats += ` | ${c.dim}Avg: ${avgDuration}${c.reset}`
  }

  console.log(`${color}${icon} [END] ${name}${c.reset} - ${stats}\n`)
}
