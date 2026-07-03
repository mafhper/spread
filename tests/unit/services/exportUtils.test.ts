import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  blobToBase64,
  urlToBase64,
  getEmbeddedFontCSS,
  nextAnimationFrame,
  waitForImages,
  waitForStableLayout,
} from '@/services/exportUtils'

describe('exportUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('blobToBase64', () => {
    it('should convert blob to base64 string', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' })
      const result = await blobToBase64(mockBlob)

      expect(result).toContain('data:text/plain;base64,')
      expect(typeof result).toBe('string')
    })

    it('should handle empty blob', async () => {
      const mockBlob = new Blob([], { type: 'text/plain' })
      const result = await blobToBase64(mockBlob)

      expect(result).toContain('data:text/plain;base64,')
    })

    it('should handle different content types', async () => {
      const mockBlob = new Blob(['image data'], { type: 'image/png' })
      const result = await blobToBase64(mockBlob)

      expect(result).toContain('data:image/png;base64,')
    })
  })

  describe('urlToBase64', () => {
    it('should fetch and convert URL to base64', async () => {
      const mockBase64 = 'data:image/png;base64,iVBORw0KGgo='

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(['image'], { type: 'image/png' })),
      } as Response)

      // Create a proper FileReader mock that triggers onloadend synchronously
      class MockFileReader {
        result = mockBase64
        onloadend: (() => void) | null = null
        onerror: ((error: Error) => void) | null = null

        readAsDataURL() {
          // Trigger onloadend synchronously
          if (this.onloadend) {
            this.onloadend()
          }
        }
      }
      global.FileReader = MockFileReader as unknown as typeof FileReader

      const result = await urlToBase64('https://example.com/image.png')
      expect(result).toBe(mockBase64)
    })

    it('should return null when fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await urlToBase64('https://example.com/fail.png')
      expect(result).toBeNull()
    })

    it('should use proxy for high-risk domains', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(['image'], { type: 'image/png' })),
      } as Response)

      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onloadend: null as (() => void) | null,
        onerror: null as ((error: Error) => void) | null,
        result: 'data:image/png;base64,test',
      }
      global.FileReader = vi.fn(
        () => mockFileReader
      ) as unknown as typeof FileReader

      const promise = urlToBase64('https://youtube.com/watch?v=test')

      setTimeout(() => {
        if (mockFileReader.onloadend) mockFileReader.onloadend()
      }, 0)

      await promise

      // Should use proxy for YouTube URLs
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('wsrv.nl'),
        expect.any(Object)
      )
    })

    it('should handle non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response)

      const result = await urlToBase64('https://example.com/notfound.png')
      expect(result).toBeNull()
    })
  })

  describe('getEmbeddedFontCSS', () => {
    it('should fetch and embed font CSS', async () => {
      const mockCss = `
        @font-face {
          font-family: 'Inter';
          src: url(https://fonts.gstatic.com/s/inter/v1/test.woff2) format('woff2');
        }
      `

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          text: () => Promise.resolve(mockCss),
        } as Response)
        .mockResolvedValueOnce({
          blob: () =>
            Promise.resolve(new Blob(['font data'], { type: 'font/woff2' })),
        } as Response)

      // Create a proper FileReader mock that triggers onloadend synchronously
      class MockFileReader {
        result = 'data:font/woff2;base64,fontbase64'
        onloadend: (() => void) | null = null
        onerror: ((error: Error) => void) | null = null

        readAsDataURL() {
          if (this.onloadend) {
            this.onloadend()
          }
        }
      }
      global.FileReader = MockFileReader as unknown as typeof FileReader

      const result = await getEmbeddedFontCSS('Inter')
      expect(result).toContain('data:font/woff2;base64,fontbase64')
    })

    it('should handle font fetch failure gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await getEmbeddedFontCSS('NonExistent')
      expect(result).toBe('')
    })

    it('should handle empty font family', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        text: () => Promise.resolve(''),
      } as Response)

      const result = await getEmbeddedFontCSS('')
      expect(result).toBe('')
    })

    it('should replace spaces with plus signs in font family', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        text: () => Promise.resolve(''),
      } as Response)

      await getEmbeddedFontCSS('Open Sans')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('Open+Sans')
      )
    })
  })

  describe('nextAnimationFrame', () => {
    it('should resolve without throwing', async () => {
      await expect(nextAnimationFrame()).resolves.toBeUndefined()
    })
  })

  describe('waitForImages', () => {
    it('should resolve immediately when there are no images', async () => {
      const target = document.createElement('div')
      await expect(waitForImages(target)).resolves.toBeUndefined()
    })

    it('should await img.decode() for each image', async () => {
      const target = document.createElement('div')
      const img = document.createElement('img')
      const decode = vi.fn().mockResolvedValue(undefined)
      ;(img as unknown as { decode: () => Promise<void> }).decode = decode
      target.appendChild(img)

      await waitForImages(target)
      expect(decode).toHaveBeenCalledTimes(1)
    })

    it('should not reject when decode fails (best-effort)', async () => {
      const target = document.createElement('div')
      const img = document.createElement('img')
      ;(img as unknown as { decode: () => Promise<void> }).decode = vi
        .fn()
        .mockRejectedValue(new Error('decode failed'))
      target.appendChild(img)

      await expect(waitForImages(target)).resolves.toBeUndefined()
    })

    it('should fall back to load/error events when decode is absent', async () => {
      const target = document.createElement('div')
      const img = document.createElement('img')
      ;(img as unknown as { decode?: unknown }).decode = undefined
      Object.defineProperty(img, 'complete', { value: false })
      target.appendChild(img)

      const promise = waitForImages(target)
      img.dispatchEvent(new Event('load'))
      await expect(promise).resolves.toBeUndefined()
    })
  })

  describe('waitForStableLayout', () => {
    it('should resolve once dimensions are stable across frames', async () => {
      const target = document.createElement('div')
      await expect(waitForStableLayout(target, 3)).resolves.toBeUndefined()
    })
  })
})
