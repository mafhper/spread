/**
 * Preview Server Adapter
 * Gerencia o ciclo de vida do servidor preview para audits
 */
const { spawn, execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const http = require('http')
const net = require('net')

const DEFAULT_PORT = 4173
const DEFAULT_TIMEOUT = 120000
const POLL_INTERVAL = 1000
const PORT_SCAN_ATTEMPTS = 300
const PORT_ERROR_CODES = new Set(['EADDRINUSE', 'EACCES', 'EPERM'])

/**
 * Safe fs helpers with path validation
 * These satisfy security/detect-non-literal-fs-filename by validating paths
 */
function validatePath(filePath) {
  if (typeof filePath !== 'string' || filePath.length === 0) {
    throw new Error('Invalid path: must be a non-empty string')
  }
  // Normalize and ensure path is absolute or relative to cwd
  const normalized = path.normalize(filePath)
  // Prevent path traversal attacks
  if (normalized.includes('..') && !path.isAbsolute(normalized)) {
    throw new Error('Invalid path: relative traversal not allowed')
  }
  return normalized
}

function safeExistsSync(filePath) {
  const validated = validatePath(filePath)
  return fs.existsSync(validated)
}

function safeReaddirSync(dirPath) {
  const validated = validatePath(dirPath)
  return fs.readdirSync(validated)
}

/**
 * Verifica se o servidor esta respondendo
 */
function isServerReady(url) {
  return new Promise(resolve => {
    const req = http.get(url, res => {
      resolve(res.statusCode >= 200 && res.statusCode < 500)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(2000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

function normalizePort(port) {
  const parsed = Number.parseInt(String(port || ''), 10)
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 65535) {
    return DEFAULT_PORT
  }
  return parsed
}

function buildPreviewUrl({
  protocol = 'http:',
  host = '127.0.0.1',
  port,
  pathname = '/',
}) {
  const normalizedPath = pathname && pathname !== '' ? pathname : '/'
  const safePath = normalizedPath.startsWith('/')
    ? normalizedPath
    : `/${normalizedPath}`
  return `${protocol}//${host}:${port}${safePath}`
}

function parsePreviewUrl(url) {
  if (!url) {
    return {
      protocol: 'http:',
      host: '127.0.0.1',
      port: DEFAULT_PORT,
      pathname: '/',
      explicit: false,
    }
  }

  try {
    const parsed = new URL(url)
    return {
      protocol: parsed.protocol || 'http:',
      host: parsed.hostname || '127.0.0.1',
      port: normalizePort(parsed.port || DEFAULT_PORT),
      pathname: parsed.pathname || '/',
      explicit: true,
    }
  } catch {
    return {
      protocol: 'http:',
      host: '127.0.0.1',
      port: DEFAULT_PORT,
      pathname: '/',
      explicit: false,
    }
  }
}

function canListenOnHost(port, host) {
  return new Promise(resolve => {
    const server = net.createServer()
    let settled = false
    const finish = available => {
      if (settled) return
      settled = true
      resolve(available)
    }

    server.once('error', err => {
      if (PORT_ERROR_CODES.has(err.code)) {
        finish(false)
        return
      }
      finish(false)
    })

    server.once('listening', () => {
      server.close(() => finish(true))
    })

    try {
      server.listen({ port, host, exclusive: true })
    } catch {
      finish(false)
    }
  })
}

async function isPortAvailable(port, hosts = ['127.0.0.1', '::1']) {
  for (const host of hosts) {
    const available = await canListenOnHost(port, host)
    if (!available) return false
  }
  return true
}

async function findAvailablePort(
  startPort = DEFAULT_PORT,
  attempts = PORT_SCAN_ATTEMPTS
) {
  const initialPort = normalizePort(startPort)
  for (let offset = 0; offset < attempts; offset += 1) {
    const candidate = initialPort + offset
    if (candidate > 65535) break
    const available = await isPortAvailable(candidate)
    if (available) return candidate
  }
  throw new Error(
    `Nenhuma porta disponivel encontrada a partir de ${initialPort} apos ${attempts} tentativas`
  )
}

/**
 * Aguarda o servidor estar pronto com retry
 */
async function waitForServer(url, timeout = DEFAULT_TIMEOUT) {
  const startTime = Date.now()
  let attempts = 0

  console.log(`[PREVIEW-SERVER - INFO] Health check em ${url}`)

  while (Date.now() - startTime < timeout) {
    attempts++
    if (attempts % 5 === 0) {
      console.log(
        `[PREVIEW-SERVER - INFO] Aguardando... (${Math.round((Date.now() - startTime) / 1000)}s)`
      )
    }

    if (await isServerReady(url)) {
      console.log(
        `[PREVIEW-SERVER - INFO] Servidor respondeu apos ${attempts} tentativas`
      )
      return true
    }
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
  }

  throw new Error(`Servidor nao iniciou em ${timeout}ms. URL: ${url}`)
}

/**
 * Verifica se bun esta disponivel
 */
function isBunAvailable() {
  try {
    const result = execSync('bun --version', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    console.log(`[PREVIEW-SERVER - INFO] bun encontrado: ${result.trim()}`)
    return true
  } catch {
    return false
  }
}

/**
 * Verifica se o dist existe e esta atualizado
 */
function hasValidDist(projectRoot) {
  const distPath = path.join(projectRoot, 'dist')
  if (!safeExistsSync(distPath)) {
    return false
  }
  // Verifica se dist nao esta vazio
  const files = safeReaddirSync(distPath)
  return files.length > 0
}

/**
 * Inicia o servidor preview
 */
function startPreviewServer(options = {}) {
  const { port = DEFAULT_PORT, projectRoot = process.cwd() } = options

  return new Promise((resolve, reject) => {
    console.log(
      `[PREVIEW-SERVER - INFO] Iniciando servidor preview na porta ${port}...`
    )

    const useBun = isBunAvailable()

    // Se dist existe, usamos vite preview diretamente
    // Caso contrario, usamos o script do package.json que faz build + preview
    const hasDist = hasValidDist(projectRoot)
    console.log(`[PREVIEW-SERVER - INFO] Dist existe: ${hasDist}`)

    let command, args

    if (hasDist) {
      // Usa vite preview diretamente
      if (useBun) {
        command = 'bunx'
        args = ['vite', 'preview', '--port', port.toString(), '--base=/spread']
      } else {
        command = 'npx'
        args = ['vite', 'preview', '--port', port.toString(), '--base=/spread']
      }
    } else {
      // Precisa fazer build primeiro
      command = useBun ? 'bun' : 'npm'
      args = ['run', 'preview']
    }

    console.log(`[PREVIEW-SERVER - INFO] Comando: ${command} ${args.join(' ')}`)

    const serverProcess = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      detached: false,
      cwd: projectRoot,
    })

    let stdout = ''
    let stderr = ''
    let processExited = false

    serverProcess.stdout.on('data', data => {
      const chunk = data.toString()
      stdout += chunk
      // Log output relevante
      if (
        chunk.includes(port.toString()) ||
        chunk.includes('ready') ||
        chunk.includes('Local:') ||
        chunk.includes('http://')
      ) {
        console.log(`[PREVIEW-SERVER - DEBUG] ${chunk.trim()}`)
      }
    })

    serverProcess.stderr.on('data', data => {
      const chunk = data.toString()
      stderr += chunk
      // Log erros ou informacoes importantes
      if (
        chunk.includes(port.toString()) ||
        chunk.includes('ready') ||
        chunk.includes('Local:') ||
        chunk.includes('http://') ||
        chunk.includes('error') ||
        chunk.includes('Error')
      ) {
        console.log(`[PREVIEW-SERVER - DEBUG] ${chunk.trim()}`)
      }
    })

    serverProcess.on('error', err => {
      console.error(
        `[PREVIEW-SERVER - ERROR] Erro ao spawn processo: ${err.message}`
      )
      reject(new Error(`Falha ao iniciar servidor preview: ${err.message}`))
    })

    serverProcess.on('exit', code => {
      processExited = true
      if (code !== 0 && code !== null) {
        console.error(
          `[PREVIEW-SERVER - ERROR] Processo encerrou com codigo ${code}`
        )
        console.error(`[PREVIEW-SERVER - ERROR] stderr: ${stderr.slice(-500)}`)
      }
    })

    // Da um tempo para o processo iniciar antes de retornar
    setTimeout(() => {
      if (!processExited) {
        resolve({
          process: serverProcess,
          pid: serverProcess.pid,
          port,
        })
      } else {
        reject(
          new Error(
            `Processo do servidor encerrou prematuramente.\nstdout: ${stdout.slice(-500)}\nstderr: ${stderr.slice(-500)}`
          )
        )
      }
    }, 2000)
  })
}

/**
 * Encerra o servidor preview de forma limpa
 */
async function stopPreviewServer(serverInfo) {
  if (!serverInfo || !serverInfo.process) {
    return
  }

  console.log(
    `[PREVIEW-SERVER - INFO] Encerrando servidor preview (PID: ${serverInfo.pid})...`
  )

  const { process: serverProcess } = serverInfo

  return new Promise(resolve => {
    let resolved = false
    const safeResolve = () => {
      if (!resolved) {
        resolved = true
        resolve()
      }
    }

    // Timeout de seguranca - reduced to 3s
    const forceKillTimeout = setTimeout(() => {
      console.log(
        `[PREVIEW-SERVER - WARN] Forcando encerramento do servidor...`
      )
      try {
        if (process.platform === 'win32') {
          // Use spawnSync to ensure synchronous completion
          const { spawnSync } = require('child_process')
          spawnSync(
            'taskkill',
            ['/pid', String(serverProcess.pid), '/f', '/t'],
            {
              stdio: 'ignore',
              shell: false,
            }
          )
        } else {
          process.kill(-serverProcess.pid, 'SIGKILL')
        }
      } catch {
        // Ignora erros de kill
      }
      console.log(`[PREVIEW-SERVER - INFO] Servidor encerrado (forcado)`)
      safeResolve()
    }, 3000)

    // Tenta encerrar graciosamente
    serverProcess.on('close', () => {
      clearTimeout(forceKillTimeout)
      console.log(`[PREVIEW-SERVER - INFO] Servidor encerrado com sucesso`)
      safeResolve()
    })

    // Envia sinal de termino
    try {
      if (process.platform === 'win32') {
        serverProcess.kill('SIGTERM')
      } else {
        // Mata o grupo de processos inteiro
        process.kill(-serverProcess.pid, 'SIGTERM')
      }
    } catch {
      // Se falhar, o force kill vai resolver
    }
  })
}

/**
 * Gerenciador de ciclo de vida do servidor preview
 */
async function withPreviewServer(options, callback) {
  const { projectRoot = process.cwd() } = options
  const requested = parsePreviewUrl(options.url)
  const requestedUrl = buildPreviewUrl({
    protocol: requested.protocol,
    host: requested.host,
    port: requested.port,
    pathname: requested.pathname,
  })

  if (requested.explicit) {
    console.log(
      `[PREVIEW-SERVER - INFO] Verificando servidor informado manualmente em ${requestedUrl}...`
    )
    const explicitServerReady = await isServerReady(requestedUrl)
    if (explicitServerReady) {
      console.log(
        `[PREVIEW-SERVER - INFO] Usando servidor ja em execucao em ${requestedUrl}`
      )
      return callback({ url: requestedUrl, port: requested.port })
    }
  }

  const preferredPort = normalizePort(options.port || requested.port)
  const selectedPort = await findAvailablePort(preferredPort)
  const url = buildPreviewUrl({
    protocol: requested.protocol,
    host: requested.host,
    port: selectedPort,
    pathname: requested.pathname,
  })
  let serverInfo = null

  // Verifica se o servidor ja esta rodando
  console.log(
    `[PREVIEW-SERVER - INFO] Verificando se o servidor ja esta em execucao...`
  )
  const alreadyRunning = await isServerReady(url)
  if (alreadyRunning) {
    console.log(
      `[PREVIEW-SERVER - INFO] Usando servidor ja em execucao em ${url}`
    )
    return callback()
  }

  console.log(
    `[PREVIEW-SERVER - INFO] Servidor nao encontrado, iniciando novo...`
  )

  try {
    // Inicia o servidor
    serverInfo = await startPreviewServer({
      ...options,
      port: selectedPort,
      projectRoot,
    })

    // Aguarda servidor estar pronto
    console.log(
      `[PREVIEW-SERVER - INFO] Aguardando servidor ficar pronto (timeout: ${options.timeout || DEFAULT_TIMEOUT}ms)...`
    )
    await waitForServer(url, options.timeout || DEFAULT_TIMEOUT)
    console.log(`[PREVIEW-SERVER - INFO] Servidor pronto em ${url}`)

    // Executa o callback
    const result = await callback({ url, port: selectedPort })

    return result
  } finally {
    // Garante encerramento do servidor
    if (serverInfo) {
      await stopPreviewServer(serverInfo)
    }
  }
}

module.exports = {
  startPreviewServer,
  stopPreviewServer,
  waitForServer,
  isServerReady,
  withPreviewServer,
  hasValidDist,
  DEFAULT_PORT,
  findAvailablePort,
  isPortAvailable,
}
