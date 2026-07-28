export type LinkMediaSource = 'metadata' | 'page'
export type OutputMode = 'social-card' | 'page-capture'
export type PageCaptureViewport = 'desktop' | 'tablet' | 'mobile'
export type PageCaptureArea = 'viewport' | 'main' | 'fullPage'

export interface PageCaptureSettings {
  viewport: PageCaptureViewport
  area: PageCaptureArea
}

export interface CapturedPageAsset {
  image: string
  width: number
  height: number
  settings: PageCaptureSettings
  capturedAt: number
}

export interface PageFrameSettings {
  fit: 'cover' | 'contain'
  scale: number
  offsetX: number
  offsetY: number
}

export const PAGE_CAPTURE_VIEWPORTS: Record<
  PageCaptureViewport,
  {
    label: string
    width: number
    height: number
    isMobile: boolean
  }
> = {
  desktop: {
    label: 'Desktop',
    width: 1440,
    height: 900,
    isMobile: false,
  },
  tablet: {
    label: 'Tablet',
    width: 1024,
    height: 768,
    isMobile: false,
  },
  mobile: {
    label: 'Celular',
    width: 390,
    height: 844,
    isMobile: true,
  },
}
