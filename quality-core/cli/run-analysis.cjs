/**
 * Analysis Report Generator CLI
 * Generates detailed analysis reports for bundles, dependencies, and code.
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const BundleAnalysisAudit = require('../packages/audits/bundle-analysis.cjs')

// Paths
const ANALYSIS_DIR = path.join(process.cwd(), 'performance-reports', 'analysis')
const DIST_DIR = path.join(process.cwd(), 'dist')

/**
 * Validates and resolves a safe file path within the analysis directory
 * @param {string} filename - The filename to validate
 * @returns {string} - The resolved safe path
 */
function getSafeFilePath(filename) {
  const resolvedPath = path.resolve(ANALYSIS_DIR, filename)
  const resolvedAnalysisDir = path.resolve(ANALYSIS_DIR)

  // Ensure the resolved path is within the analysis directory
  if (!resolvedPath.startsWith(resolvedAnalysisDir)) {
    throw new Error(`Invalid filename: ${filename} - path traversal detected`)
  }

  return resolvedPath
}

// Ensure analysis directory exists
if (!fs.existsSync(ANALYSIS_DIR)) {
  fs.mkdirSync(ANALYSIS_DIR, { recursive: true })
}

/**
 * Save JSON report
 */
function saveJsonReport(filename, data) {
  const filepath = getSafeFilePath(filename)
  // Safe: filepath is validated by getSafeFilePath to prevent path traversal

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
  console.log(`[ANALYSIS - INFO] JSON report saved: ${filepath}`)
  return filepath
}

/**
 * Generate Markdown report from analysis results
 */
function generateMarkdownReport(results) {
  const date = new Date().toLocaleString()
  const commit = getGitCommit()

  let md = `# Análise de Bundle e Build\n\n`
  md += `**Data:** ${date}\n`
  md += `**Commit:** \`${commit}\`\n\n`

  // Bundle Analysis Section
  if (results.bundle) {
    md += `## 📦 Análise do Bundle\n\n`
    md += `| Métrica | Valor |\n`
    md += `| :--- | :--- |\n`
    md += `| Tamanho Total JS | ${results.bundle.metrics.jsTotalKb.toFixed(2)} KB |\n`
    md += `| Tamanho Total CSS | ${results.bundle.metrics.cssTotalKb.toFixed(2)} KB |\n`
    md += `| Tamanho Total do Bundle | ${results.bundle.metrics.bundleTotalKb.toFixed(2)} KB |\n`
    md += `| Maior Chunk | ${results.bundle.metrics.largestChunk.name} (${results.bundle.metrics.largestChunk.sizeKb.toFixed(2)} KB) |\n`
    md += `| Total de Arquivos | ${results.bundle.metrics.fileCount} |\n`
    md += `| Arquivos JS | ${results.bundle.metrics.jsFileCount} |\n`
    md += `| Arquivos CSS | ${results.bundle.metrics.cssFileCount} |\n`
    md += `| Assets | ${results.bundle.metrics.assetsCount} |\n\n`

    // Top chunks
    if (results.bundle.details?.chunks?.length > 0) {
      md += `### Maiores Arquivos\n\n`
      md += `| Arquivo | Tipo | Tamanho (KB) |\n`
      md += `| :--- | :--- | :--- |\n`
      for (const chunk of results.bundle.details.chunks.slice(0, 10)) {
        md += `| ${chunk.name} | ${chunk.type.toUpperCase()} | ${chunk.size.toFixed(2)} |\n`
      }
      md += `\n`
    }

    // Violations
    if (results.bundle.violations?.length > 0) {
      md += `### ⚠️ Alertas\n\n`
      for (const v of results.bundle.violations) {
        md += `- **${v.metric}**: ${v.value} (limite: ${v.threshold})\n`
      }
      md += `\n`
    } else {
      md += `### ✅ Sem Alertas\n\n`
      md += `O bundle está dentro dos limites definidos.\n\n`
    }
  }

  // Dependencies Section
  if (results.dependencies) {
    md += `## 📚 Análise de Dependências\n\n`
    md += `| Métrica | Valor |\n`
    md += `| :--- | :--- |\n`
    md += `| Total de Dependências | ${results.dependencies.total || 'N/A'} |\n`
    md += `| Dependências de Produção | ${results.dependencies.production || 'N/A'} |\n`
    md += `| Dependências de Desenvolvimento | ${results.dependencies.development || 'N/A'} |\n\n`
  }

  md += `---\n*Gerado pelo Quality Core - Analysis Module*\n`

  return md
}

