import type { PageCaptureViewport } from '../types/capture'

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

export const VIEWPORT_TO_PRESET: Record<PageCaptureViewport, CanvasPresetName> = {
  mobile: 'story',
  tablet: 'post',
  desktop: 'landscape',
}

export const detectViewport = (): PageCaptureViewport => {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1200) return 'tablet'
  return 'desktop'
}
