/**
 * Performance Test - Lighthouse CLI Runner (Autonomo)
 *
 * 1. Inicia servidor de desenvolvimento se necessario
 * 2. Executa Lighthouse para Mobile e Desktop
 * 3. Salva reports JSON
 * 4. Encerra servidor se foi iniciado pelo script
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const http = require('http')
const os = require('os')
const UI = require('./ui-helpers.cjs')
const { refreshDashboardCache } = require('./dashboard-cache.cjs')

const args = process.argv.slice(2)
const isQuiet = args.includes('--quiet') || args.includes('-q')
const isSilent = args.includes('--silent') || args.includes('-s')

const serverHost =
  process.env.LH_HOST || process.env.LIGHTHOUSE_HOST || '127.0.0.1'
const basePathEnv =
  process.env.LH_BASE_PATH || process.env.LIGHTHOUSE_BASE_PATH || ''
const baseUrlEnv = process.env.LH_URL || process.env.LIGHTHOUSE_URL || ''
const serverWaitOverride = Number.parseInt(
  process.env.LH_SERVER_WAIT_MS || process.env.LIGHTHOUSE_SERVER_WAIT_MS || '',
  10
)
const headlessMode =
  process.env.LH_HEADLESS || process.env.LIGHTHOUSE_HEADLESS || 'new'
const extraChromeFlags =
  process.env.LH_CHROME_FLAGS || process.env.LIGHTHOUSE_CHROME_FLAGS || ''
const retryCount = Number.parseInt(
  process.env.LH_RETRY_COUNT || process.env.LIGHTHOUSE_RETRY_COUNT || '1',
  10
)
const retryTransientOnlyRaw =
  process.env.LH_RETRY_TRANSIENT_ONLY ||
  process.env.LIGHTHOUSE_RETRY_TRANSIENT_ONLY ||
  'true'
const retryBackoffMs = Number.parseInt(
  process.env.LH_RETRY_BACKOFF_MS ||
    process.env.LIGHTHOUSE_RETRY_BACKOFF_MS ||
    '1200',
  10
)
const UNAVAILABLE_PORT_ERROR_CODES = new Set(['EADDRINUSE', 'EACCES', 'EPERM'])

// Configuracao
const CONFIG = {
  port: Number.parseInt(process.env.LH_PORT || '', 10) || 4173,
  host: serverHost,
  outputDir: path.resolve(__dirname, '../../performance-reports/lighthouse'),
  categories: ['performance', 'accessibility', 'best-practices', 'seo'],
  maxWaitTime:
    Number.isFinite(serverWaitOverride) && serverWaitOverride > 0
      ? serverWaitOverride
      : 60000, // 60s timeout para iniciar server
}

// Cores
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

// Rastreamento de erros/warnings em silent mode
const executionLog = {
  startTime: Date.now(),
  errors: [],
  warnings: [],
}

function parseBooleanEnv(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback
  const normalized = String(value).trim().toLowerCase()
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false
  return fallback
}

const retryTransientOnly = parseBooleanEnv(retryTransientOnlyRaw, true)
const TRANSIENT_REASON_CODES = new Set([
  'runtime_error',
  'chrome_connect',
  'server_unreachable',
  'protocol_timeout',
  'page_timeout',
  'unknown_timeout',
])

function log(msg, type = 'info') {
  if (isSilent) {
    // Em silent mode, registra apenas erros e warnings
    if (type === 'error') {
      executionLog.errors.push(msg)
      console.log(`[error] ${msg}`)
    } else if (type === 'warn') {
      executionLog.warnings.push(msg)
      console.log(`[warn] ${msg}`)
    }
    return
  }
  if (isQuiet && type === 'info') return
  const icons = {
    info: '[info]',
    success: '[ok]',
    error: '[error]',
    warn: '[warn]',
    wait: '[wait]',
  }
  // eslint-disable-next-line security/detect-object-injection
  console.log(`${icons[type]} ${msg}`)
}

function normalizeBasePath(input) {
  if (!input) return '/spread/'
  let base = String(input).trim()
  if (!base.startsWith('/')) base = `/${base}`
  if (!base.endsWith('/')) base += '/'
  return base
}

function resolveBasePath(projectRoot) {
  if (basePathEnv) return normalizeBasePath(basePathEnv)
  const indexPath = path.join(projectRoot, 'dist', 'index.html')
  if (!fs.existsSync(indexPath)) return '/spread/'

  try {
    const html = fs.readFileSync(indexPath, 'utf8')
    const assetMatch = html.match(
      /(?:src|href)=["'](\/[^"']+?\/assets\/[^"']+)["']/
    )
    if (assetMatch?.[1]) {
      const assetPath = assetMatch[1]
      const idx = assetPath.indexOf('/assets/')
      if (idx >= 0) return assetPath.slice(0, idx + 1)
    }
  } catch {
    // Ignore parsing errors
  }

  return '/spread/'
}

function joinUrl(baseUrl, basePath) {
  if (!basePath || basePath === '/') return baseUrl
  return baseUrl.replace(/\/$/, '') + '/' + basePath.replace(/^\/+/, '')
}

// Verifica se porta esta em uso
function isPortInUseOnHost(port, host) {
  return new Promise(resolve => {
    const server = http.createServer()
    let settled = false
    const finalize = result => {
      if (settled) return
      settled = true
      resolve(result)
    }
    server.once('error', err => {
      if (UNAVAILABLE_PORT_ERROR_CODES.has(err.code)) finalize(true)
      else finalize(false)
    })
    server.once('listening', () => {
      server.close(() => finalize(false))
    })
    try {
      server.listen({ port, host })
    } catch {
      finalize(false)
    }
  })
}

async function isPortInUse(port) {
  const inUseV4 = await isPortInUseOnHost(port, '127.0.0.1')
  if (inUseV4) return true
  const inUseV6 = await isPortInUseOnHost(port, '::1')
  return inUseV6
}

async function findAvailablePort(startPort, attempts = 300) {
  for (let i = 0; i < attempts; i += 1) {
    const port = startPort + i
    const inUse = await isPortInUse(port)
    if (!inUse) return port
  }
  throw new Error(
    `Nenhuma porta disponivel encontrada a partir de ${startPort} apos ${attempts} tentativas`
  )
}

function createLogBuffer(maxLines = 20) {
  const lines = []
  return {
    push(data) {
      const chunk = data.toString()
      chunk.split('\n').forEach(line => {
        if (!line.trim()) return
        lines.push(line.trim())
        if (lines.length > maxLines) lines.shift()
      })
    },
    toString() {
      return lines.join('\n')
    },
  }
}

function stripAnsi(input) {
  return String(input || '').replace(/\u001b\[[0-9;]*m/g, '')
}

function extractPreviewUrl(logBuffer) {
  if (!logBuffer) return null
  const content = stripAnsi(logBuffer.toString())
  const matches = content.match(
    /http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]):\d+\/[^\s]*/g
  )
  if (!matches || matches.length === 0) return null
  return matches[matches.length - 1]
}

