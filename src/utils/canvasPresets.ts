export interface CanvasPresetValue {
  w: number
  h: number
  label: string
}

export const CANVAS_PRESETS: Record<string, CanvasPresetValue> = {
  auto: { w: 0, h: 0, label: 'Auto' },
  story: { w: 1080, h: 1920, label: 'Story' },
  post: { w: 1080, h: 1350, label: 'Post' },
  square: { w: 1080, h: 1080, label: 'Quadrado' },
  landscape: { w: 1920, h: 1080, label: 'Paisagem' },
  twitter: { w: 1200, h: 676, label: 'Twitter' },
}

export type CanvasPresetName = keyof typeof CANVAS_PRESETS
