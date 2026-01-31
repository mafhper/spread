import { describe, it, expect } from 'vitest'
import { computeUnifiedExportScale } from '../../../../src/utils/exportScale'

describe('exportScale - computeUnifiedExportScale', () => {
  it('should return 1 for default parameters', () => {
    const result = computeUnifiedExportScale({})
    expect(result).toBe(1)
  })

  it('should multiply exportScale correctly', () => {
    const result = computeUnifiedExportScale({ exportScale: 2 })
    expect(result).toBe(2)
  })

  it('should multiply cardScale correctly', () => {
    const result = computeUnifiedExportScale({ cardScale: 1.5 })
    expect(result).toBe(1.5)
  })

  it('should multiply autoScale correctly', () => {
    const result = computeUnifiedExportScale({ autoScale: 0.8 })
    expect(result).toBe(0.8)
  })

  it('should multiply all scales together', () => {
    const result = computeUnifiedExportScale({
      exportScale: 2,
      cardScale: 1.5,
      autoScale: 0.5,
    })
    expect(result).toBe(1.5) // 2 * 1.5 * 0.5
  })

  it('should handle zero values', () => {
    const result = computeUnifiedExportScale({
      exportScale: 0,
      cardScale: 1.5,
      autoScale: 2,
    })
    expect(result).toBe(0)
  })

  it('should handle preset parameter (ignored in calculation)', () => {
    const result = computeUnifiedExportScale({
      exportScale: 2,
      preset: 'auto',
    })
    expect(result).toBe(2)
  })

  it('should handle undefined parameters as 1', () => {
    const result = computeUnifiedExportScale({
      exportScale: undefined,
      cardScale: undefined,
      autoScale: undefined,
    })
    expect(result).toBe(1)
  })

  it('should handle negative scales', () => {
    const result = computeUnifiedExportScale({
      exportScale: -1,
      cardScale: 2,
    })
    expect(result).toBe(-2)
  })

  it('should handle very small decimal scales', () => {
    const result = computeUnifiedExportScale({
      exportScale: 0.001,
      cardScale: 0.001,
    })
    expect(result).toBe(0.000001)
  })

  it('should handle large scales', () => {
    const result = computeUnifiedExportScale({
      exportScale: 100,
      cardScale: 100,
      autoScale: 100,
    })
    expect(result).toBe(1000000)
  })
})
