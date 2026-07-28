import type { CardState } from '../../store/cardStore'
import type {
  CapturedPageAsset,
  LinkMediaSource,
  OutputMode,
  PageCaptureArea,
  PageCaptureViewport,
  PageFrameSettings,
} from '../../types/capture'

export type TemplateKind = 'default' | 'music' | 'news'
export type BackgroundPattern =
  | 'none'
  | 'dots'
  | 'grid'
  | 'noise'
  | 'lines'
  | 'diagonal'
  | 'lattice'

interface DocumentCanvas {
  width: number
  height: number
  preset: string
  roundness: number
  /** Normalized visual offset from the canvas centre, in percent. */
  cardPosition: { x: number; y: number }
}

interface DocumentCard {
  naturalWidth: number
  naturalHeight: number
  innerRadius: number
  padding: number
  paddingAuto: boolean
  opacity: number
  shadowOffsetX: number
  shadowOffsetY: number
  shadowBlur: number
  shadowSpread: number
  shadowColor: string
  shadowOpacity: number
  backdropBlur: number
  scale: number
  auto: boolean
  aspectRatio: string
  showHeader: boolean
  headerMode?: 'both' | 'logo' | 'title' | 'none'
  headerPosition: 'left' | 'right'
}

interface DocumentTypography {
  fontFamily: string
  titleSize: number
  subtitleSize: number
  textAlign: 'left' | 'center' | 'right'
  textColor: string
}

interface DocumentBackground {
  color1: string
  color2: string
  gradientStyle: string
  pattern: BackgroundPattern
  patternOpacity: number
  patternScale: number
  image: string | null
}

interface DocumentMedia {
  aspectRatio: string
  position: string
  fit: 'cover' | 'contain'
  scale: number
  offsetX: number
  offsetY: number
}

/** Legacy format retained solely so existing browser drafts can be migrated. */
export interface SpreadDocumentV1 {
  schema: 'spread-document@1'
  content: {
    url: string
    title: string
    description: string
    author: string
    image: string | null
    favicon: string | null
    domain: string
    template: TemplateKind
    mediaSource?: LinkMediaSource
    capture?: { viewport: PageCaptureViewport; area: PageCaptureArea }
  }
  canvas: DocumentCanvas
  card: DocumentCard
  typography: DocumentTypography
  background: DocumentBackground
  media: DocumentMedia
}

export interface SpreadDocumentV2 {
  schema: 'spread-document@2'
  outputMode: OutputMode
  content: {
    url: string
    title: string
    description: string
    author: string
    favicon: string | null
    domain: string
    template: TemplateKind
    mediaSource: LinkMediaSource
    coverImage: string | null
    pageCapture: CapturedPageAsset | null
  }
  canvas: DocumentCanvas
  card: DocumentCard
  typography: DocumentTypography
  background: DocumentBackground
  media: DocumentMedia
  pageFrame: PageFrameSettings
}

export type SpreadDocument = SpreadDocumentV1 | SpreadDocumentV2

export interface SpreadPresetV1 {
  schema: 'spread-preset@1'
  id: string
  name: string
  source: 'builtin' | 'user'
  compatibleTemplates: TemplateKind[]
  createdAt: number
  updatedAt: number
  thumbnailId?: string
  config: Pick<
    SpreadDocumentV2,
    'canvas' | 'card' | 'typography' | 'background' | 'media' | 'pageFrame'
  >
}

type CardStateSnapshot = Pick<
  CardState,
  | 'url'
  | 'title'
  | 'description'
  | 'author'
  | 'image'
  | 'coverImage'
  | 'pageCapture'
  | 'favicon'
  | 'domain'
  | 'template'
  | 'outputMode'
  | 'pageFrame'
  | 'mediaSource'
  | 'captureViewport'
  | 'captureArea'
  | 'colors'
  | 'gradientStyle'
  | 'pattern'
  | 'patternOpacity'
  | 'patternScale'
  | 'customBgImage'
  | 'layout'
  | 'canvasSize'
  | 'cardPosition'
  | 'fontFamily'
  | 'titleSize'
  | 'subtitleSize'
  | 'textAlign'
>

const BASE_CARD_WIDTH = 640

