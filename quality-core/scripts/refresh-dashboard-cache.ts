import { writeDashboardCache } from '../dashboard-cache'

const args = process.argv.slice(2)
const isSilent = args.includes('--silent') || args.includes('-s')
const isQuiet = args.includes('--quiet') || args.includes('-q')

async function main() {
  try {
    const payload = await writeDashboardCache()
    if (!isSilent && !isQuiet) {
      console.log('Dashboard cache atualizado.')
      console.log(`Snapshots: ${payload.summary.count}`)
      if (payload.summary.latestTimestamp) {
        console.log(`Latest: ${payload.summary.latestTimestamp}`)
      }
    }
  } catch (err) {
    if (!isSilent) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[dashboard-cache] Falha ao atualizar cache:', message)
    }
    process.exitCode = 1
  }
}

main()
