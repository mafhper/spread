import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock ResizeObserver
// Mock ResizeObserver as a constructor class
global.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe = vi.fn((element: Element) => {
    // Simular uma notificacao inicial para que componentes que dependem de medicao funcionem
    if (element) {
      this.callback(
        [
          {
            target: element,
            contentRect: {
              width: 800,
              height: 600,
              top: 0,
              left: 0,
              bottom: 600,
              right: 800,
              x: 0,
              y: 0,
              toJSON: () => '',
            },
            borderBoxSize: [
              {
                blockSize: 600,
                inlineSize: 800,
              },
            ],
            contentBoxSize: [
              {
                blockSize: 600,
                inlineSize: 800,
              },
            ],
            devicePixelContentBoxSize: [
              {
                blockSize: 600,
                inlineSize: 800,
              },
            ],
          },
        ],
        this
      )
    }
  })

  unobserve = vi.fn()
  disconnect = vi.fn()
}

// Mock document.fonts
Object.defineProperty(document, 'fonts', {
  value: {
    ready: Promise.resolve(),
    check: () => true,
    load: () => Promise.resolve({}),
  },
  writable: true,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  callback: IntersectionObserverCallback
  root: Element | Document | null = null
  rootMargin: string = '0px'
  thresholds: ReadonlyArray<number> = [0]

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe = vi.fn((target: Element) => {
    // Simular que o elemento esta visivel
    this.callback(
      [
        {
          target,
          isIntersecting: true,
          intersectionRatio: 1,
          intersectionRect: {
            top: 0,
            left: 0,
            bottom: 600,
            right: 800,
            width: 800,
            height: 600,
            x: 0,
            y: 0,
            toJSON: () => '',
          },
          boundingClientRect: {
            top: 0,
            left: 0,
            bottom: 600,
            right: 800,
            width: 800,
            height: 600,
            x: 0,
            y: 0,
            toJSON: () => '',
          },
          rootBounds: null,
          time: Date.now(),
        },
      ],
      this
    )
  })

  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn().mockReturnValue([])
}
