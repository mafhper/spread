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

function log(msg, type = 'info') {
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
      process.stdout.write('.')
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
function runLighthouse(url, formFactor) {
  return new Promise(resolve => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19)
    const filename = `lighthouse_${formFactor}_${timestamp}.json`
    const outputPath = path.join(CONFIG.outputDir, filename)

    console.log(
      `\n${c.cyan}🔦 Executando Lighthouse (${formFactor})...${c.reset}`
    )

    const profileDir = path.join(process.cwd(), '.lighthouse-profile')
    const chromeFlags = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-site-isolation-trials',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update',
      `--user-data-dir=${profileDir}`,
    ].join(' ')

    const args = [
      url,
      '--output=json',
      `--output-path=${outputPath}`,
      `--form-factor=${formFactor}`,
      `--chrome-flags="${chromeFlags}"`,
      '--only-categories=' + CONFIG.categories.join(','),
      '--quiet',
    ]

    if (formFactor === 'mobile') {
      args.push('--preset=perf')
    } else {
      args.push('--screenEmulation.disabled')
      args.push('--throttling.cpuSlowdownMultiplier=1')
    }

    const isWindows = process.platform === 'win32'
    const cmd = isWindows ? 'npx.cmd' : 'npx'

    let stderr = ''
    const child = spawn(cmd, ['lighthouse', ...args], {
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe'],
    })

    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    let frameIdx = 0
    const spinner = setInterval(() => {
      process.stdout.write(
        `\r   ${frames[frameIdx++ % frames.length]} Analisando...`
      )
    }, 100)

    child.stderr?.on('data', data => {
      stderr += data.toString()
    })

    child.on('close', code => {
      clearInterval(spinner)
      process.stdout.write('\r                    \r')

      const success = code === 0 || fs.existsSync(outputPath)

      if (!success) {
        console.error(`${c.red}❌ Lighthouse falhou (code ${code}):${c.reset}`)
        console.error(stderr)
        let errorMsg = 'Processo falhou'
        if (stderr.includes('Chrome')) errorMsg = 'Erro no Chrome/Launcher'
        else if (stderr.includes('REFUSED')) errorMsg = 'Servidor offline'
        return resolve({ success: false, error: errorMsg })
      }

      if (code !== 0 && fs.existsSync(outputPath)) {
        console.log(
          `${c.yellow}⚠️  Aviso: Erro de limpeza (Windows), mas report gerado.${c.reset}`
        )
      }

      try {
        const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
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
      clearInterval(spinner)
      resolve({ success: false, error: err.message })
    })
  })
}

async function main() {
  console.log(`${c.bold}🚀 Performance Automation${c.reset}\n`)

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

  const successCount = results.filter(r => r.success).length
  if (successCount < results.length) process.exit(1)
  process.exit(0)
}

main()
