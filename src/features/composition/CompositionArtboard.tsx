import React, { forwardRef } from 'react'

import {
  PreviewCard,
  type PreviewCardState,
} from '../../components/preview/PreviewCard'
import { useCardStore, type CardState } from '../../store/cardStore'
import { computeUnifiedExportScale } from '../../utils/exportScale'
import { hasIntrinsicCaptureDimensions } from './captureAsset'
import { resolvePageFrame } from './pageFrame'
import { resolveCompositionGeometry } from './geometry'

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
  if (pattern === 'grid') return 40
  if (pattern === 'diagonal') return 10
  return 20
}

export interface CompositionArtboardProps {
  canvasWidth: number
  canvasHeight: number
  fitScale: number
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
    | 'outputMode'
    | 'pageCapture'
    | 'pageFrame'
  >

export const CompositionArtboard = forwardRef<
  HTMLDivElement,
  CompositionArtboardProps
>(function CompositionArtboard(
  { canvasWidth, canvasHeight, fitScale, cardRef, cardPadding, state },
  ref
) {
  const storeState = useCardStore()
  const composition = state ?? storeState
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
    outputMode,
    pageCapture,
    pageFrame,
  } = composition
  const isAutoCanvas = canvasSize.preset === 'auto'
  const isPageMode = outputMode === 'page-capture'
  const isDirectPage = isPageMode && hasIntrinsicCaptureDimensions(pageCapture)
  const finalScale = computeUnifiedExportScale({
    exportScale,
    cardScale: layout.cardScale,
    autoScale: fitScale,
    preset: canvasSize.preset,
  })
  const naturalHeight = Math.max(1, layout.measuredCardHeight || 360)
  const cardWidth = BASE_CARD_WIDTH
  const position = {
    x: ((cardPosition.x || 0) / 100) * (isAutoCanvas ? cardWidth : canvasWidth),
    y:
      ((cardPosition.y || 0) / 100) *
      (isAutoCanvas ? naturalHeight : canvasHeight),
  }
  const geometry = resolveCompositionGeometry({
    canvas: {
      mode: isAutoCanvas && !isDirectPage ? 'auto' : 'fixed',
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
  const pageBounds =
    isDirectPage && pageCapture
      ? resolvePageFrame(
          {
            width: pageCapture.width,
            height: pageCapture.height,
          },
          { width: canvasWidth, height: canvasHeight },
          pageFrame
        )
      : null

  return (
    <div
      ref={ref}
      data-testid="composition-artboard"
      data-output-mode={outputMode}
      className="artboard-root relative isolate"
      style={{
        width: isPageMode ? canvasWidth : geometry.width,
        height: isPageMode ? canvasHeight : geometry.height,
        overflow: isPageMode || geometry.clip ? 'hidden' : 'visible',
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
      {pageBounds && pageCapture ? (
        <img
          src={pageCapture.image}
          alt="Página capturada"
          data-capture-viewport={pageCapture.settings.viewport}
          data-capture-area={pageCapture.settings.area}
          className="absolute z-10 max-w-none"
          style={{
            left: pageBounds.left,
            top: pageBounds.top,
            width: pageBounds.width,
            height: pageBounds.height,
          }}
        />
      ) : isPageMode ? (
        <div
          className="artboard-empty-state absolute inset-0 z-10"
          role="status"
        >
          <p>Capture a página para visualizar e exportar este resultado.</p>
        </div>
      ) : (
        <div
          ref={cardRef}
          className="absolute z-10 h-fit"
          style={{
            width: cardWidth,
            left: geometry.cardCenterX - (cardWidth * finalScale) / 2,
            top: geometry.cardCenterY - (naturalHeight * finalScale) / 2,
            transform: `scale(${finalScale})`,
            transformOrigin: 'top left',
          }}
        >
          <PreviewCard
            padding={cardPadding}
            cardState={state}
            width={cardWidth}
          />
        </div>
      )}
    </div>
  )
})

CompositionArtboard.displayName = 'CompositionArtboard'
