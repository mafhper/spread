import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchMetadata } from '@/services/metadata'

describe('metadata service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('fetchMetadata', () => {
    it('should fetch metadata successfully', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          title: 'Test Title',
          description: 'Test Description',
          image: { url: 'https://example.com/image.jpg' },
          logo: { url: 'https://example.com/favicon.ico' },
          author: 'Test Author',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchMetadata('https://example.com')

      expect(result).not.toBeNull()
      expect(result?.title).toBe('Test Title')
      expect(result?.description).toBe('Test Description')
      expect(result?.image).toBe('https://example.com/image.jpg')
      expect(result?.author).toBe('Test Author')
      expect(result?.domain).toBe('example.com')
      expect(result?.template).toBe('news')
    })

    it('should handle URLs without protocol', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          title: 'Test',
          description: '',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchMetadata('example.com')

      expect(result).not.toBeNull()
      expect(result?.title).toBe('Test')
    })

    it('should detect music template for Spotify URLs', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          title: 'Artist - Track Name',
          description: 'Listen on Spotify',
          image: { url: 'https://spotify.com/image.jpg' },
          author: 'Spotify',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchMetadata('https://open.spotify.com/track/123')

      expect(result?.template).toBe('music')
    })

    it('should detect music template for YouTube URLs', async () => {
      const mockYouTubeResponse = {
        title: 'Video Title',
        author_name: 'Channel Name',
        thumbnail_url: 'https://i.ytimg.com/hqdefault.jpg',
      }

      const mockMicrolinkResponse = {
        status: 'success',
        data: {
          title: 'Video Title',
          description: 'Video description',
          image: { url: 'https://youtube.com/image.jpg' },
          author: 'YouTube Channel',
        },
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockYouTubeResponse),
        } as Response)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockMicrolinkResponse),
        } as Response)

      const result = await fetchMetadata('https://youtube.com/watch?v=123')

      expect(result?.template).toBe('music')
    })

    it('should detect news template for news domains', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          title: 'Breaking News',
          description: 'News article',
          image: { url: 'https://bbc.com/image.jpg' },
          author: 'BBC',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchMetadata('https://bbc.com/news/article')

      expect(result?.template).toBe('news')
    })

    it('should use default template for unknown domains', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          title: 'Some Page',
          description: 'Description',
          image: { url: 'https://unknown.com/image.jpg' },
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchMetadata('https://unknown-site.com/page')

      expect(result?.template).toBe('default')
    })

    it('should parse music titles with artist - track format', async () => {
      const mockYouTubeResponse = {
        title: 'The Beatles - Hey Jude',
        author_name: 'The Beatles',
        thumbnail_url: 'https://i.ytimg.com/hqdefault.jpg',
      }

      const mockMicrolinkResponse = {
        status: 'success',
        data: {
          title: 'The Beatles - Hey Jude',
          description: 'Listen',
          author: 'The Beatles',
        },
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockYouTubeResponse),
        } as Response)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockMicrolinkResponse),
        } as Response)

      const result = await fetchMetadata(
        'https://music.youtube.com/watch?v=123'
      )

      expect(result?.template).toBe('music')
      expect(result?.title).toBe('Hey Jude')
      expect(result?.author).toBe('The Beatles')
    })

    it('should generate favicon from domain when logo is missing', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          title: 'Test',
          description: '',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchMetadata('https://mysite.com/page')

      expect(result?.favicon).toContain('google.com/s2/favicons')
      expect(result?.favicon).toContain('mysite.com')
    })

    it('should handle failed API response', async () => {
      const mockResponse = {
        status: 'error',
        message: 'Failed to fetch',
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchMetadata('https://error.com')

      expect(result).not.toBeNull()
      expect(result?.title).toBe('')
      expect(result?.description).toBe('')
    })

    it('should handle fetch error', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchMetadata('https://example.com')

      expect(result).toBeNull()
    })

    it('should handle invalid URLs gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Invalid URL'))

      const result = await fetchMetadata('not-a-valid-url')

      expect(result).toBeNull()
    })

    it('should remove www. from domain', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          title: 'Test',
          description: '',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchMetadata('https://www.example.com')

      expect(result?.domain).toBe('example.com')
    })

    it('should use publisher as author when author is missing', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          title: 'Test',
          description: '',
          publisher: 'Publisher Name',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchMetadata('https://example.com')

      expect(result?.author).toBe('Publisher Name')
    })

    it('should handle YouTube oEmbed data when available', async () => {
      const mockYouTubeResponse = {
        title: 'YouTube Video Title',
        author_name: 'Channel Name',
        thumbnail_url: 'https://i.ytimg.com/hqdefault.jpg',
      }

      const mockMicrolinkResponse = {
        status: 'success',
        data: {
          title: 'Fallback Title',
          description: 'Description',
          image: { url: 'https://fallback.com/image.jpg' },
        },
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockYouTubeResponse),
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockMicrolinkResponse),
        } as Response)

      const result = await fetchMetadata('https://youtube.com/watch?v=test')

      expect(result?.title).toBe('YouTube Video Title')
      expect(result?.author).toBe('Channel Name')
    })

    it('should fall back to YouTube oEmbed when Microlink fails', async () => {
      const mockYouTubeResponse = {
        title: 'Karma Police',
        author_name: 'Radiohead',
        thumbnail_url: 'https://i.ytimg.com/hqdefault.jpg',
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockYouTubeResponse),
        } as Response)
        // Microlink hangs/aborts/fails — must not discard the oEmbed data
        .mockRejectedValueOnce(new Error('Microlink timeout'))

      const result = await fetchMetadata(
        'https://music.youtube.com/watch?v=123'
      )

      expect(result).not.toBeNull()
      expect(result?.title).toBe('Karma Police')
      expect(result?.author).toBe('Radiohead')
      expect(result?.image).toBe('https://i.ytimg.com/hqdefault.jpg')
      expect(result?.favicon).toContain('google.com/s2/favicons')
    })

    it('should clean YouTube author name by removing " - Topic"', async () => {
      const mockYouTubeResponse = {
        title: 'Track Name',
        author_name: 'Artist Name - Topic',
        thumbnail_url: 'https://i.ytimg.com/hqdefault.jpg',
      }

      const mockMicrolinkResponse = {
        status: 'success',
        data: {
          title: 'Track Name',
          author: 'Artist Name - Topic',
        },
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockYouTubeResponse),
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockMicrolinkResponse),
        } as Response)

      const result = await fetchMetadata('https://youtube.com/watch?v=test')

      expect(result?.author).toBe('Artist Name')
    })
  })
})
