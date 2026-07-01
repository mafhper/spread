import { describe, expect, it } from 'vitest'

import {
  migrateLegacyCardPosition,
  resolveCompositionGeometry,
} from '@/features/composition/geometry'

describe('resolveCompositionGeometry', () => {
  it('keeps fixed canvases exact and positions the card from the canvas center', () => {
    const geometry = resolveCompositionGeometry({
      canvas: { mode: 'fixed', width: 1200, height: 676, padding: 64 },
      card: { width: 640, height: 360, scale: 0.8, x: 120, y: -40 },
      shadow: { offsetX: 0, offsetY: 25, blur: 50, spread: -12 },
    })

    expect(geometry).toEqual({
      width: 1200,
      height: 676,
      clip: true,
      cardCenterX: 720,
      cardCenterY: 298,
    })
  })

  it('expands auto canvases around the complete visual bounds', () => {
    const geometry = resolveCompositionGeometry({
      canvas: { mode: 'auto', width: 0, height: 0, padding: 80 },
      card: { width: 640, height: 360, scale: 1, x: 48, y: -24 },
      shadow: { offsetX: 20, offsetY: 30, blur: 40, spread: 10 },
    })

    expect(geometry).toEqual({
      width: 900,
      height: 620,
      clip: false,
      cardCenterX: 382,
      cardCenterY: 304,
    })
  })

  it('rounds fractional visual bounds outwards so export pixels are never cut', () => {
    const geometry = resolveCompositionGeometry({
      canvas: { mode: 'auto', width: 0, height: 0, padding: 32 },
      card: { width: 641, height: 361, scale: 0.83, x: 0, y: 0 },
      shadow: { offsetX: 0, offsetY: 0, blur: 0, spread: 0 },
    })

    expect(geometry.width).toBe(597)
    expect(geometry.height).toBe(364)
  })
})

describe('migrateLegacyCardPosition', () => {
  it('converts legacy card-relative percentages to center-origin pixels', () => {
    expect(
      migrateLegacyCardPosition(
        { x: 25, y: -10 },
        { width: 640, height: 360, scale: 0.5 }
      )
    ).toEqual({ x: 160, y: -36 })
  })
})
