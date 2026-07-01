import type { CardState } from '../../store/cardStore'
import { migrateLegacyCardPosition } from './geometry'

export type TemplateKind = 'default' | 'music' | 'news'
export type BackgroundPattern =
  | 'none'
  | 'dots'
  | 'grid'
  | 'noise'
  | 'lines'
  | 'diagonal'
  | 'lattice'

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
  }
  canvas: {
    width: number
    height: number
    preset: string
    roundness: number
    cardPosition: { x: number; y: number }
  }
  card: {
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
    headerPosition: 'left' | 'right'
  }
  typography: {
    fontFamily: string
    titleSize: number
    subtitleSize: number
    textAlign: 'left' | 'center' | 'right'
    textColor: string
  }
  background: {
    color1: string
    color2: string
    gradientStyle: string
    pattern: BackgroundPattern
    patternOpacity: number
    patternScale: number
    image: string | null
  }
  media: {
    aspectRatio: string
    position: string
    fit: 'cover' | 'contain'
    scale: number
    offsetX: number
    offsetY: number
  }
}

export interface SpreadPresetV1 {
  schema: 'spread-preset@1'
  id: string
  name: string
  source: 'builtin' | 'user'
  compatibleTemplates: TemplateKind[]
  createdAt: number
  updatedAt: number
  thumbnailId?: string
  config: Omit<SpreadDocumentV1, 'schema' | 'content'>
}

type CardStateSnapshot = Pick<
  CardState,
  | 'url'
  | 'title'
  | 'description'
  | 'author'
  | 'image'
  | 'favicon'
  | 'domain'
  | 'template'
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

export function documentFromCardState(
  state: CardStateSnapshot
): SpreadDocumentV1 {
  const naturalWidth = 640
  const naturalHeight = state.layout.measuredCardHeight || 360
  return {
    schema: 'spread-document@1',
    content: {
      url: state.url,
      title: state.title,
      description: state.description,
      author: state.author,
      image: state.image,
      favicon: state.favicon,
      domain: state.domain,
      template: state.template,
    },
    canvas: {
      width: state.canvasSize.width,
      height: state.canvasSize.height,
      preset: state.canvasSize.preset,
      roundness: state.canvasSize.roundness,
      cardPosition: migrateLegacyCardPosition(state.cardPosition, {
        width: naturalWidth,
        height: naturalHeight,
        scale: state.layout.cardScale,
      }),
    },
    card: {
      naturalWidth,
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
      pattern: state.pattern === 'mesh' ? 'lattice' : state.pattern,
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
  }
}

export function cardStatePatchFromDocument(
  document: SpreadDocumentV1
): Partial<CardState> {
  return {
    ...document.content,
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
    cardPosition: {
      x: (document.canvas.cardPosition.x / document.card.naturalWidth) * 100,
      y: (document.canvas.cardPosition.y / document.card.naturalHeight) * 100,
    },
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
      headerPosition: document.card.headerPosition,
    },
  }
}

export function createPresetFromDocument(
  document: SpreadDocumentV1,
  name: string,
  now = Date.now(),
  options: {
    id?: string
    source?: 'builtin' | 'user'
    compatibleTemplates?: TemplateKind[]
  } = {}
): SpreadPresetV1 {
  const config = {
    canvas: structuredClone(document.canvas),
    card: structuredClone(document.card),
    typography: structuredClone(document.typography),
    background: structuredClone(document.background),
    media: structuredClone(document.media),
  }
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
    config,
  }
}

export function applyPresetToDocument(
  document: SpreadDocumentV1,
  preset: SpreadPresetV1
): SpreadDocumentV1 {
  return {
    schema: 'spread-document@1',
    content: { ...document.content },
    ...structuredClone(preset.config),
  }
}
