/**
 * Performance Test - Lighthouse CLI Runner (Autonomo)
 *
 * 1. Inicia servidor de desenvolvimento se necessario
 * 2. Executa Lighthouse para Mobile e Desktop
 * 3. Salva reports JSON
 * 4. Encerra servidor se foi iniciado pelo script
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
const UI = require('./ui-helpers.cjs')

// Configuracao
const CONFIG = {
  port: 4173,
  getUrl: () => `http://localhost:${CONFIG.port}/spread`,
  outputDir: path.resolve(__dirname, '../../performance-reports/lighthouse'),
  categories: ['performance', 'accessibility', 'best-practices', 'seo'],
  maxWaitTime: 60000, // 60s timeout para iniciar server
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

// Flags
const _args = process.argv.slice(2)
const isQuiet = _args.includes('--quiet') || _args.includes('-q')
const isSilent = _args.includes('--silent') || _args.includes('-s')

// Rastreamento de erros/warnings em silent mode
const executionLog = {
  startTime: Date.now(),
  errors: [],
  warnings: [],
}

function log(msg, type = 'info') {
  if (isSilent) {
    // Em silent mode, registra apenas erros e warnings
    if (type === 'error') {
      executionLog.errors.push(msg)
      console.log(`❌ ${msg}`)
    } else if (type === 'warn') {
      executionLog.warnings.push(msg)
      console.log(`⚠️  ${msg}`)
    }
    return
  }
  if (isQuiet && type === 'info') return
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️',
    wait: '⏳',
  }
  // eslint-disable-next-line security/detect-object-injection
  console.log(`${icons[type]} ${msg}`)
}

// Verifica se porta esta em uso
function isPortInUse(port) {
  return new Promise(resolve => {
    const server = http.createServer()
    server.once('error', err => {
      if (err.code === 'EADDRINUSE') resolve(true)
      else resolve(false)
    })
    server.once('listening', () => {
      server.close()
      resolve(false)
    })
    server.listen(port)
  })
}

// Aguarda URL ficar disponivel
async function waitForServer(url) {
  const start = Date.now()
  while (Date.now() - start < CONFIG.maxWaitTime) {
    try {
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
      return true
    } catch {
      await new Promise(r => setTimeout(r, 1000))
      if (!isQuiet && !isSilent) process.stdout.write('.')
    }
  }
  return false
}

// Inicia servidor
function startServer() {
  log(`Iniciando servidor de preview na porta ${CONFIG.port}...`, 'wait')
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  // Usar preview ja que dist deve existir apos quality:core
  const child = spawn(
    npmCmd,
    ['run', 'preview', '--', '--port', String(CONFIG.port), '--strictPort'],
    {
      cwd: path.resolve(__dirname, '../../'),
      stdio: 'ignore',
      shell: true,
      detached: false,
    }
  )
  return child
}

// Executa Lighthouse
async function runLighthouse(url, formFactor, attempt = 1) {
  return new Promise(resolve => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19)
    const filename = `lighthouse_${formFactor}_${timestamp}.json`
    const outputPath = path.join(CONFIG.outputDir, filename)

    if (!isSilent)
      console.log(
        `\n${c.cyan}🔦 Executando Lighthouse (${formFactor})...${c.reset}`
      )

    const profileDir = path.join(process.cwd(), '.lighthouse-profile')

    // Limpa diretório de profile anterior para evitar problemas
    if (fs.existsSync(profileDir)) {
      try {
        fs.rmSync(profileDir, { recursive: true, force: true })
      } catch {
        // Silencioso - se falhar, continua
      }
    }

    const isWindows = process.platform === 'win32'

    // Flags mais conservadoras para evitar problemas no headless mobile
    // No Windows, usamos o modo headless antigo que é mais leve para emulação mobile
    const chromeFlags = [
      isWindows ? '--headless' : '--headless=new',
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
    const child = spawn(cmd, ['lighthouse', ...args], {
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe'],
    })

    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
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
        if (!isSilent)
          console.error(
            `${c.red}❌ Lighthouse falhou (code ${code}):${c.reset}`
          )
        if (!isSilent) console.error(stderr)
        let errorMsg = 'Processo falhou'
        if (stderr.includes('Chrome')) errorMsg = 'Erro no Chrome/Launcher'
        else if (stderr.includes('REFUSED')) errorMsg = 'Servidor offline'
        return resolve({ success: false, error: errorMsg })
      }

      if (code !== 0 && fs.existsSync(outputPath)) {
        if (!isSilent)
          console.log(
            `${c.yellow}⚠️  Aviso: Erro de limpeza (Windows), mas report gerado.${c.reset}`
          )
      }

      try {
        const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'))

        // Verifica se o Lighthouse encontrou erro ao carregar a página
        if (report.runtimeError && report.runtimeError.code) {
          let errorMsg = report.runtimeError.message || report.runtimeError.code
          if (
            report.runtimeError.code === 'CHROME_INTERSTITIAL_ERROR' ||
            errorMsg.includes('DevTools protocol') ||
            errorMsg.includes('Timeout')
          ) {
            if (report.runtimeError.code === 'CHROME_INTERSTITIAL_ERROR') {
              errorMsg = 'Chrome foi bloqueado/redirecionado'
            }
            // Tenta um retry para mobile
            if (formFactor === 'mobile' && attempt < 2) {
              // Reverted to 2 attempts
              if (!isSilent) {
                console.log(
                  `${c.yellow}⚠️  Tentando novamente (tentativa ${attempt + 1}/2) - Erro: ${errorMsg}...${c.reset}`
                )
              }
              // Aguarda um pouco e tenta novamente
              setTimeout(async () => {
                const retry = await runLighthouse(url, formFactor, attempt + 1)
                resolve(retry)
              }, 2000) // Reverted wait time
              return
            }
          } else if (report.runtimeError.code === 'NAVIGATION_TIMEOUT') {
            errorMsg = 'Timeout ao carregar página'
          }
          if (!isSilent) {
            console.error(`${c.red}❌ Erro Lighthouse: ${errorMsg}${c.reset}`)
            if (report.runWarnings) {
              report.runWarnings.forEach(warn => {
                console.error(`   ${c.yellow}⚠️  ${warn}${c.reset}`)
              })
            }
          }
          return resolve({ success: false, error: errorMsg })
        }

        const scores = CONFIG.categories.reduce((acc, cat) => {
          // eslint-disable-next-line security/detect-object-injection
          acc[cat] = Math.round((report.categories[cat]?.score || 0) * 100)
          return acc
        }, {})
        resolve({ success: true, scores, path: outputPath })
      } catch (err) {
        resolve({ success: false, error: 'Erro no JSON: ' + err.message })
      }
    })

    child.on('error', err => {
      if (spinner) clearInterval(spinner)
      resolve({ success: false, error: err.message })
    })
  })
}

async function main() {
  if (!isSilent) console.log(`${c.bold}🚀 Performance Automation${c.reset}\n`)

  // Ensure output dir
  if (!fs.existsSync(CONFIG.outputDir))
    fs.mkdirSync(CONFIG.outputDir, { recursive: true })

  let serverProcess = null
  const portInUse = await isPortInUse(CONFIG.port)

  if (!portInUse) {
    serverProcess = startServer()
  } else {
    log(`Servidor ja esta rodando na porta ${CONFIG.port}.`, 'info')
  }

  log('Aguardando servidor...', 'wait')
  const serverReady = await waitForServer(CONFIG.getUrl())

  if (!serverReady) {
    log('Timeout: Servidor nao respondeu.', 'error')
    if (serverProcess) serverProcess.kill()
    process.exit(1)
  }

  log('Servidor pronto!', 'success')

  const results = []
  for (const factor of ['mobile', 'desktop']) {
    const res = await runLighthouse(CONFIG.getUrl(), factor)
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
  process.exit(0)
}

function generateMetrics(desktopResult, mobileResult) {
  const metrics = []
  const isWindows = process.platform === 'win32'

  if (desktopResult && desktopResult.success) {
    metrics.push(
      `✅ Desktop: Perf ${desktopResult.scores.performance} | A11y ${desktopResult.scores.accessibility}`
    )
  }

  if (mobileResult) {
    if (mobileResult.success) {
      metrics.push(
        `✅ Mobile: Perf ${mobileResult.scores.performance} | A11y ${mobileResult.scores.accessibility}`
      )
    } else {
      const prefix = isWindows ? '⚠️  Mobile (Informativo)' : '❌ Mobile'
      metrics.push(`${prefix}: Falhou - ${mobileResult.error}`)
    }
  }
  return metrics
}

main()