function getHttpStatus(url) {
  return new Promise(resolve => {
    try {
      const req = http.get(url, res => {
        res.resume()
        resolve(res.statusCode || null)
      })
      req.on('error', () => resolve(null))
    } catch {
      resolve(null)
    }
  })
}

function spawnCommand(command, args, options = {}) {
  const useCmd =
    process.platform === 'win32' && command.toLowerCase().endsWith('.cmd')
  const finalCommand = useCmd ? process.env.ComSpec || 'cmd.exe' : command
  const finalArgs = useCmd ? ['/c', command, ...args] : args
  return spawn(finalCommand, finalArgs, {
    shell: false,
    ...options,
  })
}

// Aguarda URL ficar disponivel
async function waitForServer(resolveUrl, serverProcess, serverLogs) {
  const start = Date.now()
  while (Date.now() - start < CONFIG.maxWaitTime) {
    let url = resolveUrl()
    if (serverProcess && serverProcess.exitCode !== null) {
      return { ready: false, reason: 'exit', code: serverProcess.exitCode }
    }
    if (serverProcess && serverProcess._spawnError) {
      return { ready: false, reason: 'spawn', error: serverProcess._spawnError }
    }
    try {
      const dynamicUrl = extractPreviewUrl(serverLogs?.stdout)
      if (dynamicUrl && dynamicUrl !== url) {
        url = dynamicUrl
      }
      await new Promise((resolve, reject) => {
        http
          .get(url, res => {
            if (
              (res.statusCode >= 200 && res.statusCode < 300) ||
              res.statusCode === 404
            )
              resolve()
            else reject()
          })
          .on('error', reject)
      })
      return { ready: true, url }
    } catch {
      await new Promise(r => setTimeout(r, 1000))
      if (!isQuiet && !isSilent) process.stdout.write('.')
    }
  }
  return { ready: false, reason: 'timeout' }
}

