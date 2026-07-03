export interface CompositionCanvasGeometry {
  mode: 'auto' | 'fixed'
  width: number
  height: number
  padding: number
}

export interface CompositionCardGeometry {
  width: number
  height: number
  scale: number
  x: number
  y: number
}

export interface CompositionShadowGeometry {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
}

export interface ResolvedCompositionGeometry {
  width: number
  height: number
  clip: boolean
  cardCenterX: number
  cardCenterY: number
}

interface Bounds {
  left: number
  top: number
  right: number
  bottom: number
}

function resolveVisualBounds(
  card: CompositionCardGeometry,
  shadow: CompositionShadowGeometry
): Bounds {
  const scaledWidth = card.width * card.scale
  const scaledHeight = card.height * card.scale
  const cardBounds = {
    left: card.x - scaledWidth / 2,
    top: card.y - scaledHeight / 2,
    right: card.x + scaledWidth / 2,
    bottom: card.y + scaledHeight / 2,
  }
  const shadowExtent = shadow.blur + Math.max(0, shadow.spread)
  const shadowBounds = {
    left: cardBounds.left + shadow.offsetX - shadowExtent,
    top: cardBounds.top + shadow.offsetY - shadowExtent,
    right: cardBounds.right + shadow.offsetX + shadowExtent,
    bottom: cardBounds.bottom + shadow.offsetY + shadowExtent,
  }

  return {
    left: Math.min(cardBounds.left, shadowBounds.left),
    top: Math.min(cardBounds.top, shadowBounds.top),
    right: Math.max(cardBounds.right, shadowBounds.right),
    bottom: Math.max(cardBounds.bottom, shadowBounds.bottom),
  }
}

export function resolveCompositionGeometry({
  canvas,
  card,
  shadow,
}: {
  canvas: CompositionCanvasGeometry
  card: CompositionCardGeometry
  shadow: CompositionShadowGeometry
}): ResolvedCompositionGeometry {
  if (canvas.mode === 'fixed') {
    return {
      width: Math.max(1, Math.round(canvas.width)),
      height: Math.max(1, Math.round(canvas.height)),
      clip: true,
      cardCenterX: canvas.width / 2 + card.x,
      cardCenterY: canvas.height / 2 + card.y,
    }
  }

  const bounds = resolveVisualBounds(card, shadow)
  const padding = Math.max(0, canvas.padding)

  return {
    width: Math.max(1, Math.ceil(bounds.right - bounds.left + padding * 2)),
    height: Math.max(1, Math.ceil(bounds.bottom - bounds.top + padding * 2)),
    clip: false,
    cardCenterX: card.x - bounds.left + padding,
    cardCenterY: card.y - bounds.top + padding,
  }
}

export function migrateLegacyCardPosition(
  legacy: { x: number; y: number },
  card: { width: number; height: number; scale: number }
): { x: number; y: number } {
  return {
    x: (legacy.x / 100) * card.width,
    y: (legacy.y / 100) * card.height,
  }
}