const normalizePattern = (pattern: CardStateSnapshot['pattern']) =>
  pattern === 'mesh' ? 'lattice' : pattern

export function documentFromCardState(
  state: CardStateSnapshot
): SpreadDocumentV2 {
  const naturalHeight = state.layout.measuredCardHeight || 360
  return {
    schema: 'spread-document@2',
    outputMode: state.outputMode,
    content: {
      url: state.url,
      title: state.title,
      description: state.description,
      author: state.author,
      favicon: state.favicon,
      domain: state.domain,
      template: state.template,
      mediaSource: state.mediaSource,
      coverImage: state.coverImage ?? state.image,
      pageCapture: state.pageCapture,
    },
    canvas: {
      width: state.canvasSize.width,
      height: state.canvasSize.height,
      preset: state.canvasSize.preset,
      roundness: state.canvasSize.roundness,
      cardPosition: { ...state.cardPosition },
    },
    card: {
      naturalWidth: BASE_CARD_WIDTH,
      naturalHeight,
      innerRadius: state.layout.innerRadius,
      padding: state.layout.padding,
      paddingAuto: state.layout.paddingAuto,
      opacity: state.layout.opacity,
      shadowOffsetX: state.layout.shadowOffsetX,
      shadowOffsetY: state.layout.shadowOffsetY,
      shadowBlur: state.layout.shadowBlur,
      shadowSpread: state.layout.shadowSpread,
      shadowColor: state.layout.shadowColor,
      shadowOpacity: state.layout.shadowOpacity,
      backdropBlur: state.layout.backdropBlur,
      scale: state.layout.cardScale,
      auto: state.layout.cardAuto,
      aspectRatio: state.layout.cardAspectRatio,
      showHeader: state.layout.showHeader,
      headerMode: state.layout.headerMode,
      headerPosition: state.layout.headerPosition,
    },
    typography: {
      fontFamily: state.fontFamily,
      titleSize: state.titleSize,
      subtitleSize: state.subtitleSize,
      textAlign: state.textAlign,
      textColor: state.colors.text,
    },
    background: {
      color1: state.colors.bg1,
      color2: state.colors.bg2,
      gradientStyle: state.gradientStyle,
      pattern: normalizePattern(state.pattern),
      patternOpacity: state.patternOpacity,
      patternScale: state.patternScale,
      image: state.customBgImage,
    },
    media: {
      aspectRatio: state.layout.aspectRatio,
      position: state.layout.imagePosition,
      fit: state.layout.imageFit,
      scale: state.layout.imageScale,
      offsetX: state.layout.imageOffsetX,
      offsetY: state.layout.imageOffsetY,
    },
    pageFrame: { ...state.pageFrame },
  }
}

/** Convert the V1 card-relative export coordinates into the V2 UI percentage. */
export function migrateDocumentV1(
  document: SpreadDocumentV1
): SpreadDocumentV2 {
  const captureSettings = document.content.capture ?? {
    viewport: 'desktop' as const,
    area: 'viewport' as const,
  }
  const mediaSource = document.content.mediaSource ?? 'metadata'
  const legacyPageCapture =
    mediaSource === 'page' && document.content.image
      ? {
          image: document.content.image,
          width: 0,
          height: 0,
          settings: captureSettings,
          capturedAt: 0,
        }
      : null

  return {
    schema: 'spread-document@2',
    outputMode: 'social-card',
    content: {
      url: document.content.url,
      title: document.content.title,
      description: document.content.description,
      author: document.content.author,
      favicon: document.content.favicon,
      domain: document.content.domain,
      template: document.content.template,
      mediaSource,
      coverImage: mediaSource === 'metadata' ? document.content.image : null,
      pageCapture: legacyPageCapture,
    },
    canvas: {
      ...document.canvas,
      cardPosition: {
        x: (document.canvas.cardPosition.x / BASE_CARD_WIDTH) * 100,
        y:
          (document.canvas.cardPosition.y /
            Math.max(1, document.card.naturalHeight || 360)) *
          100,
      },
    },
    card: { ...document.card, naturalWidth: BASE_CARD_WIDTH },
    typography: { ...document.typography },
    background: { ...document.background },
    media: { ...document.media },
    pageFrame: {
      fit: 'contain',
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    },
  }
}