// Inicia servidor
function startServer(port, logs) {
  log(`Iniciando servidor de preview na porta ${port}...`, 'wait')
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  // Usar preview ja que dist deve existir apos quality:core
  const child = spawnCommand(
    npmCmd,
    ['run', 'preview', '--', '--port', String(port), '--strictPort'],
    {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    }
  )
  child.on('error', err => {
    child._spawnError = err
    logs?.stderr?.push?.(String(err.message || err))
  })
  if (logs) {
    child.stdout?.on('data', data => logs.stdout.push(data))
    child.stderr?.on('data', data => logs.stderr.push(data))
  }
  return child
}

function getLastMeaningfulLine(stderr) {
  const lines = String(stderr || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
  return lines.length > 0 ? lines[lines.length - 1].slice(0, 200) : null
}

function classifyStderrFailure(stderr, code) {
  const normalized = String(stderr || '')
  const lastLine = getLastMeaningfulLine(normalized)
  let reasonCode = 'lighthouse_cli_error'
  let reason = `exit_code=${code ?? 'unknown'}`

  const runtimeMatch = normalized.match(/runtimeError(?:=|:)\s*([A-Z_]+)/i)
  if (runtimeMatch?.[1]) {
    reasonCode = 'runtime_error'
    reason = `runtimeError=${runtimeMatch[1].toUpperCase()}`
  } else if (normalized.includes('NO_FCP')) {
    reasonCode = 'runtime_error'
    reason = 'runtimeError=NO_FCP'
  } else if (
    normalized.includes('DevTools protocol') ||
    normalized.includes('PROTOCOL_TIMEOUT')
  ) {
    reasonCode = 'protocol_timeout'
    reason = 'protocol_timeout'
  } else if (
    normalized.includes('Unable to connect to Chrome') ||
    normalized.includes('DevToolsActivePort')
  ) {
    reasonCode = 'chrome_connect'
    reason = 'chrome_connect'
  } else if (normalized.includes('ERR_CONNECTION_REFUSED')) {
    reasonCode = 'server_unreachable'
    reason = 'server_unreachable'
  } else if (
    normalized.includes('Timeout') ||
    normalized.includes('timed out')
  ) {
    reasonCode = 'page_timeout'
    reason = 'page_timeout'
  } else if (normalized.includes('ENOENT')) {
    reasonCode = 'lighthouse_missing'
    reason = 'lighthouse_cli_missing'
  }

  let message = `[${reasonCode}] ${reason}`
  if (lastLine && !message.includes(lastLine)) {
    message += ` | ${lastLine}`
  }

  return {
    reasonCode,
    reason,
    message,
  }
}

function isTransientRuntimeReason(reason) {
  const match = String(reason || '').match(/^runtimeError=([A-Z_]+)/)
  if (!match?.[1]) return false
  return [
    'NO_FCP',
    'PROTOCOL_TIMEOUT',
    'TARGET_CRASHED',
    'NO_NAVSTART',
  ].includes(match[1])
}

function shouldRetryFailure(failure) {
  if (!failure || failure.success) return false
  if (!retryTransientOnly) return true
  if (TRANSIENT_REASON_CODES.has(failure.reasonCode)) return true
  if (isTransientRuntimeReason(failure.reason)) return true
  return false
}

// Executa Lighthouse (uma tentativa)
async function runLighthouseOnce(url, formFactor) {
  return new Promise(resolve => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19)
    const filename = `lighthouse_${formFactor}_${timestamp}.json`
    const outputPath = path.join(CONFIG.outputDir, filename)

    if (!isSilent)
      console.log(
        `\n${c.cyan}Executando Lighthouse (${formFactor})...${c.reset}`
      )

    const profileDir = path.join(
      os.tmpdir(),
      `lighthouse-profile-${process.pid}-${formFactor}-${Date.now()}`
    )

    const isWindows = process.platform === 'win32'
    const headlessFlag =
      headlessMode === 'legacy' || headlessMode === 'old'
        ? '--headless'
        : '--headless=new'

    // Flags mais conservadoras para evitar problemas no headless mobile
    // No Windows, usamos o modo headless antigo que é mais leve para emulacao mobile
    const chromeFlags = [
      isWindows ? '--headless' : headlessFlag,
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--safebrowsing-disable-auto-update',
      '--disable-software-rasterizer',
      '--disable-features=IsolateOrigins,site-per-process,AudioServiceOutOfProcess',
      `--user-data-dir=${profileDir}`,
    ]
    if (extraChromeFlags) {
      chromeFlags.push(extraChromeFlags)
    }

    const args = [
      url,
      '--output=json',
      `--output-path=${outputPath}`,
      `--form-factor=${formFactor}`,
      `--chrome-flags="${chromeFlags.join(' ')}"`,
      '--only-categories=' + CONFIG.categories.join(','),
      '--quiet',
      '--legacy-navigation',
    ]

    const maxWait =
      process.env.LH_MAX_WAIT_MS || process.env.LIGHTHOUSE_MAX_WAIT_MS
    if (maxWait) {
      args.push(`--max-wait-for-load=${maxWait}`)
    }

    if (formFactor === 'mobile') {
      args.push('--preset=perf')
      // No Windows, desativamos throttling de CPU e screenshots para estabilidade
      if (isWindows) {
        args.push('--cpu-throttle-multiplier=1')
        args.push('--disable-full-page-screenshot')
        args.push('--disable-storage-reset') // Evita overhead de limpeza de disco extra
      } else {
        args.push('--cpu-throttle-multiplier=4')
      }
    } else {
      args.push('--screenEmulation.disabled')
      args.push('--throttling.cpuSlowdownMultiplier=1')
    }

    const cmd = isWindows ? 'npx.cmd' : 'npx'

    let stderr = ''
    const child = spawnCommand(cmd, ['lighthouse', ...args], {
      stdio: ['inherit', 'pipe', 'pipe'],
    })

    const frames = ['|', '/', '-', '\\']
    let frameIdx = 0
    let spinner = null
    if (!isQuiet && !isSilent) {
      spinner = setInterval(() => {
        process.stdout.write(
          `\r   ${frames[frameIdx++ % frames.length]} Analisando...`
        )
      }, 100)
    }

    child.stderr?.on('data', data => {
      stderr += data.toString()
    })

    child.on('close', code => {
      if (spinner) clearInterval(spinner)
      if (!isQuiet && !isSilent)
        process.stdout.write('\r                    \r')

      const success = code === 0 || fs.existsSync(outputPath)

      if (!success) {
        const failure = classifyStderrFailure(stderr, code)
        return resolve({
          success: false,
          error: failure.message,
          reasonCode: failure.reasonCode,
          reason: failure.reason,
        })
      }

      if (code !== 0 && fs.existsSync(outputPath)) {
        if (!isSilent)
          console.log(
            `${c.yellow}Aviso: Erro de limpeza (Windows), mas report gerado.${c.reset}`
          )
      }

      try {
        const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'))

        // Verifica se o Lighthouse encontrou erro ao carregar a pagina
        if (report.runtimeError && report.runtimeError.code) {
          let errorMsg = report.runtimeError.message || report.runtimeError.code
          if (report.runtimeError.code === 'CHROME_INTERSTITIAL_ERROR') {
            errorMsg = 'Chrome foi bloqueado/redirecionado'
          } else if (report.runtimeError.code === 'NAVIGATION_TIMEOUT') {
            errorMsg = 'Timeout ao carregar pagina'
          }
          return resolve({
            success: false,
            error: `runtimeError=${errorMsg}`,
            reasonCode: 'runtime_error',
            reason: `runtimeError=${report.runtimeError.code}`,
          })
        }

        const scores = CONFIG.categories.reduce((acc, cat) => {
          // eslint-disable-next-line security/detect-object-injection
          acc[cat] = Math.round((report.categories[cat]?.score || 0) * 100)
          return acc
        }, {})
        resolve({
          success: true,
          scores,
          path: outputPath,
          reasonCode: null,
          reason: null,
        })
      } catch (err) {
        resolve({
          success: false,
          error: 'Erro no JSON: ' + err.message,
          reasonCode: 'invalid_json',
          reason: 'invalid_json',
        })
      }
    })

    child.on('error', err => {
      if (spinner) clearInterval(spinner)
      resolve({
        success: false,
        error: err.message,
        reasonCode: 'spawn_error',
        reason: 'spawn_error',
      })
    })
  })
}

