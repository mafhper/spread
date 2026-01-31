/**
 * Bundle Analysis Audit
 * Analyzes bundle size and composition using build stats.
 */
const fs = require('fs')
const path = require('path')

const BundleAnalysisAudit = {
  name: 'bundle-analysis',

  async run(context) {
    const distDir = context.distDir || './dist'
    const violations = []
    const t = context.thresholds?.build || {
      bundle_total_kb: 500,
      largest_chunk_kb: 200,
      css_total_kb: 50,
    }

    // Check if dist exists

    if (!fs.existsSync(distDir)) {
      throw new Error(
        `Dist directory not found at ${distDir}. Run 'npm run build' first.`
      )
    }

    // Recursive walk to get all files
    async function getFiles(dir) {
      const subdirs = await fs.promises.readdir(dir)
      const files = await Promise.all(
        subdirs.map(async subdir => {
          const res = path.resolve(dir, subdir)

          const stat = await fs.promises.stat(res)
          return stat.isDirectory() ? getFiles(res) : res
        })
      )
      return files.reduce((a, f) => a.concat(f), [])
    }

    const files = await getFiles(distDir)

    // Analyze bundle composition
    let jsTotal = 0
    let cssTotal = 0
    let assetsTotal = 0
    let largestChunk = { name: '', size: 0 }
    const chunks = []
    const assets = []

    for (const file of files) {
      const stats = await fs.promises.stat(file)
      const sizeKb = stats.size / 1024
      const ext = path.extname(file).toLowerCase()
      const relativePath = path.relative(distDir, file)

      if (ext === '.js') {
        jsTotal += sizeKb
        chunks.push({ name: relativePath, size: sizeKb, type: 'js' })
        if (sizeKb > largestChunk.size) {
          largestChunk = { name: relativePath, size: sizeKb }
        }
      } else if (ext === '.css') {
        cssTotal += sizeKb
        chunks.push({ name: relativePath, size: sizeKb, type: 'css' })
      } else if (
        [
          '.png',
          '.jpg',
          '.jpeg',
          '.svg',
          '.webp',
          '.woff',
          '.woff2',
          '.gif',
        ].includes(ext)
      ) {
        assetsTotal += sizeKb
        assets.push({
          name: relativePath,
          size: sizeKb,
          type: ext.replace('.', ''),
        })
      }
    }

    const bundleTotal = jsTotal + cssTotal

    // Check thresholds
    if (bundleTotal > t.bundle_total_kb) {
      violations.push({
        area: 'bundle-analysis',
        metric: 'bundle_total_kb',
        value: bundleTotal.toFixed(1),
        threshold: t.bundle_total_kb,
        severity: 'warn',
      })
    }

    if (largestChunk.size > t.largest_chunk_kb) {
      violations.push({
        area: 'bundle-analysis',
        metric: 'largest_chunk_kb',
        value: largestChunk.size.toFixed(1),
        threshold: t.largest_chunk_kb,
        severity: 'warn',
      })
    }

    if (cssTotal > t.css_total_kb) {
      violations.push({
        area: 'bundle-analysis',
        metric: 'css_total_kb',
        value: cssTotal.toFixed(1),
        threshold: t.css_total_kb,
        severity: 'warn',
      })
    }

    // Sort chunks by size (descending)
    chunks.sort((a, b) => b.size - a.size)

    return {
      area: 'bundle-analysis',
      score: Math.max(0, 100 - violations.length * 10),
      metrics: {
        jsTotalKb: Math.round(jsTotal * 100) / 100,
        cssTotalKb: Math.round(cssTotal * 100) / 100,
        assetsTotalKb: Math.round(assetsTotal * 100) / 100,
        bundleTotalKb: Math.round(bundleTotal * 100) / 100,
        largestChunk: {
          name: largestChunk.name,
          sizeKb: Math.round(largestChunk.size * 100) / 100,
        },
        fileCount: files.length,
        jsFileCount: chunks.filter(c => c.type === 'js').length,
        cssFileCount: chunks.filter(c => c.type === 'css').length,
        assetsCount: assets.length,
      },
      details: {
        chunks: chunks.slice(0, 20), // Top 20 largest files
        assets: assets.slice(0, 20), // Top 20 largest assets
      },
      violations,
    }
  },
}

module.exports = BundleAnalysisAudit
