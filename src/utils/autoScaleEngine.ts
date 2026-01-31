// Centralized auto-scale engine for Card and Canvas spaces
export interface AutoScaleOptions {
  availableWidth: number
  availableHeight: number
  cardBaseW?: number
  cardBaseH?: number
  maxScale?: number
  minScale?: number
}

// Compute a scale that best fits the card inside the available canvas space
export function computeCardAutoScale(opts: AutoScaleOptions): number {
  const {
    availableWidth,
    availableHeight,
    cardBaseW = 640,
    cardBaseH = 360,
    maxScale = 3,
    minScale = 0.5,
  } = opts

  if (!Number.isFinite(availableWidth) || !Number.isFinite(availableHeight))
    return 1
  // Protect against degenerate heights
  const h = Math.max(1, cardBaseH)
  const w = Math.max(1, cardBaseW)

  const sW = availableWidth / w
  const sH = availableHeight / h
  let s = Math.min(sW, sH)
  s = Math.max(minScale, Math.min(s, maxScale))
  return s
}
