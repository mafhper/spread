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

export async function urlToBase64(
  url: string,
  options: { signal?: AbortSignal } = {}
): Promise<string | null> {
  const fetchWithTimeout = async (
    targetUrl: string,
    timeoutMs: number
  ): Promise<Response> => {
    const controller = new AbortController()
    const abortFromExternal = () => controller.abort(options.signal?.reason)
    options.signal?.addEventListener('abort', abortFromExternal, { once: true })
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(targetUrl, {
        cache: 'force-cache',
        signal: controller.signal,
      })
      return response
    } finally {
      clearTimeout(timeoutId)
      options.signal?.removeEventListener('abort', abortFromExternal)
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

  // 2. Race all proxy options. A slow endpoint can no longer multiply the
  // timeout by the number of providers.
  try {
    return await Promise.any(
      PROXIES.map(proxyFn =>
        fetchWithProxy(url, proxyFn).catch(error => {
          const message =
            error instanceof Error ? error.message : 'Unknown error'
          console.warn(`[Proxy] Failed (${message})`)
          throw error
        })
      )
    )
  } catch {
    // All providers failed.
  }

  console.error('[Proxy] All proxies failed for:', url.substring(0, 80))
  return null
}

/**
 * Aguarda o próximo frame de animação (resolve imediatamente fora do browser).
 */
export function nextAnimationFrame(): Promise<void> {
  return new Promise(resolve => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve())
    } else {
      resolve()
    }
  })
}

/**
 * Aguarda todas as <img> dentro de `target` ficarem decodificadas antes da
 * rasterização. Usa img.decode() quando disponível e cai em onload/onerror.
 * É best-effort: um decode que falha (ex.: imagem via proxy) não bloqueia o
 * export — apenas garante que não capturamos imagens ainda não prontas.
 */
export async function waitForImages(target: HTMLElement): Promise<void> {
  const images = Array.from(target.querySelectorAll('img'))
  await Promise.all(
    images.map(async img => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode()
        } else if (!img.complete) {
          await new Promise<void>(resolve => {
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          })
        }
      } catch {
        // decode falhou (CORS/proxy): seguimos com fallback do pipeline
      }
    })
  )
}

/**
 * Confirma que as dimensões do alvo estão estáveis entre frames consecutivos,
 * evitando capturar durante um reflow (fontes/imagens alterando a geometria).
 */
export async function waitForStableLayout(
  target: HTMLElement,
  maxFrames = 5
): Promise<void> {
  let prev = `${target.offsetWidth}x${target.offsetHeight}`
  for (let i = 0; i < maxFrames; i++) {
    await nextAnimationFrame()
    const current = `${target.offsetWidth}x${target.offsetHeight}`
    if (current === prev) return
    prev = current
  }
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