// Executa Lighthouse com retry controlado
async function runLighthouse(url, formFactor) {
  const safeRetryCount =
    Number.isFinite(retryCount) && retryCount >= 0 ? retryCount : 1
  const maxAttempts = 1 + safeRetryCount
  let lastFailure = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const outcome = await runLighthouseOnce(url, formFactor)
    if (outcome.success) {
      return {
        ...outcome,
        attempt,
        attempts: maxAttempts,
      }
    }

    lastFailure = {
      ...outcome,
      attempt,
      attempts: maxAttempts,
    }

    if (attempt >= maxAttempts || !shouldRetryFailure(outcome)) {
      break
    }

    if (!isSilent) {
      const mode = retryTransientOnly ? 'transient-only' : 'all-failures'
      log(
        `Retry ${attempt}/${safeRetryCount} para ${formFactor} - ${outcome.error} | mode=${mode}`,
        'warn'
      )
    }
    const safeBackoff =
      Number.isFinite(retryBackoffMs) && retryBackoffMs > 0
        ? retryBackoffMs
        : 1200
    await new Promise(r => setTimeout(r, safeBackoff * attempt))
  }

  return (
    lastFailure || {
      success: false,
      error: '[unknown_failure] sem detalhes',
      reasonCode: 'unknown_failure',
      reason: 'unknown_failure',
      attempt: maxAttempts,
      attempts: maxAttempts,
    }
  )
}

