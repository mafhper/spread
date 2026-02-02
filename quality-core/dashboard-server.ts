// quality-core/dashboard-server.ts
import http from 'http'
import https from 'https'
import fs from 'fs/promises'
import { createReadStream } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { SnapshotStore } from './snapshots.store'

const PORT_DEFAULT = 3334
const DIST_DIR = path.join(__dirname, 'dashboard', 'dist')
const CONFIG_FILE = path.join(__dirname, 'dashboard-config.json')
const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutos

let lastActivity = Date.now()

// Monitor de inatividade (Desativado se DASHBOARD_PERSISTENT=true)
if (process.env.DASHBOARD_PERSISTENT !== 'true') {
  setInterval(() => {
    const inactiveTime = Date.now() - lastActivity
    if (inactiveTime > INACTIVITY_TIMEOUT) {
      console.log(
        `[server-debug] Encerrando por inatividade (${Math.round(inactiveTime / 1000 / 60)}min)...`
      )
      process.exit(0)
    }
  }, 60 * 1000)
} else {
  console.log('[server-debug] Modo persistente ativado (Auto-off desativado)')
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

async function ensureConfig() {
  try {
    await fs.access(CONFIG_FILE)
  } catch {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      CONFIG_FILE,
      JSON.stringify(
        {
          githubUrl: 'https://mafhper.github.io/spread',
          refreshInterval: 60,
        },
        null,
        2
      )
    )
  }
}

async function startServer(port: number) {
  const server = http.createServer(async (req, res) => {
    lastActivity = Date.now()
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url || '', `http://localhost:${port}`)

    // API: Listar todos os snapshots
    if (url.pathname === '/api/snapshots' && req.method === 'GET') {
      try {
        const snapshots = await SnapshotStore.list()
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(JSON.stringify({ success: true, data: snapshots }))
      } catch (err: unknown) {
        res.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(
          JSON.stringify({
            success: false,
            error: err instanceof Error ? err.message : String(err),
          })
        )
      }
      return
    }

    // API: Buscar Arquivos
    if (url.pathname === '/api/files/search' && req.method === 'GET') {
      const query = url.searchParams.get('q') || ''
      if (!query || query.length < 2) {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(JSON.stringify({ success: true, data: [] }))
        return
      }
      try {
        const command =
          process.platform === 'win32'
            ? `git ls-files | findstr /i "${query}"`
            : `git ls-files | grep -i "${query}"`

        // eslint-disable-next-line security/detect-child-process
        exec(command, { cwd: process.cwd() }, (error, stdout) => {
          const files = (stdout || '').split('\n').filter(Boolean).slice(0, 10)
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
          })
          res.end(JSON.stringify({ success: true, data: files }))
        })
      } catch (err: unknown) {
        res.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(
          JSON.stringify({
            success: false,
            error: err instanceof Error ? err.message : String(err),
          })
        )
      }
      return
    }

    // API: Conteúdo de Arquivo
    if (url.pathname === '/api/files/content' && req.method === 'GET') {
      const filePath = url.searchParams.get('path')
      if (!filePath) {
        res.writeHead(400, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(JSON.stringify({ success: false, error: 'Path required' }))
        return
      }
      try {
        const absolutePath = path.resolve(process.cwd(), filePath)
        if (!absolutePath.startsWith(process.cwd())) {
          throw new Error('Access denied')
        }
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const content = await fs.readFile(absolutePath, 'utf-8')
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end(content)
      } catch (err: unknown) {
        res.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(
          JSON.stringify({
            success: false,
            error: err instanceof Error ? err.message : String(err),
          })
        )
      }
      return
    }

    // API: Conteúdo do Relatório Markdown
    if (url.pathname === '/api/reports/content' && req.method === 'GET') {
      const filename = url.searchParams.get('file')
      if (!filename) {
        res.writeHead(400, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(JSON.stringify({ success: false, error: 'Filename required' }))
        return
      }
      try {
        const content = await SnapshotStore.getReportContent(filename)
        if (content) {
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end(content)
        } else {
          res.writeHead(404, {
            'Content-Type': 'application/json; charset=utf-8',
          })
          res.end(JSON.stringify({ success: false, error: 'Report not found' }))
        }
      } catch (err: unknown) {
        res.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(
          JSON.stringify({
            success: false,
            error: err instanceof Error ? err.message : String(err),
          })
        )
      }
      return
    }

    // API: Medir Latência Real
    if (url.pathname === '/api/latency' && req.method === 'GET') {
      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const config = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf-8'))
        const targetUrl = config.githubUrl || 'https://mafhper.github.io/spread'

        const start = Date.now()
        const client = targetUrl.startsWith('https') ? https : http

        const request = client.get(targetUrl, response => {
          const latency = Date.now() - start
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
          })
          res.end(JSON.stringify({ success: true, latency, url: targetUrl }))
          response.resume()
        })

        request.on('error', err => {
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
          })
          res.end(
            JSON.stringify({ success: false, error: err.message, latency: 0 })
          )
        })

        request.setTimeout(5000, () => {
          request.destroy()
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
          })
          res.end(
            JSON.stringify({ success: false, error: 'Timeout', latency: 0 })
          )
        })
        return
      } catch (err: unknown) {
        res.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(
          JSON.stringify({
            success: false,
            error: err instanceof Error ? err.message : String(err),
          })
        )
      }
      return
    }

    // API: Configuração - GET
    if (url.pathname === '/api/config' && req.method === 'GET') {
      try {
        await ensureConfig()
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const content = await fs.readFile(CONFIG_FILE, 'utf-8')
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(content)
      } catch (err: unknown) {
        res.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
        })
        res.end(JSON.stringify({ success: false, error: String(err) }))
      }
      return
    }

    // API: Configuração - POST
    if (url.pathname === '/api/config' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => (body += chunk))
      req.on('end', async () => {
        try {
          const config = JSON.parse(body)
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
          })
          res.end(JSON.stringify({ success: true }))
        } catch (err: unknown) {
          res.writeHead(500, {
            'Content-Type': 'application/json; charset=utf-8',
          })
          res.end(JSON.stringify({ success: false, error: String(err) }))
        }
      })
      return
    }

    // API: Executar Ações
    if (url.pathname === '/api/action' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => (body += chunk))
      req.on('end', () => {
        try {
          const { action } = JSON.parse(body)
          let command = ''

          switch (action) {
            case 'run-tests':
              command = 'bun run test'
              break
            case 'generate-report':
              command = 'bun run quality:core'
              break
            case 'quality-core':
              command = 'bun run quality:core'
              break
            case 'quality-lighthouse':
              command = 'bun run quality:lighthouse'
              break
            default:
              res.writeHead(400, {
                'Content-Type': 'application/json; charset=utf-8',
              })
              res.end(
                JSON.stringify({ success: false, error: 'Invalid action' })
              )
              return
          }

          console.log(
            `[server-debug] Executing action: ${action} -> command: ${command}`
          )
          const start = Date.now()
          // eslint-disable-next-line security/detect-child-process
          exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
            const duration = ((Date.now() - start) / 1000).toFixed(2)
            console.log(
              `[server-debug] Command finished in ${duration}s. Exit code: ${error ? error.code : 0}`
            )

            if (error) {
              console.error(`[server-debug] Exec error: ${error.message}`)
              res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
              })
              res.end(
                JSON.stringify({
                  success: false,
                  output: stdout,
                  error: stderr || error.message,
                  code: error.code,
                })
              )
              return
            }
            res.writeHead(200, {
              'Content-Type': 'application/json; charset=utf-8',
            })
            res.end(JSON.stringify({ success: true, output: stdout }))
          })
        } catch (err: unknown) {
          res.writeHead(500, {
            'Content-Type': 'application/json; charset=utf-8',
          })
          res.end(
            JSON.stringify({
              success: false,
              error: err instanceof Error ? err.message : String(err),
            })
          )
        }
      })
      return
    }

    // Servir arquivos estáticos (Frontend)
    let filePath = path.join(
      DIST_DIR,
      url.pathname === '/' ? 'index.html' : url.pathname
    )

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const stats = await fs.stat(filePath)
      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html')
      }

      const ext = path.extname(filePath)
      // eslint-disable-next-line security/detect-object-injection
      const baseMime = MIME_TYPES[ext] || 'application/octet-stream'
      // Forçar UTF-8 para texto e scripts
      const contentType =
        baseMime.startsWith('text/') ||
        baseMime === 'text/javascript' ||
        baseMime === 'application/json'
          ? `${baseMime}; charset=utf-8`
          : baseMime

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      })
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      createReadStream(filePath).pipe(res)
    } catch {
      try {
        const indexPath = path.join(DIST_DIR, 'index.html')
        res.writeHead(200, { 'Content-Type': 'text/html' })
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        createReadStream(indexPath).pipe(res)
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
      }
    }
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Porto ${port} em uso, tentando ${port + 1}...`)
      startServer(port + 1)
    } else {
      console.error(`
