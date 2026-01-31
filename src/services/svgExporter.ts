/**
 * SVG Exporter - Canvas-based PNG export for Frames
 *
 * This module provides a dedicated export path for SVG-based frames,
 * bypassing `html-to-image` which fails due to CORS issues.
 * The image MUST be embedded as Base64 in the SVG before calling this.
 *
 * @version 1.0.0
 */

export interface ExportOptions {
  /** Target width in pixels (height will auto-scale) */
  width?: number
  /** Pixel ratio (e.g., 2 for 2x resolution) */
  pixelRatio?: number
}

/**
 * Exports an SVG string to a PNG Blob using the Canvas API.
 *
 * @param svgString - The complete SVG markup as a string (with embedded images).
 * @param options - Export configuration.
 * @returns A Promise resolving to a PNG Blob.
 */
export async function exportSvgToPng(
  svgString: string,
  options: ExportOptions = {}
): Promise<Blob> {
  const { width = 1200, pixelRatio = 2 } = options

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate dimensions preserving aspect ratio
        const aspectRatio = img.naturalHeight / img.naturalWidth
        const canvasWidth = width * pixelRatio
        const canvasHeight = Math.round(canvasWidth * aspectRatio)

        const canvas = document.createElement('canvas')
        canvas.width = canvasWidth
        canvas.height = canvasHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('[SVG-EXPORTER] Failed to get 2D context'))
          return
        }

        // Draw SVG image to canvas
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

        // Export as PNG
        canvas.toBlob(
          blob => {
            if (blob) {
              console.log('[SVG-EXPORTER] Export successful:', {
                width: canvasWidth,
                height: canvasHeight,
                size: `${(blob.size / 1024).toFixed(1)}KB`,
              })
              resolve(blob)
            } else {
              reject(new Error('[SVG-EXPORTER] toBlob returned null'))
            }
          },
          'image/png',
          1.0
        )
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = err => {
      console.error('[SVG-EXPORTER] Image load failed:', err)
      reject(new Error('[SVG-EXPORTER] Failed to load SVG as image'))
    }

    // Encode SVG to data URL
    const svgBase64 = btoa(unescape(encodeURIComponent(svgString)))
    img.src = `data:image/svg+xml;base64,${svgBase64}`
  })
}

/**
 * Extracts the inner HTML (SVG content) from a SvgFrameRenderer container.
 * This is the markup that contains the embedded Base64 image.
 *
 * @param containerEl - The DOM element wrapping the SVG content.
 * @returns The SVG string or null if not found.
 */
export function getSvgContentFromContainer(
  containerEl: HTMLElement
): string | null {
  const svgEl = containerEl.querySelector('svg')
  if (!svgEl) {
    console.error('[SVG-EXPORTER] No SVG element found in container')
    return null
  }
  const serializer = new XMLSerializer()
  return serializer.serializeToString(svgEl)
}
