/**
 * Execution History Manager
 * Manages the storage and retrieval of script execution times to calculate averages.
 */
const fs = require('fs')
const path = require('path')

const HISTORY_DIR = path.join(process.cwd(), 'performance-reports', 'logs')
const HISTORY_FILE = path.join(HISTORY_DIR, 'execution_history.json')
const MAX_HISTORY_ENTRIES = 20 // Keep last 20 runs for average calculation

/**
 * Ensure the directory exists
 */
function ensureDir() {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true })
  }
}

/**
 * Load execution history
 * @returns {Object} History object { scriptName: [durations] }
 */
function loadHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      return {}
    }
    const data = fs.readFileSync(HISTORY_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

/**
 * Save execution stats
 * @param {string} scriptName
 * @param {number} durationMs
 */
function saveExecutionTime(scriptName, durationMs) {
  ensureDir()
  const history = loadHistory()

  if (!history[String(scriptName)]) {
    // eslint-disable-next-line security/detect-object-injection
    history[scriptName] = []
  }

  // eslint-disable-next-line security/detect-object-injection
  history[scriptName].push(durationMs)

  // Trim history
  // eslint-disable-next-line security/detect-object-injection
  if (history[scriptName].length > MAX_HISTORY_ENTRIES) {
    // eslint-disable-next-line security/detect-object-injection
    history[scriptName] = history[scriptName].slice(-MAX_HISTORY_ENTRIES)
  }

  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2))
  } catch {
    // Ignore write errors to avoid breaking the pipeline
  }
}

/**
 * Get average duration for a script
 * @param {string} scriptName
 * @returns {string|null} Formatted average time or null if no history
 */
function getAverageDuration(scriptName) {
  const history = loadHistory()
  // eslint-disable-next-line security/detect-object-injection
  const times = history[scriptName]

  if (!times || times.length === 0) {
    return null
  }

  const avgMs = times.reduce((a, b) => a + b, 0) / times.length
  return (avgMs / 1000).toFixed(2) + 's'
}

module.exports = {
  saveExecutionTime,
  getAverageDuration,
}
