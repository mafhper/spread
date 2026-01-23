import React from 'react'
import { useCardStore } from '../../store/cardStore'
import { PreviewCard } from './PreviewCard'

export const HeadlessArtboard = React.forwardRef<HTMLDivElement>((_, ref) => {
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
  } = useCardStore()

  // Computed Background Style (Duplicated from PreviewSection for isolation)
  const backgroundStyle: React.CSSProperties = customBgImage
    ? {
        backgroundImage: `url('${customBgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: gradientStyle.includes('circle')
          ? `radial-gradient(${gradientStyle}, ${colors.bg1}, ${colors.bg2})`
          : `linear-gradient(${gradientStyle}, ${colors.bg1}, ${colors.bg2})`,
      }

  // Dynamic Pattern Style
  const getPatternSize = () => {
    const base =
      pattern === 'dots'
        ? 20
        : pattern === 'grid'
          ? 40
          : pattern === 'diagonal'
            ? 10
            : 20
    return `${base * patternScale}px ${base * patternScale}px`
  }

  const patternStyle: React.CSSProperties = {
    backgroundImage:
      pattern === 'dots'
        ? 'radial-gradient(#ffffff 1.5px, transparent 1.5px)'
        : pattern === 'grid'
          ? 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)'
          : pattern === 'lines'
            ? 'repeating-linear-gradient(0deg, transparent, transparent 19px, #ffffff 20px)'
            : pattern === 'diagonal'
              ? 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)'
              : pattern === 'noise'
                ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                : 'none',
    backgroundSize: getPatternSize(),
    opacity: pattern === 'none' ? 0 : patternOpacity,
    mixBlendMode: 'overlay',
  }

  const isAutoCanvas = canvasSize.preset === 'auto'
  const CANVAS_PRESETS: Record<string, { w: number; h: number }> = {
    'ig-story': { w: 1080, h: 1920 },
    'ig-post': { w: 1080, h: 1080 },
    twitter: { w: 1200, h: 675 },
    linkedin: { w: 1200, h: 627 },
    auto: { w: 1080, h: 1080 },
  }

  const canvasWidth =
    canvasSize.width > 0
      ? canvasSize.width
      : CANVAS_PRESETS[canvasSize.preset]?.w || 1080
  const canvasHeight =
    canvasSize.height > 0
      ? canvasSize.height
      : CANVAS_PRESETS[canvasSize.preset]?.h || 1080

  return (
    <div
      style={{
        position: 'absolute',
        top: '-10000px',
        left: '-10000px',
        width: 'fit-content',
        pointerEvents: 'none',
        opacity: 0,
        overflow: 'visible',
      }}
    >
      <div
        ref={ref}
        className={
          isAutoCanvas
            ? 'artboard-root relative overflow-visible w-fit h-fit'
            : 'artboard-root relative overflow-visible'
        }
        style={{
          ...(!isAutoCanvas && {
            width: canvasWidth,
            height: canvasHeight,
          }),
          ...backgroundStyle,
          borderRadius: `${canvasSize.roundness ?? 0}px`,
          minWidth: isAutoCanvas ? 'min-content' : undefined,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay z-0"
          style={patternStyle}
        />

        <div
          className={
            isAutoCanvas
              ? // Match PreviewSection: p-20 and flex centering
                'relative z-10 p-20 flex justify-center items-center overflow-visible'
              : 'relative z-10 flex items-center justify-center h-full w-full'
          }
        >
          <div
            style={{
              transform: `translate(${cardPosition.x}%, ${cardPosition.y}%) scale(${layout.cardScale ?? 1})`,
              transformOrigin: 'center',
              width: 'fit-content',
              minWidth: '640px',
            }}
          >
            <PreviewCard />
          </div>
        </div>
      </div>
    </div>
  )
})

HeadlessArtboard.displayName = 'HeadlessArtboard'
