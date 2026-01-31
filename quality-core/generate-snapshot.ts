// quality-core/generate-snapshot.ts
import { execSync } from 'child_process'
import { VitestCollector } from './vitest.collector'
import { calculateHealthScore } from './health-score'
import { SnapshotStore } from './snapshots.store'
import type { QualitySnapshot } from './quality-schema'

/**
 * Script principal para gerar um snapshot de qualidade para o commit atual.
 */
async function generateSnapshot() {
  console.log('🚀 Generating Quality Snapshot...')

  try {
    // 1. Obter informações do Git
    const commit = execSync('git rev-parse --short HEAD', {
      encoding: 'utf-8',
    }).trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
    }).trim()
    const timestamp = new Date().toISOString()

    // 2. Coletar métricas (MVP: Vitest)
    console.log('🧪 Collecting Test Metrics...')
    const { tests, coverage } = await VitestCollector.collect()

    // 3. Métricas de Performance
    const performance = {
      lighthouse: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
      },
      webVitals: {
        lcp: 0,
        cls: 0,
        tbt: 0,
      },
      bundleSize: 0,
      regressions: [], // Fixed: included property
    }

    // 4. Métricas de Estabilidade
    const stability = {
      uptime: 100,
      latency: 0,
      lastCheck: timestamp,
      status: 'online' as const,
    }

    // 5. Calcular Health Score
    console.log('📊 Calculating Health Score...')
    const healthResult = calculateHealthScore(
      performance,
      tests,
      coverage,
      stability
    )

    // 6. Criar Snapshot (New Schema)
    const snapshot: QualitySnapshot = {
      version: '1.1',
      commitHash: commit,
      branch,
      timestamp,
      healthScore: healthResult.score,
      confidenceLevel: healthResult.confidence,
      metrics: {
        tests,
        coverage,
        performance,
        stability,
      },
    }

    // 7. Salvar Snapshot
    await SnapshotStore.save(snapshot)
    console.log(`✅ Snapshot saved for commit ${commit}`)
    console.log(
      `📈 Score: ${snapshot.healthScore} (${snapshot.confidenceLevel} confidence)`
    )

    if (healthResult.explanations.length > 0) {
      console.log('⚠️ Explanations:')
      healthResult.explanations.forEach(e => console.log(`   - ${e}`))
    }
  } catch (err) {
    console.error(
      '❌ Failed to generate snapshot:',
      err instanceof Error ? err.message : String(err)
    )
    process.exit(1)
  }
}

generateSnapshot()
