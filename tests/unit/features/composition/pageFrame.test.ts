import { describe, expect, it } from 'vitest'

import { resolvePageFrame } from '@/features/composition/pageFrame'

describe('resolvePageFrame', () => {
  it('preserves a direct page capture when the canvas is auto-sized', () => {
    const frame = resolvePageFrame(
      { width: 1440, height: 900 },
      { width: 1440, height: 900 },
      { fit: 'contain', scale: 1, offsetX: 0, offsetY: 0 }
    )

    expect(frame).toEqual({ left: 0, top: 0, width: 1440, height: 900 })
  })

  it('uses a deterministic focal point for a cropped social preset', () => {
    const centered = resolvePageFrame(
      { width: 1440, height: 900 },
      { width: 1080, height: 1350 },
      { fit: 'cover', scale: 1, offsetX: 0, offsetY: 0 }
    )
    const focused = resolvePageFrame(
      { width: 1440, height: 900 },
      { width: 1080, height: 1350 },
      { fit: 'cover', scale: 1, offsetX: 50, offsetY: -50 }
    )

    expect(centered.width).toBe(2160)
    expect(centered.left).toBe(-540)
    expect(focused.left).toBe(-1080)
    expect(focused.top).toBe(0)
  })
})
