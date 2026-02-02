import { describe, it, expect } from 'vitest'
import {
  detectPlatform,
  generateMessageSuggestions,
  formatMessageForExport,
  getFrameSuggestions,
} from '@/services/messageSuggestions'

describe('messageSuggestions service', () => {
  describe('detectPlatform', () => {
    it('should detect YouTube accurately', () => {
      expect(detectPlatform('youtube.com', 'default')).toBe('youtube')
      expect(detectPlatform('youtu.be', 'default')).toBe('youtube')
      expect(detectPlatform('youtube-nocookie.com', 'default')).toBe('youtube')
      expect(detectPlatform('youtube.com', 'music')).toBe('youtube-music')
    })

    it('should detect YouTube Music accurately', () => {
      expect(detectPlatform('music.youtube.com', 'default')).toBe(
        'youtube-music'
      )
    })

    it('should detect social platforms', () => {
      expect(detectPlatform('twitter.com', 'default')).toBe('twitter')
      expect(detectPlatform('x.com', 'default')).toBe('twitter')
      expect(detectPlatform('instagram.com', 'default')).toBe('instagram')
    })

    it('should detect music platforms', () => {
      expect(detectPlatform('spotify.com', 'music')).toBe('spotify')
      expect(detectPlatform('soundcloud.com', 'music')).toBe('soundcloud')
      expect(detectPlatform('bandcamp.com', 'music')).toBe('bandcamp')
      expect(detectPlatform('music.apple.com', 'music')).toBe('apple-music')
      expect(detectPlatform('deezer.com', 'music')).toBe('deezer')
      expect(detectPlatform('tidal.com', 'music')).toBe('tidal')
    })

    it('should fallback to generic for unknown domains', () => {
      expect(detectPlatform('example.com', 'default')).toBe('generic')
    })
  })

  describe('generateMessageSuggestions', () => {
    const mockMetadata = {
      title: 'Test Song (Official Video)',
      description: 'A test description for the song',
      author: 'Test Artist',
      domain: 'spotify.com',
      template: 'music' as const,
      url: 'https://spotify.com/track/1',
    }

    it('should generate 3 suggestions for music platform (different tones)', () => {
      const suggestions = generateMessageSuggestions(mockMetadata)
      expect(suggestions).toHaveLength(3)

      const tones = suggestions.map(s => s.tone)
      expect(tones).toContain('casual')
      expect(tones).toContain('neutral')
      expect(tones).toContain('excited')

      expect(suggestions[0].text).toContain('#Spread')
      expect(suggestions[0].text).toContain('Test Artist')
      // Should clean the title
      expect(suggestions[0].text).toContain('Test Song')
      expect(suggestions[0].text).not.toContain('(Official Video)')
    })

    it('should generate suggestions for video platform', () => {
      const videoMetadata = {
        ...mockMetadata,
        domain: 'youtube.com',
        template: 'default' as const,
      }
      const suggestions = generateMessageSuggestions(videoMetadata)
      expect(suggestions[0].platform).toBe('youtube')
      expect(suggestions[0].text).toContain('vídeo')
      expect(suggestions[0].text).toContain('Test Artist') // Channel name
    })

    it('should handle missing author or description', () => {
      const minimalMetadata = {
        title: 'Simple Title',
        description: '',
        author: '',
        domain: 'generic.com',
        template: 'default' as const,
        url: 'https://link.com',
      }
      const suggestions = generateMessageSuggestions(minimalMetadata)
      expect(suggestions[0].text).toContain('Simple Title')
      expect(suggestions[0].text).not.toContain('// //') // Should not have empty author lines
    })
  })

  describe('formatMessageForExport', () => {
    const mockMetadata = {
      title: 'Export Test',
      description: 'Test description',
      author: 'Author',
      domain: 'example.com',
      template: 'default' as const,
      url: 'https://example.com',
    }

    it('should respect tone option', () => {
      const casual = formatMessageForExport(mockMetadata, { tone: 'casual' })
      const excited = formatMessageForExport(mockMetadata, { tone: 'excited' })
      expect(casual).not.toBe(excited)
    })

    it('should remove hashtag if requested', () => {
      const withHash = formatMessageForExport(mockMetadata, {
        includeHashtag: true,
      })
      const withoutHash = formatMessageForExport(mockMetadata, {
        includeHashtag: false,
      })

      expect(withHash).toContain('#Spread')
      expect(withoutHash).not.toContain('#Spread')
    })

    it('should allow custom intro', () => {
      const custom = formatMessageForExport(mockMetadata, {
        customIntro: 'My Custom Intro',
      })
      expect(custom.startsWith('My Custom Intro')).toBe(true)
    })
  })

  describe('getFrameSuggestions', () => {
    it('should return music-related frames for music platforms', () => {
      const frames = getFrameSuggestions('spotify')
      expect(frames).toContain('vinyl')
      expect(frames).toContain('cd-case')
    })

    it('should return poster-style frames for generic platforms', () => {
      const frames = getFrameSuggestions('generic')
      expect(frames).toContain('poster')
      expect(frames).toContain('frame-elegant')
    })

    it('should return video frames for YouTube', () => {
      const frames = getFrameSuggestions('youtube')
      expect(frames).toContain('poster')
    })
  })
})
