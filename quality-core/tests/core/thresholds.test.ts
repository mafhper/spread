import { describe, it, expect } from 'vitest'

// Importa o módulo de thresholds (CommonJS)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const thresholds = require('../../packages/core/thresholds.cjs')

describe('Thresholds', () => {
  it('should have build thresholds defined', () => {
    expect(thresholds.build).toBeDefined()
    expect(thresholds.build.bundle_total_kb).toBeDefined()
    expect(thresholds.build.largest_chunk_kb).toBeDefined()
    expect(thresholds.build.css_total_kb).toBeDefined()
    expect(thresholds.build.assets_count).toBeDefined()
  })

  it('should have render thresholds defined', () => {
    expect(thresholds.render).toBeDefined()
    expect(thresholds.render.fp_ms).toBeDefined()
    expect(thresholds.render.inp_ms).toBeDefined()
    expect(thresholds.render.cls).toBeDefined()
    expect(thresholds.render.long_task_ms).toBeDefined()
    expect(thresholds.render.long_tasks_total_ms).toBeDefined()
  })

  it('should have network thresholds defined', () => {
    expect(thresholds.network).toBeDefined()
    expect(thresholds.network.api_timeout_ms).toBeDefined()
  })

  it('should have ux thresholds defined', () => {
    expect(thresholds.ux).toBeDefined()
    expect(thresholds.ux.min_target_size).toBeDefined()
  })

  it('should have a11y thresholds defined', () => {
    expect(thresholds.a11y).toBeDefined()
    expect(thresholds.a11y.max_critical_violations).toBeDefined()
  })

  it('should have reasonable threshold values', () => {
    // Build thresholds should be positive numbers
    expect(thresholds.build.bundle_total_kb).toBeGreaterThan(0)
    expect(thresholds.build.largest_chunk_kb).toBeGreaterThan(0)
    expect(thresholds.build.css_total_kb).toBeGreaterThan(0)
    expect(thresholds.build.assets_count).toBeGreaterThan(0)

    // Render thresholds should be positive numbers
    expect(thresholds.render.fp_ms).toBeGreaterThan(0)
    expect(thresholds.render.inp_ms).toBeGreaterThan(0)
    expect(thresholds.render.cls).toBeGreaterThanOrEqual(0)
    expect(thresholds.render.long_task_ms).toBeGreaterThan(0)
    expect(thresholds.render.long_tasks_total_ms).toBeGreaterThan(0)

    // Network timeout should be reasonable (between 1s and 30s)
    expect(thresholds.network.api_timeout_ms).toBeGreaterThanOrEqual(1000)
    expect(thresholds.network.api_timeout_ms).toBeLessThanOrEqual(30000)

    // UX target size should be at least 44px (WCAG guideline)
    expect(thresholds.ux.min_target_size).toBeGreaterThanOrEqual(44)

    // A11y should allow zero critical violations
    expect(thresholds.a11y.max_critical_violations).toBe(0)
  })

  it('should have bundle total larger than largest chunk', () => {
    expect(thresholds.build.bundle_total_kb).toBeGreaterThan(
      thresholds.build.largest_chunk_kb
    )
  })

  it('should have long tasks total larger than single task', () => {
    expect(thresholds.render.long_tasks_total_ms).toBeGreaterThan(
      thresholds.render.long_task_ms
    )
  })
})
