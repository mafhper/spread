/**
 * Vite Bundle Visualizer Plugin Configuration
 * Generates visual bundle analysis reports.
 */
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

/**
 * Creates the bundle visualizer plugin for analysis
 */
export function createBundleVisualizerPlugin() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  return visualizer({
    filename: path.join(
      'performance-reports',
      'analysis',
      `bundle-visual-${timestamp}.html`
    ),
    title: 'Spread - Bundle Analysis',
    open: false,
    gzipSize: true,
    brotliSize: true,
    template: 'treemap', // Options: treemap, sunburst, network
  })
}

/**
 * Creates a JSON stats file for custom analysis
 */
export function createStatsPlugin() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  return visualizer({
    filename: path.join(
      'performance-reports',
      'analysis',
      `bundle-stats-${timestamp}.json`
    ),
    open: false,
    template: 'raw-data',
    gzipSize: true,
    brotliSize: true,
  })
}

/**
 * Get analysis plugins for Vite config
 */
export function getAnalysisPlugins() {
  const isAnalyze = process.env.ANALYZE === 'true'

  if (!isAnalyze) {
    return []
  }

  console.log('[ANALYSIS - INFO] Bundle analysis enabled')

  return [createBundleVisualizerPlugin(), createStatsPlugin()]
}