async function main() {
  if (!isSilent) console.log(`${c.bold}Performance Automation${c.reset}\n`)

  // Ensure output dir
  if (!fs.existsSync(CONFIG.outputDir))
    fs.mkdirSync(CONFIG.outputDir, { recursive: true })

  let serverProcess = null
  const serverLogs = {
    stdout: createLogBuffer(),
    stderr: createLogBuffer(),
  }
  const port = await findAvailablePort(CONFIG.port, 300)
  const baseUrl = `http://${CONFIG.host}:${port}`
  const projectRoot = path.resolve(__dirname, '../../')
  const basePath = resolveBasePath(projectRoot)
  const targetUrl = baseUrlEnv || joinUrl(baseUrl, basePath)
  let resolvedUrl = targetUrl
  const resolveUrl = () => {
    const fromLogs = extractPreviewUrl(serverLogs.stdout)
    if (fromLogs) {
      resolvedUrl = fromLogs
    }
    return resolvedUrl
  }

  if (port !== CONFIG.port) {
    log(`Porta ${CONFIG.port} em uso. Usando ${port}.`, 'warn')
  }

  const portInUse = await isPortInUse(port)

  if (!portInUse) {
    serverProcess = startServer(port, serverLogs)
  } else {
    log(`Servidor ja esta rodando na porta ${port}.`, 'info')
  }

  log('Aguardando servidor...', 'wait')
  const serverReady = await waitForServer(resolveUrl, serverProcess, serverLogs)

  if (!serverReady.ready) {
    const reason =
      serverReady.reason === 'exit'
        ? `Servidor encerrou (code ${serverReady.code ?? 'n/a'})`
        : serverReady.reason === 'spawn'
          ? `Falha ao iniciar servidor: ${serverReady.error?.message || serverReady.error}`
          : 'Timeout: Servidor nao respondeu.'
    log(reason, 'error')
    if (!isSilent) {
      const out = serverLogs.stdout.toString()
      const err = serverLogs.stderr.toString()
      if (out) {
        console.log(`${c.dim}${out}${c.reset}`)
      }
      if (err) {
        console.log(`${c.dim}${err}${c.reset}`)
      }
    }
    if (serverProcess) serverProcess.kill()
    process.exit(1)
  }

  if (serverReady.url) {
    resolvedUrl = serverReady.url
  }
  log('Servidor pronto!', 'success')
  await getHttpStatus(resolvedUrl)

  const results = []
  for (const factor of ['mobile', 'desktop']) {
    const res = await runLighthouse(resolvedUrl, factor)
    results.push({ factor, ...res })

    if (res.success) {
      log(
        `${factor.toUpperCase()}: Perf ${res.scores.performance} | A11y ${res.scores.accessibility}`,
        'success'
      )
    } else {
      log(`${factor.toUpperCase()}: Falhou - ${res.error}`, 'error')
    }
  }

  // Cleanup
  if (serverProcess) {
    log('Encerrando servidor temporario...', 'info')
    try {
      if (process.platform === 'win32') {
        const { spawn } = require('child_process')
        spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t'])
      } else {
        process.kill(serverProcess.pid, 'SIGTERM')
        // Give it a moment, then force kill if needed
        await new Promise(r => setTimeout(r, 500))
        try {
          process.kill(serverProcess.pid, 'SIGKILL')
        } catch {
          /* Already dead */
        }
      }
    } catch (err) {
      log(`Aviso ao encerrar servidor: ${err.message}`, 'warn')
    }
  }

  // Desktop é obrigatório, mobile é optional (podem haver issues no headless Windows)
  const desktopResult = results.find(r => r.factor === 'desktop')
  const mobileResult = results.find(r => r.factor === 'mobile')

  if (!desktopResult || !desktopResult.success) {
    log('Desktop Lighthouse é obrigatório e falhou', 'error')
    if (isSilent) {
      const metrics = generateMetrics(desktopResult, mobileResult)
      const duration = ((Date.now() - executionLog.startTime) / 1000).toFixed(2)

      UI.printSummary({
        title: 'LIGHTHOUSE',
        status: 'fail',
        metrics,
        errors: executionLog.errors,
        warnings: executionLog.warnings,
        duration,
        reportDir: CONFIG.outputDir,
      })
    }
    process.exit(1)
  }

  if (mobileResult && !mobileResult.success) {
    log(
      'Aviso: Mobile Lighthouse falhou (problema conhecido no Windows), mas Desktop passou',
      'warn'
    )
  }

  if (isSilent) {
    const metrics = generateMetrics(desktopResult, mobileResult)
    const duration = ((Date.now() - executionLog.startTime) / 1000).toFixed(2)

    UI.printSummary({
      title: 'LIGHTHOUSE',
      status: 'pass',
      metrics,
      errors: executionLog.errors,
      warnings: executionLog.warnings,
      duration,
      reportDir: CONFIG.outputDir,
    })
  }
  await refreshDashboardCache({ silent: isSilent || isQuiet })
  process.exit(0)
}

function generateMetrics(desktopResult, mobileResult) {
  const metrics = []
  const isWindows = process.platform === 'win32'

  if (desktopResult && desktopResult.success) {
    metrics.push(
      `Desktop: Perf ${desktopResult.scores.performance} | A11y ${desktopResult.scores.accessibility}`
    )
  }

  if (mobileResult) {
    if (mobileResult.success) {
      metrics.push(
        `Mobile: Perf ${mobileResult.scores.performance} | A11y ${mobileResult.scores.accessibility}`
      )
    } else {
      const prefix = isWindows ? 'Mobile (Informativo)' : 'Mobile'
      metrics.push(`${prefix}: Falhou - ${mobileResult.error}`)
    }
  }
  return metrics
}

main()
