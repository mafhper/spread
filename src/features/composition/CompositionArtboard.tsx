import React, { forwardRef } from 'react'

import {
  PreviewCard,
  type PreviewCardState,
} from '../../components/preview/PreviewCard'
import { type CardState, useCardStore } from '../../store/cardStore'
import { computeUnifiedExportScale } from '../../utils/exportScale'
import {
  migrateLegacyCardPosition,
  resolveCompositionGeometry,
} from './geometry'

const BASE_CARD_WIDTH = 640

const getPatternImage = (pattern: unknown) => {
  switch (pattern) {
    case 'dots':
      return 'radial-gradient(#ffffff 1.5px, transparent 1.5px)'
    case 'grid':
      return 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)'
    case 'lines':
      return 'repeating-linear-gradient(0deg, transparent, transparent 19px, #ffffff 20px)'
    case 'diagonal':
      return 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)'
    case 'noise':
      return "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E\")"
    case 'mesh':
      return "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L20 10 L10 20 L0 10 Z' fill='none' stroke='white' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E\")"
    default:
      return 'none'
  }
}

const getPatternBase = (pattern: unknown) => {
  switch (pattern) {
    case 'grid':
      return 40
    case 'diagonal':
      return 10
    default:
      return 20
  }
}

export interface CompositionArtboardProps {
  canvasWidth: number
  canvasHeight: number
  autoScale: number
  cardRef: React.RefObject<HTMLDivElement | null>
  cardPadding: number
  state?: CompositionArtboardState
}

export type CompositionArtboardState = PreviewCardState &
  Pick<
    CardState,
    | 'canvasSize'
    | 'gradientStyle'
    | 'pattern'
    | 'customBgImage'
    | 'patternOpacity'
    | 'patternScale'
    | 'cardPosition'
    | 'exportScale'
  >

export const CompositionArtboard = forwardRef<
  HTMLDivElement,
  CompositionArtboardProps
>(function CompositionArtboard(
  { canvasWidth, canvasHeight, autoScale, cardRef, cardPadding, state },
  ref
) {
  const storeState = useCardStore()
  const {
    colors,
    canvasSize,
    gradientStyle,
    pattern,
    customBgImage,
    patternOpacity,
    patternScale,
    cardPosition,
    layout,
    exportScale,
  } = state ?? storeState

  const isAutoCanvas = canvasSize.preset === 'auto'
  const finalScale = computeUnifiedExportScale({
    exportScale,
    cardScale: layout.cardScale,
    autoScale,
    preset: canvasSize.preset,
  })
  const naturalHeight = Math.max(1, layout.measuredCardHeight || 360)

  const cardWidth = isAutoCanvas
    ? BASE_CARD_WIDTH
    : Math.min(Math.max(BASE_CARD_WIDTH, canvasWidth * 0.55), canvasWidth - 80)

  const position = migrateLegacyCardPosition(cardPosition, {
    width: cardWidth,
    height: naturalHeight,
    scale: finalScale,
  })
  const geometry = resolveCompositionGeometry({
    canvas: {
      mode: isAutoCanvas ? 'auto' : 'fixed',
      width: canvasWidth,
      height: canvasHeight,
      padding: cardPadding,
    },
    card: {
      width: cardWidth,
      height: naturalHeight,
      scale: finalScale,
      x: position.x,
      y: position.y,
    },
    shadow: {
      offsetX: layout.shadowOffsetX ?? 0,
      offsetY: layout.shadowOffsetY ?? 0,
      blur: layout.shadowBlur ?? 0,
      spread: layout.shadowSpread ?? 0,
    },
  })

  const gradient =
    gradientStyle?.includes('deg') || gradientStyle?.includes('circle')
      ? gradientStyle
      : '135deg'
  const backgroundStyle: React.CSSProperties = customBgImage
    ? {
        backgroundImage: `url('${customBgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: gradient.includes('circle')
          ? `radial-gradient(${gradient}, ${colors.bg1}, ${colors.bg2})`
          : `linear-gradient(${gradient}, ${colors.bg1}, ${colors.bg2})`,
      }
  const patternBase = getPatternBase(pattern)

  return (
    <div
      ref={ref}
      data-testid="composition-artboard"
      className="artboard-root relative isolate"
      style={{
        width: geometry.width,
        height: geometry.height,
        overflow: geometry.clip ? 'hidden' : 'visible',
        borderRadius: `${canvasSize.roundness ?? 0}px`,
        ...backgroundStyle,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: getPatternImage(pattern),
          backgroundSize: `${patternBase * (patternScale || 1)}px ${patternBase * (patternScale || 1)}px`,
          opacity: pattern === 'none' ? 0 : patternOpacity,
          mixBlendMode: 'overlay',
        }}
      />
      <div
        ref={cardRef}
        className="absolute z-10 w-fit h-fit"
        style={{
          left: geometry.cardCenterX - (cardWidth * finalScale) / 2,
          top: geometry.cardCenterY - (naturalHeight * finalScale) / 2,
          transform: `scale(${finalScale})`,
          transformOrigin: 'top left',
        }}
      >
        <PreviewCard padding={cardPadding} cardState={state} />
      </div>
    </div>
  )
})

CompositionArtboard.displayName = 'CompositionArtboard'
