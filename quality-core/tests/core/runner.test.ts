import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Importa o módulo runner (CommonJS)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { runAudits } = require('../../packages/core/runner.cjs')

describe('AuditRunner', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should run audits successfully with passing results', async () => {
    const mockAudit = {
      name: 'test-audit',
      run: vi.fn().mockResolvedValue({
        score: 100,
        violations: [],
        raw: { test: true },
      }),
    }

    const context = {
      preset: 'quick',
      url: 'http://localhost:3000',
    }

    const result = await runAudits({
      audits: [mockAudit],
      context,
    })

    expect(result.status).toBe('pass')
    expect(result.scores['test-audit']).toBe(100)
    expect(result.violations).toHaveLength(0)
    expect(result.meta.preset).toBe('quick')
    expect(result.meta.project).toBe('spread')
  })

  it('should handle audit with warnings', async () => {
    const mockAudit = {
      name: 'test-audit',
      run: vi.fn().mockResolvedValue({
        score: 85,
        violations: [
          {
            area: 'test-audit',
            metric: 'test-metric',
            value: 50,
            threshold: 40,
            severity: 'warn',
          },
        ],
        raw: {},
      }),
    }

    const context = {
      preset: 'quick',
      url: 'http://localhost:3000',
    }

    const result = await runAudits({
      audits: [mockAudit],
      context,
    })

    expect(result.status).toBe('pass')
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].severity).toBe('warn')
  })

  it('should fail when audit has errors', async () => {
    const mockAudit = {
      name: 'test-audit',
      run: vi.fn().mockResolvedValue({
        score: 50,
        violations: [
          {
            area: 'test-audit',
            metric: 'critical-metric',
            value: 100,
            threshold: 50,
            severity: 'error',
          },
        ],
        raw: {},
      }),
    }

    const context = {
      preset: 'full',
      url: 'http://localhost:3000',
    }

    const result = await runAudits({
      audits: [mockAudit],
      context,
    })

    expect(result.status).toBe('fail')
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].severity).toBe('error')
  })

  it('should handle multiple audits', async () => {
    const mockAudit1 = {
      name: 'audit-1',
      run: vi.fn().mockResolvedValue({
        score: 100,
        violations: [],
        raw: {},
      }),
    }

    const mockAudit2 = {
      name: 'audit-2',
      run: vi.fn().mockResolvedValue({
        score: 90,
        violations: [],
        raw: {},
      }),
    }

    const context = {
      preset: 'quick',
      url: 'http://localhost:3000',
    }

    const result = await runAudits({
      audits: [mockAudit1, mockAudit2],
      context,
    })

    expect(result.status).toBe('pass')
    expect(result.scores['audit-1']).toBe(100)
    expect(result.scores['audit-2']).toBe(90)
  })

  it('should handle audit execution errors', async () => {
    const mockAudit = {
      name: 'failing-audit',
      run: vi.fn().mockRejectedValue(new Error('Test error')),
    }

    const context = {
      preset: 'quick',
      url: 'http://localhost:3000',
    }

    const result = await runAudits({
      audits: [mockAudit],
      context,
    })

    expect(result.status).toBe('fail')
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].area).toBe('failing-audit')
    expect(result.violations[0].metric).toBe('execution_error')
    expect(result.violations[0].severity).toBe('error')
  })

  it('should include timestamp in meta', async () => {
    const mockAudit = {
      name: 'test-audit',
      run: vi.fn().mockResolvedValue({
        score: 100,
        violations: [],
        raw: {},
      }),
    }

    const context = {
      preset: 'quick',
      url: 'http://localhost:3000',
    }

    const before = Date.now()
    const result = await runAudits({
      audits: [mockAudit],
      context,
    })
    const after = Date.now()

    expect(result.meta.timestamp).toBeGreaterThanOrEqual(before)
    expect(result.meta.timestamp).toBeLessThanOrEqual(after)
  })

  it('should include raw data in result', async () => {
    const rawData = { custom: 'data', value: 42 }
    const mockAudit = {
      name: 'test-audit',
      run: vi.fn().mockResolvedValue({
        score: 95,
        violations: [],
        raw: rawData,
      }),
    }

    const context = {
      preset: 'quick',
      url: 'http://localhost:3000',
    }

    const result = await runAudits({
      audits: [mockAudit],
      context,
    })

    expect(result.raw['test-audit']).toEqual(rawData)
  })

  it('should handle empty audits array', async () => {
    const context = {
      preset: 'quick',
      url: 'http://localhost:3000',
    }

    const result = await runAudits({
      audits: [],
      context,
    })

    expect(result.status).toBe('pass')
    expect(result.violations).toHaveLength(0)
    expect(Object.keys(result.scores)).toHaveLength(0)
  })
})
