/**
 * Enhanced Metadata Service
 * Combines Microlink with YouTube oEmbed for better music metadata
 */

export interface LinkMetadata {
  title: string
  description: string
  image: string | null
  favicon: string | null
  domain: string
  author: string
  template: 'default' | 'music' | 'news'
}

// YouTube oEmbed for better music data
async function fetchYouTubeData(
  url: string
): Promise<{ title: string; author: string; thumbnail: string } | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const response = await fetch(oembedUrl)
    if (!response.ok) return null

    const data = await response.json()

    // Clean author name (remove " - Topic" suffix common in YouTube Music)
    let author = data.author_name || ''
    author = author.replace(/ - Topic$/, '')

    return {
      title: data.title || '',
      author,
      thumbnail: data.thumbnail_url || '',
    }
  } catch {
    return null
  }
}

// Parse music title to extract artist/track
function parseMusircTitle(
  title: string,
  author: string
): { cleanTitle: string; artist: string } {
  // If title contains " - ", it's likely "Artist - Track"
  if (title.includes(' - ')) {
    const parts = title.split(' - ')
    if (parts.length >= 2) {
      return {
        artist: parts[0].trim(),
        cleanTitle: parts.slice(1).join(' - ').trim(),
      }
    }
  }
  return { cleanTitle: title, artist: author }
}

// Detect template based on URL and metadata
function detectTemplate(
  url: string,
  author: string
): 'default' | 'music' | 'news' {
  const musicDomains = [
    'music.youtube',
    'spotify',
    'soundcloud',
    'bandcamp',
    'deezer',
    'tidal',
    'apple.com/music',
  ]
  const newsDomains = [
    'bbc',
    'cnn',
    'reuters',
    'nytimes',
    'washingtonpost',
    'theguardian',
    'g1.globo',
    'uol.com.br/noticias',
  ]

  const urlLower = url.toLowerCase()

  if (musicDomains.some(d => urlLower.includes(d))) return 'music'
  if (
    urlLower.includes('youtube') &&
    (urlLower.includes('watch') || urlLower.includes('youtu.be'))
  )
    return 'music'
  if (newsDomains.some(d => urlLower.includes(d))) return 'news'
  if (author && author.length > 0) return 'news'

  return 'default'
}

export async function fetchMetadata(url: string): Promise<LinkMetadata | null> {
  try {
    let targetUrl = url
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl
    }

    const domain = new URL(targetUrl).hostname.replace('www.', '')
    const isYouTube =
      targetUrl.includes('youtube') || targetUrl.includes('youtu.be')

    // Try YouTube oEmbed first for YouTube URLs
    let youtubeData = null
    if (isYouTube) {
      youtubeData = await fetchYouTubeData(targetUrl)
    }

    // Fallback to Microlink for other metadata
    const encodedUrl = encodeURIComponent(targetUrl)
    const response = await fetch(`https://api.microlink.io?url=${encodedUrl}`)
    const json = await response.json()

    let title = ''
    let description = ''
    let image: string | null = null
    let author = ''
    let favicon: string | null = null

    if (json.status === 'success') {
      const data = json.data
      title = data.title || ''
      description = data.description || ''
      image = data.image?.url || null
      favicon =
        data.logo?.url ||
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      author = data.author || data.publisher || ''
    }

    // Override with YouTube data if available (better for music)
    if (youtubeData) {
      title = youtubeData.title || title
      author = youtubeData.author || author
      if (youtubeData.thumbnail) {
        image = youtubeData.thumbnail
      }
    }

    // Parse music title for artist/track separation
    const template = detectTemplate(targetUrl, author)
    if (template === 'music') {
      const parsed = parseMusircTitle(title, author)
      title = parsed.cleanTitle
      author = parsed.artist
    }

    return {
      title,
      description,
      image,
      favicon,
      domain,
      author,
      template,
    }
  } catch (error) {
    console.error('Metadata fetch failed:', error)
    return null
  }
}
