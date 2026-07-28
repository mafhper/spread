import type { PageFrameSettings } from '../../types/capture'

export interface PageFrameBounds {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Resolve the exact rectangle for a captured page. Preview and export receive
 * this same rectangle, avoiding browser-specific object-fit rounding.
 */
export function resolvePageFrame(
  source: { width: number; height: number },
  canvas: { width: number; height: number },
  frame: PageFrameSettings
): PageFrameBounds {
  const sourceWidth = Math.max(1, source.width)
  const sourceHeight = Math.max(1, source.height)
  const canvasWidth = Math.max(1, canvas.width)
  const canvasHeight = Math.max(1, canvas.height)
  const fitScale =
    frame.fit === 'cover'
      ? Math.max(canvasWidth / sourceWidth, canvasHeight / sourceHeight)
      : Math.min(canvasWidth / sourceWidth, canvasHeight / sourceHeight)
  const scale = fitScale * Math.max(0.25, Math.min(4, frame.scale || 1))
  const width = sourceWidth * scale
  const height = sourceHeight * scale
  const horizontalGap = canvasWidth - width
  const verticalGap = canvasHeight - height
  const offsetX = Math.max(-50, Math.min(50, frame.offsetX || 0)) / 50
  const offsetY = Math.max(-50, Math.min(50, frame.offsetY || 0)) / 50

  return {
    width,
    height,
    left: horizontalGap / 2 + (horizontalGap / 2) * offsetX,
    top: verticalGap / 2 + (verticalGap / 2) * offsetY,
  }
}
