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

// Microlink scrapes the page server-side and can be slow (or hang) for
// JS-heavy pages like YouTube Music. Cap it so the link processing never
// blocks indefinitely; when it times out we fall back to oEmbed data.
const MICROLINK_TIMEOUT_MS = 9000
const OEMBED_TIMEOUT_MS = 5000

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  externalSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController()
  const abortFromExternal = () => controller.abort(externalSignal?.reason)
  externalSignal?.addEventListener('abort', abortFromExternal, { once: true })
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', abortFromExternal)
  }
}

// YouTube oEmbed for better music data
async function fetchYouTubeData(
  url: string,
  signal?: AbortSignal
): Promise<{ title: string; author: string; thumbnail: string } | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const response = await fetchWithTimeout(
      oembedUrl,
      OEMBED_TIMEOUT_MS,
      signal
    )
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
function parseMusicTitle(
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
function detectTemplate(url: string): 'default' | 'music' | 'news' {
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
  return 'default'
}

interface MicrolinkMetadata {
  title: string
  description: string
  image: string | null
  favicon: string | null
  author: string
}

async function fetchMicrolinkData(
  targetUrl: string,
  fallbackFavicon: string,
  signal?: AbortSignal
): Promise<MicrolinkMetadata | null> {
  const response = await fetchWithTimeout(
    `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`,
    MICROLINK_TIMEOUT_MS,
    signal
  )
  if ('ok' in response && response.ok === false) return null

  const json = await response.json()
  if (json.status !== 'success') return null

  const data = json.data
  return {
    title: data.title || '',
    description: data.description || '',
    image: data.image?.url || null,
    favicon: data.logo?.url || fallbackFavicon,
    author: data.author || data.publisher || '',
  }
}

export async function fetchMetadata(
  url: string,
  options: { signal?: AbortSignal } = {}
): Promise<LinkMetadata | null> {
  try {
    let targetUrl = url
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl
    }

    const domain = new URL(targetUrl).hostname.replace('www.', '')
    const isYouTube =
      targetUrl.includes('youtube') || targetUrl.includes('youtu.be')

    const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    const youtubeRequest = isYouTube
      ? fetchYouTubeData(targetUrl, options.signal)
      : Promise.resolve(null)
    const microlinkRequest = fetchMicrolinkData(
      targetUrl,
      fallbackFavicon,
      options.signal
    ).catch(error => {
      if (!isYouTube) throw error
      console.warn(
        'Microlink failed, falling back to YouTube oEmbed only:',
        error
      )
      return null
    })
    const [youtubeData, microlinkData] = await Promise.all([
      youtubeRequest,
      microlinkRequest,
    ])
    if (!youtubeData && !microlinkData) return null

    let title = microlinkData?.title || ''
    const description = microlinkData?.description || ''
    let image: string | null = microlinkData?.image || null
    let author = microlinkData?.author || ''
    const favicon: string | null = microlinkData?.favicon || fallbackFavicon

    // Override with YouTube data if available (better for music)
    if (youtubeData) {
      title = youtubeData.title || title
      author = youtubeData.author || author
      if (youtubeData.thumbnail) {
        image = youtubeData.thumbnail
      }
    }

    // Parse music title for artist/track separation
    const template = detectTemplate(targetUrl)
    if (template === 'music') {
      const parsed = parseMusicTitle(title, author)
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
