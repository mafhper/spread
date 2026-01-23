/* eslint-disable @typescript-eslint/no-require-imports */
const net = require('net')

/**
 * Finds a free port to run the preview server.
 */
function findFreePort() {
  const server = net.createServer()
  server.listen(0)
  const port = server.address().port
  server.close()
  return port
}

const PORT = process.env.PORT || findFreePort()

module.exports = {
  ci: {
    collect: {
      startServerCommand: `bun run preview --port ${PORT}`,
      url: [`http://localhost:${PORT}/spread`],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--headless --no-sandbox --disable-gpu',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.95 }],
        'categories:accessibility': ['warn', { minScore: 1.0 }],
        'categories:best-practices': ['warn', { minScore: 1.0 }],
        'categories:seo': ['warn', { minScore: 1.0 }],
        'categories:pwa': 'off',
        'first-contentful-paint': ['warn', { maxNumericValue: 1000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 1200 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.05 }],
        'total-blocking-time': ['warn', { maxNumericValue: 150 }],
        'resource-summary:script:count': ['warn', { maxNumericValue: 10 }],
        'resource-summary:script:size': ['warn', { maxNumericValue: 150000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
