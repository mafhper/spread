import { describe, expect, it, vi } from 'vitest'

import {
  ensureIntrinsicCaptureDimensions,
  hasIntrinsicCaptureDimensions,
} from '@/features/composition/captureAsset'

const legacyCapture = {
  image: 'data:image/png;base64,legacy',
  width: 0,
  height: 0,
  settings: { viewport: 'desktop' as const, area: 'viewport' as const },
  capturedAt: 0,
}

describe('captured page asset geometry', () => {
  it('decodes missing V1 dimensions before the asset can be framed', async () => {
    const readDimensions = vi
      .fn()
      .mockResolvedValue({ width: 1440, height: 900 })

    const repaired = await ensureIntrinsicCaptureDimensions(
      legacyCapture,
      readDimensions
    )

    expect(readDimensions).toHaveBeenCalledWith(legacyCapture.image)
    expect(repaired).toMatchObject({ width: 1440, height: 900 })
    expect(hasIntrinsicCaptureDimensions(repaired)).toBe(true)
  })

  it('does not frame a capture whose intrinsic dimensions are still unknown', async () => {
    const repaired = await ensureIntrinsicCaptureDimensions(
      legacyCapture,
      async () => null
    )

    expect(repaired).toEqual(legacyCapture)
    expect(hasIntrinsicCaptureDimensions(repaired)).toBe(false)
  })

  it('keeps a valid capture without decoding it again', async () => {
    const currentCapture = { ...legacyCapture, width: 390, height: 844 }
    const readDimensions = vi.fn()

    const result = await ensureIntrinsicCaptureDimensions(
      currentCapture,
      readDimensions
    )

    expect(result).toBe(currentCapture)
    expect(readDimensions).not.toHaveBeenCalled()
  })
})
