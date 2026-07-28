import type { CapturedPageAsset } from '../../types/capture'

export type CaptureDimensionReader = (
  source: string
) => Promise<{ width: number; height: number } | null>

export function hasIntrinsicCaptureDimensions(
  capture: CapturedPageAsset | null | undefined
): capture is CapturedPageAsset {
  return Boolean(
    capture &&
    Number.isFinite(capture.width) &&
    Number.isFinite(capture.height) &&
    capture.width > 0 &&
    capture.height > 0
  )
}

/**
 * V1 documents did not store screenshot dimensions. Resolve them once during
 * hydration so every later preview and export uses the real asset geometry.
 */
export async function ensureIntrinsicCaptureDimensions(
  capture: CapturedPageAsset,
  readDimensions: CaptureDimensionReader
): Promise<CapturedPageAsset> {
  if (
    Number.isFinite(capture.width) &&
    Number.isFinite(capture.height) &&
    capture.width > 0 &&
    capture.height > 0
  ) {
    return capture
  }

  const dimensions = await readDimensions(capture.image)
  if (
    !dimensions ||
    !Number.isFinite(dimensions.width) ||
    !Number.isFinite(dimensions.height) ||
    dimensions.width <= 0 ||
    dimensions.height <= 0
  ) {
    return capture
  }

  return {
    ...capture,
    width: dimensions.width,
    height: dimensions.height,
  }
}
