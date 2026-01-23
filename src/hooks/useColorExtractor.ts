import { useState, useCallback } from 'react'
import ColorThief from 'colorthief'

interface ExtractedColors {
  primary: string
  secondary: string
  palette: string[]
}

// CORS proxy for external images
const CORS_PROXY = 'https://corsproxy.io/?'

export function useColorExtractor() {
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      '#' +
      [r, g, b]
        .map(x => {
          const hex = x.toString(16)
          return hex.length === 1 ? '0' + hex : hex
        })
        .join('')
    )
  }

  // Darken a color for better gradient effect
  const darkenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max((num >> 16) - amt, 0)
    const G = Math.max(((num >> 8) & 0x00ff) - amt, 0)
    const B = Math.max((num & 0x0000ff) - amt, 0)
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
  }

  const extractColorsFromImage = useCallback(
    async (imageUrl: string): Promise<ExtractedColors | null> => {
      setIsExtracting(true)
      setError(null)
      console.log(
        '[useColorExtractor] Starting extraction for:',
        imageUrl.substring(0, 50) + '...'
      )

      const isDataUrl = imageUrl.startsWith('data:')
      const isLocalUrl =
        imageUrl.startsWith('/') || imageUrl.includes('localhost')

      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'

        img.onload = () => {
          try {
            const colorThief = new ColorThief()
            const dominant = colorThief.getColor(img)
            const palette = colorThief.getPalette(img, 5)

            const primary = rgbToHex(dominant[0], dominant[1], dominant[2])
            const secondary =
              palette.length > 1
                ? rgbToHex(palette[1][0], palette[1][1], palette[1][2])
                : darkenColor(primary, 30)

            const hexPalette = palette.map((c: number[]) =>
              rgbToHex(c[0], c[1], c[2])
            )

            console.log('[useColorExtractor] Extracted colors:', {
              primary,
              secondary,
              palette: hexPalette,
            })
            setIsExtracting(false)
            resolve({ primary, secondary, palette: hexPalette })
          } catch (e) {
            console.error('[useColorExtractor] ColorThief error:', e)
            setError('Failed to extract colors')
            setIsExtracting(false)
            reject(e)
          }
        }

        img.onerror = () => {
          console.error(
            '[useColorExtractor] Image failed to load:',
            imageUrl.substring(0, 50)
          )
          // Try with CORS proxy if direct fails
          if (!isDataUrl && !isLocalUrl && !imageUrl.includes(CORS_PROXY)) {
            console.log('[useColorExtractor] Retrying with CORS proxy...')
            img.src = CORS_PROXY + encodeURIComponent(imageUrl)
          } else {
            setError('Failed to load image')
            setIsExtracting(false)
            reject(new Error('Failed to load image'))
          }
        }

        // Start loading
        if (isDataUrl || isLocalUrl) {
          img.src = imageUrl
        } else {
          img.src = imageUrl // Try direct first
        }
      })
    },
    [rgbToHex, darkenColor]
  )

  return {
    extractColorsFromImage,
    isExtracting,
    error,
  }
}
