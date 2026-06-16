import { describe, it, expect } from 'vitest'
import {
  getServiceIcon,
  getMusicIcon,
  DEFAULT_ICON,
} from '@/services/iconLibrary'

describe('iconLibrary service', () => {
  describe('getServiceIcon', () => {
    it('should return default icon for empty domain', () => {
      const result = getServiceIcon('')
      expect(result.Icon).toBe(DEFAULT_ICON)
      expect(result.hasIcon).toBe(false)
    })

    it('should return YouTube icon for youtube.com', () => {
      const result = getServiceIcon('https://www.youtube.com/watch?v=123')
      expect(result.hasIcon).toBe(true)
      expect(result.color).toBe('#FF0000')
    })

    it('should return Spotify music icon', () => {
      const result = getServiceIcon('spotify.com')
      expect(result.hasIcon).toBe(true)
      expect(result.color).toBe('#1DB954')
    })

    it('should handle subdomains (music.apple.com)', () => {
      const result = getServiceIcon('music.apple.com')
      expect(result.hasIcon).toBe(true)
      expect(result.color).toBe('#FA243C')
    })

    it('should handle X/Twitter mapping', () => {
      const result = getServiceIcon('x.com')
      expect(result.hasIcon).toBe(true)
      expect(result.color).toBe('#000000')
    })

    it('should return default icon for unknown domain', () => {
      const result = getServiceIcon('unknown-domain.xyz')
      expect(result.hasIcon).toBe(false)
      expect(result.Icon).toBe(DEFAULT_ICON)
    })

    it('should find partial matches (subdomains)', () => {
      const result = getServiceIcon('sub.youtube.com')
      expect(result.hasIcon).toBe(true)
      expect(result.color).toBe('#FF0000')
    })
  })

  describe('getMusicIcon', () => {
    it('should return generic music icon', () => {
      const result = getMusicIcon()
      expect(result.hasIcon).toBe(true)
      expect(result.color).toBe('#1DB954')
    })
  })
})
