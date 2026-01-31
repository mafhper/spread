/**
 * Quality Core Runner
 * Orchestrates the execution of audits and aggregates results.
 */

async function runAudits({ audits, context }) {
  const result = {
    meta: {
      timestamp: Date.now(),
      preset: context.preset,
      project: 'spread',
      commit: process.env.GITHUB_SHA || 'local',
    },
    status: 'pass',
    scores: {},
    violations: [],
    raw: {},
  }

  let failed = false

  console.log(`\n🚀 Starting Quality Core Audit (${context.preset})...`)

  for (const audit of audits) {
    console.log(`\n➡️  Running audit: ${audit.name}...`)
    try {
      const out = await audit.run(context)

      // Normalize score
      result.scores[audit.name] = out.score
      result.raw[audit.name] = out.raw || {}

      if (out.violations && out.violations.length > 0) {
        console.log(`   ⚠️  ${out.violations.length} violations found.`)
        for (const v of out.violations) {
          result.violations.push(v)
          if (v.severity === 'error') {
            failed = true
            console.log(
              `      🔴 [${v.metric}] ${v.value} (Threshold: ${v.threshold})`
            )
          } else {
            console.log(
              `      🟡 [${v.metric}] ${v.value} (Threshold: ${v.threshold})`
            )
          }
        }
      } else {
        console.log(`   ✅ passed`)
      }
    } catch (err) {
      console.error(`   ❌ Failed to run audit ${audit.name}:`, err)
      result.violations.push({
        area: audit.name,
        metric: 'execution_error',
        value: err.message,
        threshold: null,
        severity: 'error',
      })
      failed = true
    }
  }

  result.status = failed ? 'fail' : 'pass'

  if (failed) {
    console.log(`\n❌ Quality Check Failed.`)
  } else {
    console.log(`\n✅ Quality Check Passed!`)
  }

  return result
}

module.exports = { runAudits }
