import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isDevMode } from '@/utils/env'

describe('env utilities', () => {
  let originalProcess: NodeJS.Process | undefined
  let originalWindow: (Window & typeof globalThis) | undefined

  beforeEach(() => {
    // Store original values
    originalProcess = globalThis.process
    originalWindow = globalThis.window
  })

  afterEach(() => {
    // Restore original values
    if (originalProcess !== undefined) {
      globalThis.process = originalProcess
    }
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow
    }
    vi.clearAllMocks()
  })

  describe('isDevMode', () => {
    it('should return true when process.env.NODE_ENV is "development"', () => {
      // Mock process
      globalThis.process = {
        env: {
          NODE_ENV: 'development',
        },
      } as unknown as NodeJS.Process

      const result = isDevMode()
      expect(result).toBe(true)
    })

    it('should return true when process.env.NODE_ENV is "dev"', () => {
      // Mock process
      globalThis.process = {
        env: {
          NODE_ENV: 'dev',
        },
      } as unknown as NodeJS.Process

      const result = isDevMode()
      expect(result).toBe(true)
    })

    it('should return false when process.env.NODE_ENV is "production"', () => {
      // Mock process
      globalThis.process = {
        env: {
          NODE_ENV: 'production',
        },
      } as unknown as NodeJS.Process

      // Also need to mock window for this test to ensure process is checked first
      Reflect.deleteProperty(globalThis, 'window')

      const result = isDevMode()
      expect(result).toBe(false)
    })

    it('should check window.location.hostname when process is undefined', () => {
      // Remove process
      Reflect.deleteProperty(globalThis, 'process')

      // Mock window
      globalThis.window = {
        location: {
          hostname: 'localhost',
        },
      } as unknown as Window & typeof globalThis

      const result = isDevMode()
      expect(result).toBe(true)
    })

    it('should return true when hostname is localhost', () => {
      // Remove process
      Reflect.deleteProperty(globalThis, 'process')

      // Mock window with localhost
      globalThis.window = {
        location: {
          hostname: 'localhost',
        },
      } as unknown as Window & typeof globalThis

      const result = isDevMode()
      expect(result).toBe(true)
    })

    it('should return true when hostname is 127.0.0.1', () => {
      // Remove process
      Reflect.deleteProperty(globalThis, 'process')

      // Mock window with localhost IP
      globalThis.window = {
        location: {
          hostname: '127.0.0.1',
        },
      } as unknown as Window & typeof globalThis

      const result = isDevMode()
      expect(result).toBe(true)
    })

    it('should return false when hostname is not localhost', () => {
      // Remove process
      Reflect.deleteProperty(globalThis, 'process')

      // Mock window with production hostname
      globalThis.window = {
        location: {
          hostname: 'example.com',
        },
      } as unknown as Window & typeof globalThis

      const result = isDevMode()
      expect(result).toBe(false)
    })

    it('should handle window.location.hostname access error gracefully', () => {
      // Remove process
      Reflect.deleteProperty(globalThis, 'process')

      // Mock window with error on hostname access
      globalThis.window = {
        location: {
          get hostname() {
            throw new Error('Cross-origin error')
          },
        },
      } as unknown as Window & typeof globalThis

      const result = isDevMode()
      expect(result).toBe(false)
    })

    it('should return false when both process and window are undefined', () => {
      // Remove both
      Reflect.deleteProperty(globalThis, 'process')
      Reflect.deleteProperty(globalThis, 'window')

      const result = isDevMode()
      expect(result).toBe(false)
    })
  })
})
