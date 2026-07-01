import React, { forwardRef } from 'react'

import { PreviewCard } from '../../components/preview/PreviewCard'
import { useCardStore } from '../../store/cardStore'
import { computeUnifiedExportScale } from '../../utils/exportScale'
import {
  migrateLegacyCardPosition,
  resolveCompositionGeometry,
} from './geometry'

const CARD_WIDTH = 640

const PATTERN_IMAGES: Record<string, string> = {
  dots: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)',
  grid: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
  lines:
    'repeating-linear-gradient(0deg, transparent, transparent 19px, #ffffff 20px)',
  diagonal:
    'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)',
  noise:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E\")",
  mesh: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L20 10 L10 20 L0 10 Z' fill='none' stroke='white' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E\")",
}

export interface CompositionArtboardProps {
  canvasWidth: number
  canvasHeight: number
  autoScale: number
  cardRef: React.RefObject<HTMLDivElement | null>
  cardPadding: number
}

export const CompositionArtboard = forwardRef<
  HTMLDivElement,
  CompositionArtboardProps
>(function CompositionArtboard(
  { canvasWidth, canvasHeight, autoScale, cardRef, cardPadding },
  ref
) {
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
  } = useCardStore()

  const isAutoCanvas = canvasSize.preset === 'auto'
  const finalScale = computeUnifiedExportScale({
    exportScale,
    cardScale: layout.cardScale,
    autoScale,
    preset: canvasSize.preset,
  })
  const naturalHeight = Math.max(1, layout.measuredCardHeight || 360)
  const position = migrateLegacyCardPosition(cardPosition, {
    width: CARD_WIDTH,
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
      width: CARD_WIDTH,
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
  const patternBase = pattern === 'grid' ? 40 : pattern === 'diagonal' ? 10 : 20

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
          backgroundImage: PATTERN_IMAGES[pattern] || 'none',
          backgroundSize: `${patternBase * (patternScale || 1)}px ${patternBase * (patternScale || 1)}px`,
          opacity: pattern === 'none' ? 0 : patternOpacity,
          mixBlendMode: 'overlay',
        }}
      />
      <div
        ref={cardRef}
        className="absolute z-10 w-fit h-fit"
        style={{
          left: geometry.cardCenterX,
          top: geometry.cardCenterY,
          transform: `translate(-50%, -50%) scale(${finalScale})`,
          transformOrigin: 'center',
        }}
      >
        <PreviewCard padding={cardPadding} />
      </div>
    </div>
  )
})

CompositionArtboard.displayName = 'CompositionArtboard'