/**
 * Get git commit hash
 */
function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
  } catch {
    return 'unknown'
  }
}

/**
 * Analyze dependencies from package.json
 */
function analyzeDependencies() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    )

    const deps = Object.keys(pkg.dependencies || {})
    const devDeps = Object.keys(pkg.devDependencies || {})

    return {
      total: deps.length + devDeps.length,
      production: deps.length,
      development: devDeps.length,
      productionList: deps,
      developmentList: devDeps,
    }
  } catch (err) {
    console.error(
      '[ANALYSIS - ERROR] Failed to analyze dependencies:',
      err.message
    )
    return null
  }
}

/**
 * Run all analysis
 */
async function runAnalysis() {
  console.log('[ANALYSIS - INFO] Starting analysis...')
  console.log(`[ANALYSIS - INFO] Output directory: ${ANALYSIS_DIR}`)

  const timestamp = Date.now()
  const results = {
    meta: {
      timestamp,
      commit: getGitCommit(),
      project: 'spread',
    },
  }

  // 1. Bundle Analysis
  console.log('[ANALYSIS - INFO] Running bundle analysis...')
  try {
    const bundleResult = await BundleAnalysisAudit.run({
      distDir: DIST_DIR,
      thresholds: {
        build: {
          bundle_total_kb: 500,
          largest_chunk_kb: 200,
          css_total_kb: 100,
        },
      },
    })
    results.bundle = bundleResult
    console.log(
      `[ANALYSIS - INFO] Bundle total: ${bundleResult.metrics.bundleTotalKb.toFixed(2)} KB`
    )
  } catch (err) {
    console.error('[ANALYSIS - ERROR] Bundle analysis failed:', err.message)
    results.bundle = { error: err.message }
  }

  // 2. Dependencies Analysis
  console.log('[ANALYSIS - INFO] Analyzing dependencies...')
  results.dependencies = analyzeDependencies()
  if (results.dependencies) {
    console.log(
      `[ANALYSIS - INFO] Found ${results.dependencies.total} dependencies`
    )
  }

  // Save JSON report
  const jsonFilename = `analysis-${timestamp}.json`
  saveJsonReport(jsonFilename, results)

  // Save latest JSON
  saveJsonReport('analysis-latest.json', results)

  // Generate and save Markdown report
  const mdContent = generateMarkdownReport(results)
  const mdFilename = `analysis-${timestamp}.md`
  const mdFilepath = getSafeFilePath(mdFilename)
  // Safe: mdFilepath is validated by getSafeFilePath to prevent path traversal

  fs.writeFileSync(mdFilepath, mdContent)
  console.log(`[ANALYSIS - INFO] Markdown report saved: ${mdFilepath}`)

  // Save latest Markdown
  const latestMdPath = getSafeFilePath('analysis-latest.md')
  // Safe: latestMdPath is validated by getSafeFilePath to prevent path traversal

  fs.writeFileSync(latestMdPath, mdContent)

  console.log('[ANALYSIS - INFO] Analysis complete!')
  console.log(`[ANALYSIS - INFO] Reports saved to: ${ANALYSIS_DIR}`)

  return results
}

// Run if called directly
if (require.main === module) {
  runAnalysis().catch(err => {
    console.error('[ANALYSIS - ERROR] Analysis failed:', err)
    process.exit(1)
  })
}

module.exports = { runAnalysis }
