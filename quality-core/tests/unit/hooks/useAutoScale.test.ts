import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoScale } from '../../../../src/hooks/useAutoScale'

describe('useAutoScale hook', () => {
  // ResizeObserver callback tracking (for testing purposes)
  let mockContainerElement: HTMLDivElement | null = null
  let mockContentElement: HTMLDivElement | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear mocks

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => {
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }
    })

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn(cb => {
      cb(0)
      return 0
    })

    // Mock setTimeout to execute immediately
    vi.useFakeTimers()

    // Create mock elements
    mockContainerElement = document.createElement('div')
    mockContentElement = document.createElement('div')

    // Mock getBoundingClientRect
    mockContainerElement.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
    } as DOMRect)

    // Mock offsetWidth/Height
    Object.defineProperty(mockContentElement, 'offsetWidth', {
      value: 640,
      configurable: true,
    })
    Object.defineProperty(mockContentElement, 'offsetHeight', {
      value: 360,
      configurable: true,
    })

    // Mock console.log
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAutoScale())

    expect(result.current.scale).toBe(1)
    expect(result.current.scalePercent).toBe(100)
    expect(result.current.isAuto).toBe(true)
    expect(result.current.containerRef.current).toBeNull()
    expect(result.current.contentRef.current).toBeNull()
  })

  it('should return correct scalePercent', () => {
    const { result } = renderHook(() => useAutoScale())

    // scalePercent should be scale * 100
    expect(result.current.scalePercent).toBe(100)
  })

  it('should allow setting manual scale', () => {
    const { result } = renderHook(() => useAutoScale())

    act(() => {
      result.current.setManualScale(0.75)
    })

    expect(result.current.scale).toBe(0.75)
    expect(result.current.scalePercent).toBe(75)
    expect(result.current.isAuto).toBe(false)
  })

  it('should respect minScale when setting manual scale', () => {
    const { result } = renderHook(() =>
      useAutoScale({ minScale: 0.3, maxScale: 1.0 })
    )

    act(() => {
      result.current.setManualScale(0.1)
    })

    expect(result.current.scale).toBe(0.3) // Clamped to minScale
  })

  it('should respect maxScale when setting manual scale', () => {
    const { result } = renderHook(() =>
      useAutoScale({ minScale: 0.2, maxScale: 1.0 })
    )

    act(() => {
      result.current.setManualScale(1.5)
    })

    expect(result.current.scale).toBe(1.0) // Clamped to maxScale
  })

  it('should reset to auto scale', () => {
    const { result } = renderHook(() => useAutoScale())

    act(() => {
      result.current.setManualScale(0.5)
    })

    expect(result.current.isAuto).toBe(false)

    act(() => {
      result.current.resetToAuto()
    })

    expect(result.current.isAuto).toBe(true)
  })

  it('should provide working recalculate function', () => {
    const { result } = renderHook(() => useAutoScale())

    act(() => {
      result.current.recalculate()
    })

    // recalculate should be callable without errors
    expect(typeof result.current.recalculate).toBe('function')
  })

  it('should handle disabled state', () => {
    const { result } = renderHook(() => useAutoScale({ enabled: false }))

    act(() => {
      result.current.recalculate()
    })

    // Should not throw and maintain default scale
    expect(result.current.scale).toBe(1)
  })

  it('should use custom options', () => {
    const { result } = renderHook(() =>
      useAutoScale({
        minScale: 0.5,
        maxScale: 2.0,
        padding: 64,
      })
    )

    act(() => {
      result.current.setManualScale(1.5)
    })

    expect(result.current.scale).toBe(1.5)
  })

  it('should attach refs correctly', () => {
    const { result } = renderHook(() => useAutoScale())

    act(() => {
      if (
        result.current.containerRef.current &&
        result.current.contentRef.current
      ) {
        // Refs are assigned
      }
    })

    expect(result.current.containerRef).toBeDefined()
    expect(result.current.contentRef).toBeDefined()
  })

  it('should handle rapid scale changes', () => {
    const { result } = renderHook(() => useAutoScale())

    act(() => {
      result.current.setManualScale(0.5)
    })

    act(() => {
      result.current.setManualScale(0.7)
    })

    act(() => {
      result.current.setManualScale(0.9)
    })

    expect(result.current.scale).toBe(0.9)
  })

  it('should toggle between auto and manual modes', () => {
    const { result } = renderHook(() => useAutoScale())

    expect(result.current.isAuto).toBe(true)

    act(() => {
      result.current.setManualScale(0.8)
    })

    expect(result.current.isAuto).toBe(false)

    act(() => {
      result.current.resetToAuto()
    })

    expect(result.current.isAuto).toBe(true)
  })
})
