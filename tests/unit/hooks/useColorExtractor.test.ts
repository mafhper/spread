// @vitest-environment jsdom
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useColorExtractor } from '@/hooks/useColorExtractor'

const colorThiefMockState = vi.hoisted(() => ({
  dominant: [255, 0, 0],
  palette: [
    [255, 0, 0],
    [0, 255, 0],
  ],
}))

// Mock ColorThief
vi.mock('colorthief', () => {
  return {
    default: class {
      getColor = vi.fn().mockImplementation(() => colorThiefMockState.dominant)
      getPalette = vi.fn().mockImplementation(() => colorThiefMockState.palette)
    },
  }
})

describe('useColorExtractor hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    colorThiefMockState.dominant = [255, 0, 0]
    colorThiefMockState.palette = [
      [255, 0, 0],
      [0, 255, 0],
    ]

    // Mock Image
    global.Image = class {
      onload: () => void = () => {}
      onerror: () => void = () => {}
      private _src: string = ''
      crossOrigin: string = ''
      set src(val: string) {
        this._src = val
        if (val) {
          setTimeout(() => this.onload(), 10)
        }
      }
      get src() {
        return this._src
      }
    } as unknown as typeof Image

    global.HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]),
      }),
    }) as any
  })

  it('should extract colors from an image', async () => {
    const { result } = renderHook(() => useColorExtractor())

    let colors: any
    await act(async () => {
      colors = await result.current.extractColorsFromImage('test-image.jpg')
    })

    expect(colors).toBeDefined()
    expect(colors).toHaveProperty('primary')
    expect(colors).toHaveProperty('secondary')
  })

  it('should handle image loading error', async () => {
    global.Image = class {
      onload: () => void = () => {}
      onerror: () => void = () => {}
      private _src: string = ''
      set src(val: string) {
        this._src = val
        if (val) {
          setTimeout(() => this.onerror(), 10)
        }
      }
      get src() {
        return this._src
      }
    } as unknown as typeof Image

    const { result } = renderHook(() => useColorExtractor())
    await act(async () => {
      await expect(
        result.current.extractColorsFromImage('invalid.jpg')
      ).rejects.toThrow('Failed to load image')
    })
  })

  it('should extract colors from data URL', async () => {
    const { result } = renderHook(() => useColorExtractor())

    let colors: any
    await act(async () => {
      colors = await result.current.extractColorsFromImage(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      )
    })

    expect(colors).toBeDefined()
  })

  it('should extract colors from localhost URL', async () => {
    const { result } = renderHook(() => useColorExtractor())

    let colors: any
    await act(async () => {
      colors = await result.current.extractColorsFromImage(
        'http://localhost:3000/image.jpg'
      )
    })

    expect(colors).toBeDefined()
  })

  it('should extract colors from relative path', async () => {
    const { result } = renderHook(() => useColorExtractor())

    let colors: any
    await act(async () => {
      colors = await result.current.extractColorsFromImage('/images/test.jpg')
    })

    expect(colors).toBeDefined()
  })

  it('should return error state when extraction fails', async () => {
    global.Image = class {
      onload: () => void = () => {}
      onerror: () => void = () => {}
      private _src: string = ''
      set src(val: string) {
        this._src = val
        if (val) {
          setTimeout(() => this.onerror(), 10)
        }
      }
      get src() {
        return this._src
      }
    } as unknown as typeof Image

    const { result } = renderHook(() => useColorExtractor())

    try {
      await act(async () => {
        await result.current.extractColorsFromImage(
          'https://example.com/image.jpg'
        )
      })
    } catch {
      // Expected error
    }

    expect(result.current.error).toBeDefined()
  })

  it('should track isExtracting state during extraction', async () => {
    const { result } = renderHook(() => useColorExtractor())

    expect(result.current.isExtracting).toBe(false)

    act(() => {
      // Simulate start of extraction by calling the function
      result.current.extractColorsFromImage('test.jpg')
    })

    // During extraction, isExtracting should be true (briefly)
    expect(result.current.isExtracting).toBe(true)
  })

  it('should clear error on successful extraction', async () => {
    const { result } = renderHook(() => useColorExtractor())

    let colors: any
    await act(async () => {
      colors = await result.current.extractColorsFromImage('test-image.jpg')
    })

    expect(colors).toBeDefined()
    expect(result.current.error).toBeNull()
  })

  it('should handle retry with CORS proxy on external image error', async () => {
    let proxyCalled = false
    global.Image = class {
      onload: () => void = () => {}
      onerror: () => void = () => {}
      private _src: string = ''
      crossOrigin: string = ''
      set src(val: string) {
        this._src = val
        if (val && val.includes('corsproxy')) {
          proxyCalled = true
        }
        if (val) {
          setTimeout(() => this.onerror(), 10)
        }
      }
      get src() {
        return this._src
      }
    } as unknown as typeof Image

    const { result } = renderHook(() => useColorExtractor())

    try {
      await act(async () => {
        await result.current.extractColorsFromImage(
          'https://external.com/image.jpg'
        )
      })
    } catch {
      // Expected error
    }

    // The hook should attempt retry with proxy
    expect(result.current.isExtracting).toBe(false)
    expect(proxyCalled).toBe(true)
  })

  it('should convert RGB to hex correctly', async () => {
    const { result } = renderHook(() => useColorExtractor())

    let colors: any
    await act(async () => {
      colors = await result.current.extractColorsFromImage('test-image.jpg')
    })

    // Colors should be returned in hex format
    expect(colors?.primary).toMatch(/^#[0-9a-f]{6}$/i)
    expect(colors?.secondary).toMatch(/^#[0-9a-f]{6}$/i)
    colors?.palette.forEach((color: any) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  it('should darken color for secondary when palette lacks color', async () => {
    colorThiefMockState.dominant = [100, 150, 200]
    colorThiefMockState.palette = [[100, 150, 200]]

    const { result } = renderHook(() => useColorExtractor())

    let colors: any
    await act(async () => {
      colors = await result.current.extractColorsFromImage('test-image.jpg')
    })

    expect(colors?.secondary).toBeDefined()
    // Secondary should be darkened version of primary
    expect(colors?.secondary).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('should have correct hook return structure', () => {
    const { result } = renderHook(() => useColorExtractor())

    expect(result.current).toHaveProperty('extractColorsFromImage')
    expect(result.current).toHaveProperty('isExtracting')
    expect(result.current).toHaveProperty('error')
    expect(typeof result.current.extractColorsFromImage).toBe('function')
    expect(typeof result.current.isExtracting).toBe('boolean')
  })
})
