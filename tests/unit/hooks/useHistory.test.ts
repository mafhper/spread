import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHistory } from '@/hooks/useHistory'
import { useCardStore } from '@/store/cardStore'

// Mock the card store
vi.mock('@/store/cardStore', () => ({
  useCardStore: vi.fn(),
}))

describe('useHistory hook', () => {
  const mockSetFullState = vi.fn()
  // Storage key: 'spread_history_v1' (used internally by the hook)

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    // Mock crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: vi.fn(() => 'test-uuid-123'),
      },
      writable: true,
    })

    // Default mock for useCardStore
    vi.mocked(useCardStore).mockReturnValue({
      setFullState: mockSetFullState,
    } as unknown as ReturnType<typeof useCardStore>)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with empty history', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const { result } = renderHook(() => useHistory())

    expect(result.current.history).toEqual([])
  })

  it('should load history from localStorage on mount', () => {
    const storedHistory = [
      {
        id: '1',
        url: 'https://example.com',
        title: 'Example',
        timestamp: Date.now(),
        fullState: {},
      },
    ]
    vi.mocked(localStorage.getItem).mockReturnValue(
      JSON.stringify(storedHistory)
    )

    const { result } = renderHook(() => useHistory())

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].url).toBe('https://example.com')
  })

  it('should handle localStorage parse error gracefully', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('invalid json')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useHistory())

    expect(result.current.history).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse history')

    consoleSpy.mockRestore()
  })

  it('should save to history', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const { result } = renderHook(() => useHistory())

    const currentState = {
      url: 'https://test.com',
      title: 'Test Title',
      description: 'Test Description',
      author: 'Test Author',
      domain: 'test.com',
      template: 'default',
      colors: { bg1: '#000', bg2: '#fff', text: '#fff' },
      gradientStyle: '135deg',
      pattern: 'none',
      patternOpacity: 0.1,
      patternScale: 1,
      layout: {},
      canvasSize: {},
      cardPosition: { x: 0, y: 0 },
      fontFamily: 'Inter',
      titleSize: 24,
      subtitleSize: 16,
      textAlign: 'left',
      image: null,
      customBgImage: null,
      favicon: null,
    }

    act(() => {
      result.current.saveToHistory(currentState)
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].url).toBe('https://test.com')
    expect(result.current.history[0].title).toBe('Test Title')
    expect(localStorage.setItem).toHaveBeenCalled()
  })

  it('should limit history to 3 items', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const { result } = renderHook(() => useHistory())

    const baseState = {
      url: 'https://test.com',
      title: 'Test',
      description: '',
      author: '',
      domain: 'test.com',
      template: 'default',
      colors: { bg1: '#000', bg2: '#fff', text: '#fff' },
      gradientStyle: '135deg',
      pattern: 'none',
      patternOpacity: 0.1,
      patternScale: 1,
      layout: {},
      canvasSize: {},
      cardPosition: { x: 0, y: 0 },
      fontFamily: 'Inter',
      titleSize: 24,
      subtitleSize: 16,
      textAlign: 'left',
      image: null,
      customBgImage: null,
      favicon: null,
    }

    // Add 4 items
    for (let i = 0; i < 4; i++) {
      act(() => {
        result.current.saveToHistory({
          ...baseState,
          url: `https://test${i}.com`,
        })
      })
    }

    expect(result.current.history).toHaveLength(3)
    // Most recent should be first
    expect(result.current.history[0].url).toBe('https://test3.com')
  })

  it('should prune large strings from state', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const { result } = renderHook(() => useHistory())

    const largeString = 'x'.repeat(40000)
    const currentState = {
      url: 'https://test.com',
      title: 'Test',
      description: '',
      author: '',
      domain: 'test.com',
      template: 'default',
      colors: { bg1: '#000', bg2: '#fff', text: '#fff' },
      gradientStyle: '135deg',
      pattern: 'none',
      patternOpacity: 0.1,
      patternScale: 1,
      layout: {},
      canvasSize: {},
      cardPosition: { x: 0, y: 0 },
      fontFamily: 'Inter',
      titleSize: 24,
      subtitleSize: 16,
      textAlign: 'left',
      image: largeString,
      customBgImage: largeString,
      favicon: largeString,
    }

    act(() => {
      result.current.saveToHistory(currentState)
    })

    const savedItem = result.current.history[0]
    expect(savedItem.fullState.image).toBeNull()
    expect(savedItem.fullState.customBgImage).toBeNull()
    expect(savedItem.fullState.favicon).toBeNull()
  })

  it('should load from history', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const { result } = renderHook(() => useHistory())

    const historyItem = {
      id: 'test-id',
      url: 'https://history.com',
      title: 'History Title',
      timestamp: Date.now(),
      fullState: {
        url: 'https://history.com',
        title: 'History Title',
      },
    }

    act(() => {
      result.current.loadFromHistory(historyItem)
    })

    expect(mockSetFullState).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://history.com',
        title: 'History Title',
        isWelcomeState: false,
      })
    )
  })

  it('preserves a direct page capture and its framing in history', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    const { result } = renderHook(() => useHistory())
    const pageCapture = {
      image: 'data:image/png;base64,captured-page',
      width: 1440,
      height: 900,
      settings: { viewport: 'desktop', area: 'viewport' },
      capturedAt: 1,
    }

    act(() => {
      result.current.saveToHistory({
        url: 'https://history.com/page',
        title: 'Captured page',
        outputMode: 'page-capture',
        mediaSource: 'page',
        pageCapture,
        pageFrame: { fit: 'cover', scale: 1.5, offsetX: 25, offsetY: -25 },
      })
    })

    expect(result.current.history[0].fullState).toMatchObject({
      outputMode: 'page-capture',
      mediaSource: 'page',
      pageCapture,
      pageFrame: { fit: 'cover', scale: 1.5, offsetX: 25, offsetY: -25 },
    })

    act(() => {
      result.current.loadFromHistory(result.current.history[0])
    })

    expect(mockSetFullState).toHaveBeenCalledWith(
      expect.objectContaining({
        outputMode: 'page-capture',
        mediaSource: 'page',
        pageCapture,
      })
    )
  })

  it('should delete from history', () => {
    const initialHistory = [
      {
        id: '1',
        url: 'https://first.com',
        title: 'First',
        timestamp: 1,
        fullState: {},
      },
      {
        id: '2',
        url: 'https://second.com',
        title: 'Second',
        timestamp: 2,
        fullState: {},
      },
    ]
    vi.mocked(localStorage.getItem).mockReturnValue(
      JSON.stringify(initialHistory)
    )

    const { result } = renderHook(() => useHistory())

    act(() => {
      result.current.deleteFromHistory('1')
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].id).toBe('2')
    expect(localStorage.setItem).toHaveBeenCalled()
  })

  it('should use Date.now() as fallback when crypto.randomUUID is not available', () => {
    // Remove crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {},
      writable: true,
    })

    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1234567890)

    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const { result } = renderHook(() => useHistory())

    const currentState = {
      url: 'https://test.com',
      title: 'Test',
      description: '',
      author: '',
      domain: 'test.com',
      template: 'default',
      colors: { bg1: '#000', bg2: '#fff', text: '#fff' },
      gradientStyle: '135deg',
      pattern: 'none',
      patternOpacity: 0.1,
      patternScale: 1,
      layout: {},
      canvasSize: {},
      cardPosition: { x: 0, y: 0 },
      fontFamily: 'Inter',
      titleSize: 24,
      subtitleSize: 16,
      textAlign: 'left',
      image: null,
      customBgImage: null,
      favicon: null,
    }

    act(() => {
      result.current.saveToHistory(currentState)
    })

    expect(result.current.history[0].id).toBe('1234567890')

    dateNowSpy.mockRestore()
  })

  it('should handle localStorage setItem error', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('Quota exceeded')
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useHistory())

    const currentState = {
      url: 'https://test.com',
      title: 'Test',
      description: '',
      author: '',
      domain: 'test.com',
      template: 'default',
      colors: { bg1: '#000', bg2: '#fff', text: '#fff' },
      gradientStyle: '135deg',
      pattern: 'none',
      patternOpacity: 0.1,
      patternScale: 1,
      layout: {},
      canvasSize: {},
      cardPosition: { x: 0, y: 0 },
      fontFamily: 'Inter',
      titleSize: 24,
      subtitleSize: 16,
      textAlign: 'left',
      image: null,
      customBgImage: null,
      favicon: null,
    }

    act(() => {
      result.current.saveToHistory(currentState)
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
