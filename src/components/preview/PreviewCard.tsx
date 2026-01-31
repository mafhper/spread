/**
 * PreviewCard Component - Card de Visualização com Frame Mode
 *
 * @version 2.0.0 - Frames como modos de exibição alternativos
 *
 * Quando frame.enabled === true:
 * - O frame renderiza OCUPANDO TODO O CANVAS
 * - O card padrão NÃO é renderizado
 * - Não há duplicação de imagem ou texto
 *
 * Quando frame.enabled === false:
 * - Renderiza o card padrão (template default/music/news)
 */

import * as React from 'react'
import { useEffect } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useCardStore } from '../../store/cardStore'
import { getServiceIcon } from '../../services/iconLibrary'
// import { FrameOverlay } from './FrameOverlay'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

interface PreviewCardProps {
  /** Largura do canvas em pixels (necessário para frames) */
  canvasWidth?: number
  /** Altura do canvas em pixels (necessário para frames) */
  canvasHeight?: number
  /** Padding resolvido (em pixels) para o card */
  padding?: number
  /** Escala do card (para ajustes internos se necessario) */
  scale?: number
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  canvasWidth = 1200,
  canvasHeight = 630,
  padding,
  // scale is available but not currently used within this component
}) => {
  const state = useCardStore()
  const {
    title,
    description,
    image,
    favicon,
    domain,
    author,
    template,
    colors,
    layout,
    fontFamily,
    titleSize,
    subtitleSize,
    textAlign,
    isWelcomeState,
    frame,
  } = state

  // Injeção de fonte customizada
  useEffect(() => {
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [fontFamily])

  const hexToRgba = (hex: string, alpha: number) => {
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) return hex
    let c = hex.substring(1).split('')
    if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    const n = parseInt(c.join(''), 16)
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
  }

  // ============================================================
  // FRAME MODE: Frame substitui completamente o card padrão
  // ============================================================
  if (frame.enabled && !isWelcomeState) {
    return (
      <div
        className="relative w-full h-full flex items-center justify-center overflow-visible"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.35))',
        }}
      >
        {/* <FrameOverlay
          image={image}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          templateId={frame.templateId}
          primaryColor={frame.primaryColor}
          secondaryColor={frame.secondaryColor}
        /> */}
        <div />

        {/* Overlay de Texto Otimizado para Frames */}
        {frame.showText && (
          <div
            className={cn(
              'absolute z-20 pointer-events-none flex flex-col gap-2 w-full px-8 py-6 transition-all duration-300',
              frame.textStyle.position === 'overlay'
                ? 'bottom-0 left-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-24 pb-12'
                : 'bottom-0 left-0 bg-zinc-950/90 border-t border-white/10 backdrop-blur-xl'
            )}
            style={{
              color: frame.textStyle.color,
              textAlign:
                frame.textStyle.position === 'overlay' ? 'left' : 'center',
              textShadow:
                frame.textStyle.position === 'overlay'
                  ? '0 2px 10px rgba(0,0,0,0.5)'
                  : 'none',
            }}
          >
            <div
              className={cn(
                'flex items-center gap-3',
                frame.textStyle.position === 'overlay'
                  ? 'justify-start'
                  : 'justify-center'
              )}
            >
              {frame.textStyle.showIcon && domain && (
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center p-1.5 border border-white/10 shadow-lg">
                  {(() => {
                    const { Icon, color } = getServiceIcon(domain)
                    return (
                      <Icon
                        className="w-full h-full"
                        style={{ color: color || '#FFFFFF' }}
                      />
                    )
                  })()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <h2
                  className="font-bold leading-none tracking-tight truncate w-full"
                  style={{ fontSize: `${frame.textStyle.fontSize}px` }}
                >
                  {title}
                </h2>
                <p
                  className="opacity-80 font-medium truncate w-full mt-1"
                  style={{ fontSize: `${frame.textStyle.fontSize * 0.6}px` }}
                >
                  {author || domain}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // DEFAULT MODE: Card padrão (template default/music/news)
  // ============================================================
  return (
    <div
      id="previewCard"
      className="relative group"
      style={{
        fontFamily: `'${fontFamily}', sans-serif`,
      }}
    >
      <div
        id="cardWrapper"
        className="relative grid grid-cols-1 grid-rows-1 overflow-visible w-fit h-fit min-w-[640px]"
        style={{
          borderRadius: `${layout.innerRadius}px`,
          padding:
            padding !== undefined ? `${padding}px` : `${layout.padding / 4}rem`,
          gridTemplateRows: '1fr',
        }}
      >
        {/* DRIVER: Elemento invisível que mantém a proporção mínima */}
        {layout.cardAspectRatio !== 'aspect-auto' && (
          <div
            id="ratio-driver"
            className={cn(
              'col-start-1 row-start-1 pointer-events-none invisible',
              layout.cardAspectRatio
            )}
            style={{
              width: '640px',
              height: 'auto',
              aspectRatio:
                layout.cardAspectRatio === 'aspect-square'
                  ? '1 / 1'
                  : layout.cardAspectRatio === 'aspect-video'
                    ? '16 / 9'
                    : layout.cardAspectRatio === 'aspect-[4/3]'
                      ? '4 / 3'
                      : 'auto',
              gridArea: '1 / 1 / 2 / 2',
            }}
          />
        )}

        {/* CONTEÚDO: Card real */}
        <div
          id="innerCard"
          className="relative flex flex-col gap-6 p-8 border border-white/5 transition-all duration-300 w-full overflow-visible"
          style={{
            borderRadius: `${layout.innerRadius}px`,
            backgroundColor: `rgba(20, 20, 20, ${layout.opacity})`,
            boxShadow: `${layout.shadowOffsetX ?? 0}px ${layout.shadowOffsetY ?? 25}px ${layout.shadowBlur ?? 50}px ${layout.shadowSpread ?? -12}px ${hexToRgba(layout.shadowColor ?? '#000000', layout.shadowOpacity ?? 0.25)}`,
            minHeight:
              layout.cardAspectRatio !== 'aspect-auto' ? '100%' : 'auto',
          }}
        >
          {/* Header: Logo Spread - Oculto apenas no Welcome State */}
          {!isWelcomeState && layout.showHeader && (
            <div
              className={cn(
                'flex-shrink-0 flex',
                layout.headerPosition === 'right'
                  ? 'justify-end'
                  : 'justify-start'
              )}
            >
              <div className="relative inline-flex items-center gap-2 group/header overflow-visible">
                <div className="relative w-6 h-6 flex-shrink-0">
                  {/* Premium Logo Composition */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-pink-500 rounded-lg rotate-6 opacity-90 group-hover/header:rotate-12 transition-transform duration-300" />
                  <div className="absolute inset-[2.5px] bg-zinc-950 rounded-lg flex items-center justify-center">
                    <img
                      src="/spread/logo.svg"
                      alt=""
                      className="w-full h-full p-0.5 opacity-95 invert brightness-0"
                    />
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-zinc-950/40 backdrop-blur-md border border-white/10 shadow-lg flex items-center">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/80">
                    Spread
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Seção de Imagem / Welcome Graphic */}
          {isWelcomeState ? (
            <div className="relative flex items-center justify-center py-16 flex-shrink-0">
              {/* Improved Circular Background with Glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[320px] h-[320px] bg-violet-600/15 rounded-full blur-[80px] animate-pulse" />
                <div className="absolute w-44 h-44 bg-gradient-to-tr from-white/10 to-white/5 rounded-full border border-white/20 backdrop-blur-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)] ring-1 ring-white/10" />
              </div>

              {/* Animated SVG Graphic */}
              <div className="relative z-10 w-28 h-28 transform transition-transform duration-700 hover:scale-110">
                <img
                  src="/spread/logo.svg"
                  alt="Spread Logo"
                  className="w-full h-full opacity-90 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-color-shift"
                  style={{ filter: 'brightness(1.5) contrast(1.1)' }}
                />

                {/* Lightning Bolt Accessory (premium touch) */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-xl flex items-center justify-center animate-bounce duration-[3000ms]">
                  <svg viewBox="0 0 24 24" fill="black" className="w-5 h-5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            image && (
              <div
                className={cn(
                  'relative overflow-hidden rounded-xl border border-white/5 shadow-2xl bg-black/20 transition-transform duration-500 ease-out flex-shrink-0',
                  layout.aspectRatio !== 'aspect-auto' && layout.aspectRatio
                )}
                style={{
                  ...(layout.aspectRatio === 'aspect-auto' && {
                    width: '100%',
                    aspectRatio: 'auto',
                  }),
                }}
              >
                <div className="absolute inset-0">
                  <img
                    src={image}
                    alt="Preview"
                    className={cn(
                      'w-full h-full',
                      layout.imagePosition,
                      layout.imageFit === 'contain'
                        ? 'object-contain'
                        : 'object-cover'
                    )}
                    style={{
                      transform: `translate(${layout.imageOffsetX ?? 0}px, ${layout.imageOffsetY ?? 0}px) scale(${layout.imageScale ?? 1})`,
                      willChange: 'transform',
                    }}
                  />
                </div>
                {/* Spacer para aspect-auto: mantém altura natural da imagem */}
                {layout.aspectRatio === 'aspect-auto' && (
                  <img
                    src={image}
                    alt=""
                    className="w-full opacity-0 pointer-events-none"
                    style={{ display: 'block' }}
                  />
                )}
              </div>
            )
          )}

          {/* Área de Texto - Sempre visível, nunca cortada */}
          <div className="mt-auto flex flex-col gap-4 flex-shrink-0">
            <div style={{ color: colors.text, textAlign: textAlign }}>
              {/* Template Padrão */}
              {template === 'default' && (
                <div className="flex items-start gap-4">
                  {domain && (
                    <div className="flex-shrink-0 mt-1 w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 overflow-hidden group/favicon">
                      {(() => {
                        const { Icon, color, hasIcon } = getServiceIcon(domain)
                        return hasIcon ? (
                          <Icon
                            className="w-4/5 h-4/5 transition-transform group-hover/favicon:scale-110"
                            color={color || '#FFFFFF'}
                          />
                        ) : favicon ? (
                          <img
                            src={favicon}
                            className="w-4/5 h-4/5 object-contain transition-transform group-hover/favicon:scale-110"
                            alt=""
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <Icon className="w-4/5 h-4/5" style={{ color }} />
                        )
                      })()}
                    </div>
                  )}
                  <div className="flex flex-col gap-2 flex-1">
                    <h2
                      className="font-bold leading-[1.15]"
                      style={{ fontSize: `${1.6 * (titleSize / 100)}rem` }}
                    >
                      {title}
                    </h2>
                    <p
                      className="opacity-70 leading-relaxed font-medium"
                      style={{ fontSize: `${0.9 * (subtitleSize / 100)}rem` }}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              )}

              {/* Template Música */}
              {template === 'music' && (
                <div className="flex items-center gap-4">
                  {domain && (
                    <div className="flex-shrink-0 mt-1 w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 overflow-hidden group/music-icon">
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover/music-icon:opacity-100 transition-opacity" />
                      {(() => {
                        const { Icon, color, hasIcon } = getServiceIcon(domain)
                        return hasIcon ? (
                          <Icon
                            className="relative w-4/5 h-4/5 transition-all"
                            color={color || '#FFFFFF'}
                          />
                        ) : favicon ? (
                          <img
                            src={favicon}
                            className="relative w-4/5 h-4/5 object-contain transition-all"
                            alt=""
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <Icon
                            className="relative w-4/5 h-4/5"
                            color={color || '#FFFFFF'}
                          />
                        )
                      })()}
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <h2
                      className="font-bold leading-tight truncate"
                      style={{ fontSize: `${1.6 * (titleSize / 100)}rem` }}
                    >
                      {title}
                    </h2>
                    <p
                      className="font-medium opacity-70 truncate"
                      style={{ fontSize: `${1.0 * (subtitleSize / 100)}rem` }}
                    >
                      {author || 'Unknown Artist'}
                    </p>
                  </div>
                </div>
              )}

              {/* Template Notícias */}
              {template === 'news' && (
                <div className="flex flex-col gap-4">
                  <div
                    className={cn(
                      'flex flex-col gap-2',
                      textAlign === 'center' && 'items-center',
                      textAlign === 'right' && 'items-end'
                    )}
                  >
                    <h2
                      className="font-bold leading-snug font-serif"
                      style={{ fontSize: `${1.8 * (titleSize / 100)}rem` }}
                    >
                      {title}
                    </h2>
                    <p
                      className="opacity-80 leading-relaxed"
                      style={{ fontSize: `${1.0 * (subtitleSize / 100)}rem` }}
                    >
                      {description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {domain && (
                      <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-md border border-white/10 overflow-hidden">
                        {(() => {
                          const { Icon, color, hasIcon } =
                            getServiceIcon(domain)
                          return hasIcon ? (
                            <Icon
                              className="w-3/4 h-3/4"
                              color={color || '#FFFFFF'}
                            />
                          ) : favicon ? (
                            <img
                              src={favicon}
                              className="w-3/4 h-3/4 object-contain"
                              alt=""
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <Icon
                              className="w-3/4 h-3/4"
                              color={color || '#FFFFFF'}
                            />
                          )
                        })()}
                      </div>
                    )}
                    <span className="uppercase tracking-widest text-[10px] font-bold opacity-60">
                      {domain}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