🛑 Erro no servidor: ${err.message}
`)
      process.exit(1)
    }
  })

  server.listen(port, async () => {
    await ensureConfig()
    const snapshots = await SnapshotStore.list()
    const latest = snapshots.length > 0 ? snapshots[0] : null

    const snapshotsDir = path.join(
      process.cwd(),
      'performance-reports',
      'quality-snapshots'
    )
    const jsonCount = await fs
      .readdir(snapshotsDir)
      .then(f => f.filter(x => x.endsWith('.json')).length)
      .catch(() => 0)
    const mdCount = snapshots.length - jsonCount
    const lhDir = path.join(process.cwd(), 'performance-reports', 'lighthouse')
    const lhCount = await fs
      .readdir(lhDir)
      .then(f => f.filter(x => x.endsWith('.json')).length)
      .catch(() => 0)

    console.log('\n🚀 [server-debug] Quality Core Dashboard v2.5')
    console.log('━'.repeat(50))
    console.log(`📊 URL:         http://localhost:${port}`)
    console.log(
      `⏳ Auto-off:    ${process.env.DASHBOARD_PERSISTENT === 'true' ? 'Desativado' : '15 minutos de inatividade'}`
    )
    console.log(`🛒 snapshots:   ${snapshots.length} total`)
    console.log(`   └─ [cache-debug] ${jsonCount} JSON snapshots`)
    console.log(`   └─ [parser-debug] ${mdCount} MD reports`)
    console.log(`   └─ [lh-debug] ${lhCount} Lighthouse reports`)

    if (latest) {
      console.log(
        `📌 Latest:      ${latest.commitHash} (${new Date(latest.timestamp).toLocaleString()})`
      )
      console.log(`📈 Score:       ${latest.healthScore}/100`)
    }
    console.log('━'.repeat(50))
  })
}

startServer(PORT_DEFAULT)
