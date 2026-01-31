/**
 * Export Utilities
 * Helpers to embed fonts and images as Base64 to prevent CORS/Security errors in html-to-image
 */

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Fetches an image (bypassing CORS if possible via proxy if needed, or just standard fetch)
 * and returns a Base64 string.
 */
const PROXIES = [
  // Primary (Reliable Image Proxy)
  (url: string) => `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=jpg`,
  // Mirror of wsrv.nl
  (url: string) =>
    `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg`,
  // Fallbacks
  (url: string) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) =>
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
]

const PROXY_TIMEOUT_MS = 8000

export async function urlToBase64(url: string): Promise<string | null> {
  const fetchWithTimeout = async (
    targetUrl: string,
    timeoutMs: number
  ): Promise<Response> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(targetUrl, {
        cache: 'force-cache',
        signal: controller.signal,
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const fetchWithProxy = async (
    targetUrl: string,
    proxyFn: (u: string) => string
  ): Promise<string> => {
    const finalUrl = proxyFn(targetUrl)
    console.log('[Proxy] Trying:', finalUrl.substring(0, 80) + '...')
    const response = await fetchWithTimeout(finalUrl, PROXY_TIMEOUT_MS)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    return await blobToBase64(blob)
  }

  const isHighRisk =
    url.includes('youtube.com') ||
    url.includes('googleusercontent.com') ||
    url.includes('i.ytimg.com') ||
    url.includes('music.youtube.com')

  // 1. Try Direct (if not high risk)
  if (!isHighRisk) {
    try {
      console.log('[Proxy] Attempting direct fetch:', url.substring(0, 80))
      const response = await fetchWithTimeout(url, PROXY_TIMEOUT_MS)
      if (response.ok) {
        const blob = await response.blob()
        return await blobToBase64(blob)
      }
    } catch {
      console.warn('[Proxy] Direct fetch failed, switching to proxies')
    }
  }

  // 2. Try Proxies in order
  for (const proxyFn of PROXIES) {
    try {
      return await fetchWithProxy(url, proxyFn)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      console.warn(`[Proxy] Failed (${errMsg})`)
      continue
    }
  }

  console.error('[Proxy] All proxies failed for:', url.substring(0, 80))
  return null
}

/**
 * Embeds Google Fonts as Base64
 * 1. Fetches the CSS
 * 2. Parses the WOFF2 URLs
 * 3. Fetches WOFF2 data
 * 4. Reconstructs CSS with Data URLs
 */
export async function getEmbeddedFontCSS(fontFamily: string): Promise<string> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`
    const res = await fetch(cssUrl)
    let css = await res.text()

    // Find all URLs in the CSS
    const urlRegex = /url\(([^)]+)\)/g
    const matches = [...css.matchAll(urlRegex)]

    for (const match of matches) {
      const originalUrl = match[1].replace(/['"]/g, '') // Clean quotes

      // Fetch font file
      try {
        const fontRes = await fetch(originalUrl)
        const fontBlob = await fontRes.blob()
        const base64 = await blobToBase64(fontBlob)

        // Replace in CSS
        css = css.replace(match[1], `"${base64}"`)
      } catch {
        console.warn('Failed to embed specific font file:', originalUrl)
      }
    }
    return css
  } catch (e) {
    console.warn('Failed to embed font CSS', e)
    return ''
  }
}