export function normalizeDocument(document: SpreadDocument): SpreadDocumentV2 {
  return document.schema === 'spread-document@1'
    ? migrateDocumentV1(document)
    : document
}

export function cardStatePatchFromDocument(
  source: SpreadDocument
): Partial<CardState> {
  const document = normalizeDocument(source)
  const pageCapture = document.content.pageCapture
  const selectedImage =
    document.content.mediaSource === 'page'
      ? (pageCapture?.image ?? document.content.coverImage)
      : document.content.coverImage

  return {
    url: document.content.url,
    title: document.content.title,
    description: document.content.description,
    author: document.content.author,
    image: selectedImage,
    coverImage: document.content.coverImage,
    pageCapture,
    favicon: document.content.favicon,
    domain: document.content.domain,
    template: document.content.template,
    outputMode: document.outputMode,
    pageFrame: { ...document.pageFrame },
    mediaSource: document.content.mediaSource,
    captureViewport: pageCapture?.settings.viewport ?? 'desktop',
    captureArea: pageCapture?.settings.area ?? 'viewport',
    colors: {
      bg1: document.background.color1,
      bg2: document.background.color2,
      text: document.typography.textColor,
    },
    gradientStyle: document.background.gradientStyle,
    pattern:
      document.background.pattern === 'lattice'
        ? 'mesh'
        : document.background.pattern,
    patternOpacity: document.background.patternOpacity,
    patternScale: document.background.patternScale,
    customBgImage: document.background.image,
    canvasSize: {
      width: document.canvas.width,
      height: document.canvas.height,
      preset: document.canvas.preset,
      roundness: document.canvas.roundness,
    },
    cardPosition: { ...document.canvas.cardPosition },
    fontFamily: document.typography.fontFamily,
    titleSize: document.typography.titleSize,
    subtitleSize: document.typography.subtitleSize,
    textAlign: document.typography.textAlign,
    layout: {
      aspectRatio: document.media.aspectRatio,
      imagePosition: document.media.position,
      imageFit: document.media.fit,
      imageScale: document.media.scale,
      outerRadius: 0,
      innerRadius: document.card.innerRadius,
      padding: document.card.padding,
      paddingAuto: document.card.paddingAuto,
      opacity: document.card.opacity,
      shadowOffsetX: document.card.shadowOffsetX,
      shadowOffsetY: document.card.shadowOffsetY,
      shadowBlur: document.card.shadowBlur,
      shadowSpread: document.card.shadowSpread,
      shadowColor: document.card.shadowColor,
      shadowOpacity: document.card.shadowOpacity,
      backdropBlur: document.card.backdropBlur,
      cardScale: document.card.scale,
      cardAuto: document.card.auto,
      imageOffsetX: document.media.offsetX,
      imageOffsetY: document.media.offsetY,
      cardAspectRatio: document.card.aspectRatio,
      showHeader: document.card.showHeader,
      headerMode: document.card.headerMode ?? 'both',
      headerPosition: document.card.headerPosition,
      measuredCardHeight: document.card.naturalHeight,
    },
  }
}

export function createPresetFromDocument(
  document: SpreadDocumentV2,
  name: string,
  now = Date.now(),
  options: {
    id?: string
    source?: 'builtin' | 'user'
    compatibleTemplates?: TemplateKind[]
  } = {}
): SpreadPresetV1 {
  return {
    schema: 'spread-preset@1',
    id: options.id || `preset-${now}`,
    name,
    source: options.source || 'user',
    compatibleTemplates: options.compatibleTemplates || [
      'default',
      'music',
      'news',
    ],
    createdAt: now,
    updatedAt: now,
    config: {
      canvas: structuredClone(document.canvas),
      card: structuredClone(document.card),
      typography: structuredClone(document.typography),
      background: structuredClone(document.background),
      media: structuredClone(document.media),
      pageFrame: structuredClone(document.pageFrame),
    },
  }
}

export function applyPresetToDocument(
  document: SpreadDocumentV2,
  preset: SpreadPresetV1
): SpreadDocumentV2 {
  return {
    ...document,
    ...structuredClone(preset.config),
    content: { ...document.content },
    outputMode: document.outputMode,
  }
}
