import { describe, it, expect } from 'vitest'
import { computeCardAutoScale } from '@/utils/autoScaleEngine'

describe('autoScaleEngine - computeCardAutoScale', () => {
  it('should return 1 when available space equals card size', () => {
    const result = computeCardAutoScale({
      availableWidth: 640,
      availableHeight: 360,
      cardBaseW: 640,
      cardBaseH: 360,
    })
    expect(result).toBe(1)
  })

  it('should scale down when container is smaller than card', () => {
    const result = computeCardAutoScale({
      availableWidth: 320,
      availableHeight: 180,
      cardBaseW: 640,
      cardBaseH: 360,
    })
    expect(result).toBe(0.5)
  })

  it('should scale up when container is larger than card', () => {
    const result = computeCardAutoScale({
      availableWidth: 1280,
      availableHeight: 720,
      cardBaseW: 640,
      cardBaseH: 360,
    })
    expect(result).toBe(2)
  })

  it('should respect maxScale limit', () => {
    const result = computeCardAutoScale({
      availableWidth: 2000,
      availableHeight: 1000,
      cardBaseW: 640,
      cardBaseH: 360,
      maxScale: 2,
    })
    expect(result).toBe(2)
  })

  it('should respect minScale limit', () => {
    const result = computeCardAutoScale({
      availableWidth: 100,
      availableHeight: 50,
      cardBaseW: 640,
      cardBaseH: 360,
      minScale: 0.5,
    })
    expect(result).toBe(0.5)
  })

  it('should use default card dimensions when not provided', () => {
    const result = computeCardAutoScale({
      availableWidth: 640,
      availableHeight: 360,
    })
    expect(result).toBe(1)
  })

  it('should handle non-finite width by returning 1', () => {
    const result = computeCardAutoScale({
      availableWidth: NaN,
      availableHeight: 360,
    })
    expect(result).toBe(1)
  })

  it('should handle non-finite height by returning 1', () => {
    const result = computeCardAutoScale({
      availableWidth: 640,
      availableHeight: Infinity,
    })
    expect(result).toBe(1)
  })

  it('should handle zero dimensions by returning minScale', () => {
    const result = computeCardAutoScale({
      availableWidth: 0,
      availableHeight: 0,
      minScale: 0.5,
    })
    expect(result).toBe(0.5)
  })

  it('should scale based on width when width is the limiting factor', () => {
    const result = computeCardAutoScale({
      availableWidth: 320, // 50% of 640
      availableHeight: 500, // More than enough
      cardBaseW: 640,
      cardBaseH: 360,
    })
    expect(result).toBe(0.5)
  })

  it('should scale based on height when height is the limiting factor', () => {
    const result = computeCardAutoScale({
      availableWidth: 1000, // More than enough
      availableHeight: 180, // 50% of 360
      cardBaseW: 640,
      cardBaseH: 360,
    })
    expect(result).toBe(0.5)
  })

  it('should handle default minScale and maxScale', () => {
    const result = computeCardAutoScale({
      availableWidth: 640,
      availableHeight: 360,
    })
    // Default maxScale is 3, minScale is 0.5
    expect(result).toBeGreaterThanOrEqual(0.5)
    expect(result).toBeLessThanOrEqual(3)
  })

  it('should handle square aspect ratio', () => {
    const result = computeCardAutoScale({
      availableWidth: 500,
      availableHeight: 500,
      cardBaseW: 1000,
      cardBaseH: 1000,
    })
    expect(result).toBe(0.5)
  })

  it('should handle portrait orientation', () => {
    const result = computeCardAutoScale({
      availableWidth: 360,
      availableHeight: 640,
      cardBaseW: 360,
      cardBaseH: 640,
    })
    expect(result).toBe(1)
  })
})
