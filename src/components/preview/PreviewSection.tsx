import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
// No static imports for heavy libs
import {
  Download,
  Loader2,
  Sparkles,
  Zap,
  Maximize,
  RotateCcw,
} from 'lucide-react'
import { computeUnifiedExportScale } from '../../utils/exportScale'
import { useCardStore } from '../../store/cardStore'
import { PreviewCard } from './PreviewCard'
import { isDevMode } from '../../utils/env'
import { log } from '../../utils/logger'
import { WelcomeCard } from './WelcomeCard'
import { HeadlessArtboard } from './HeadlessArtboard'

import { useHistory } from '../../hooks/useHistory'
import { fetchMetadata } from '../../services/metadata'
import { useColorExtractor } from '../../hooks/useColorExtractor'
import { urlToBase64, getEmbeddedFontCSS } from '../../services/exportUtils'
import { useAutoScale } from '../../hooks/useAutoScale'

export const PreviewSection: React.FC = () => {
  const {
    url,
    colors,
    canvasSize,
    cardPosition,
    gradientStyle,
    pattern,
    customBgImage,
    patternOpacity,
    patternScale,
    updateLayout,
    updateField,
    setFullState,
    updateNestedField,
    isWelcomeState,
    layout,
    frame,
  } = useCardStore()
  const currentState = useCardStore()
  const { exportScale } = currentState
  const { saveToHistory, history, loadFromHistory } = useHistory()
  const { extractColorsFromImage } = useColorExtractor()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const exportOnlyRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [diagnosticMode, setDiagnosticMode] = useState(false)

  // helper: dynamic padding value depending on paddingAuto and breakpoint
  const paddingValue = () => {
    if (layout?.paddingAuto) {
      return typeof window !== 'undefined'
        ? window.innerWidth < 640
          ? 32
          : 64
        : 32
    }
    return layout?.padding ?? 0
  }

  // Hook de escala automatica centralizada
  const {
    scale: viewScale,
    scalePercent,
    isAuto: isAutoScale,
    resetToAuto,
    containerRef,
    contentRef: exportRef,
  } = useAutoScale({
    minScale: 0.2,
    maxScale: 1.0,
    padding: paddingValue(),
    enabled: !isWelcomeState,
  })

  const [inputUrl, setInputUrl] = useState(url)

  // Helper & Computed States
  const isAutoCanvas = canvasSize.preset === 'auto'

  console.log('[PreviewSection] Render Cycle', {
    isWelcomeState,
    isAutoCanvas,
    canvasSize,
    viewScale,
  })

  const CANVAS_PRESETS: Record<string, { w: number; h: number }> = {
    'ig-story': { w: 1080, h: 1920 },
    'ig-post': { w: 1080, h: 1080 },
    twitter: { w: 1200, h: 676 },
    linkedin: { w: 1200, h: 627 },
    auto: { w: 1080, h: 1080 }, // Fallback
  }

  const canvasWidth =
    canvasSize.width > 0
      ? canvasSize.width
      : CANVAS_PRESETS[canvasSize.preset]?.w || 1080
  const canvasHeight =
    canvasSize.height > 0
      ? canvasSize.height
      : CANVAS_PRESETS[canvasSize.preset]?.h || 1080

  // Computed Background Style
  const getBackgroundStyle = () => {
    if (customBgImage)
      return {
        backgroundImage: `url('${customBgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }

    const isValidGradient =
      gradientStyle?.includes('deg') || gradientStyle?.includes('circle')
    const style = isValidGradient ? gradientStyle : '135deg'

    return {
      backgroundImage: style.includes('circle')
        ? `radial-gradient(${style}, ${colors.bg1}, ${colors.bg2})`
        : `linear-gradient(${style}, ${colors.bg1}, ${colors.bg2})`,
    }
  }

  const backgroundStyle = getBackgroundStyle()

  useEffect(() => {
    if (!isWelcomeState) {
      console.log('[PreviewSection] Background Style Update:', {
        colors,
        gradientStyle,
        hasCustomImage: !!customBgImage,
      })
    }
  }, [colors, gradientStyle, customBgImage, isWelcomeState])

  // Debug: log actual on-screen transform applied to the card in the preview
  useEffect(() => {
    console.log('[SPREAD-DEBUG] Preview card transform (screen):', {
      x: cardPosition.x,
      y: cardPosition.y,
      scalePreview: viewScale * (layout.cardScale ?? 1),
      finalCardSize: '640x', // fixed width reference in code
    })
  }, [cardPosition.x, cardPosition.y, layout.cardScale, viewScale])

  // Diagnostic toggle (dev only) via Ctrl/Cmd+D
  useEffect(() => {
    if (!isDevMode()) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        setDiagnosticMode(d => !d)
        log('PreviewSection', 'Diagnostics toggled', {
          enabled: !diagnosticMode,
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [diagnosticMode])

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
    const scale = patternScale || 1
    return `${base * scale}px ${base * scale}px`
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
                : pattern === 'mesh'
                  ? `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L20 10 L10 20 L0 10 Z' fill='none' stroke='white' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`
                  : 'none',
    backgroundSize: getPatternSize(),
    opacity: pattern === 'none' ? 0 : patternOpacity,
    mixBlendMode: 'overlay',
  }

  // Persist viewport size for Auto canvas sizing (useAutoScale gerencia a escala agora)
  useEffect(() => {
    if (!containerRef.current) return

    const updateViewport = () => {
      const padding = paddingValue()
      const availableWidth = containerRef.current!.clientWidth - padding
      const availableHeight = containerRef.current!.clientHeight - padding

      // Persist viewport available space for Auto canvas sizing
      updateNestedField('viewport', 'width', availableWidth)
      updateNestedField('viewport', 'height', availableHeight)

      console.log('[Layout] Viewport atualizado:', {
        availableWidth,
        availableHeight,
        padding,
      })
    }

    const observer = new ResizeObserver(updateViewport)
    observer.observe(containerRef.current)
    updateViewport()

    return () => {
      observer.disconnect()
    }
  }, [isWelcomeState])

  // NEW: Observer specifically for the card to adjust Auto Canvas size dynamically
  // This ensures that "Auto" Canvas is always perfectly sized to the card's content
  useEffect(() => {
    const updateCardDimensions = () => {
      if (!cardRef.current) return

      const newWidth = Math.ceil(cardRef.current.offsetWidth)
      const newHeight = Math.ceil(cardRef.current.offsetHeight)

      // Always update measured height for Headless scaling
      if (Math.abs((layout.measuredCardHeight || 0) - newHeight) > 1) {
        updateNestedField('layout', 'measuredCardHeight', newHeight)
      }

      // If Auto Canvas is on, update canvas dimensions
      if (isAutoCanvas) {
        if (
          (Math.abs(canvasSize.width - newWidth) > 1 ||
            Math.abs(canvasSize.height - newHeight) > 1) &&
          newWidth > 0 &&
          newHeight > 0
        ) {
          updateNestedField('canvasSize', 'width', newWidth)
          updateNestedField('canvasSize', 'height', newHeight)
          console.log('[Layout] Auto Canvas dimensions updated:', {
            newWidth,
            newHeight,
          })
        }
      }
    }

    const observer = new ResizeObserver(updateCardDimensions)
    if (cardRef.current) {
      observer.observe(cardRef.current)
      updateCardDimensions()
    }

    return () => observer.disconnect()
  }, [
    isWelcomeState,
    isAutoCanvas,
    canvasSize.width,
    canvasSize.height,
    layout.measuredCardHeight,
  ])

  // Auto Scale Card Logic (to fit inside canvas if needed) - mantido para compatibilidade com export
  const [autoScale, setAutoScale] = useState(1)
  useEffect(() => {
    // Reset to safe default if not mounted yet
    if (!cardRef.current || !exportRef.current || isWelcomeState) {
      if (autoScale !== 1) setAutoScale(1)
      return
    }

    // Apply auto-scale only when Card Auto is active AND Canvas is Fixed
    // If Canvas is Auto, we should NOT scale the card internally, as the canvas will wrap the card natural size.
    // The useAutoScale hook will handle the visual zoom to fit the screen.
    if (layout.cardAuto && !isAutoCanvas) {
      const availableWidth = canvasWidth > 0 ? canvasWidth : 640
      const availableHeight = canvasHeight > 0 ? canvasHeight : 360
      const cardW = 640
      // Use the measured card height for accurate scaling
      const cardH =
        layout.measuredCardHeight || (cardRef.current?.offsetHeight ?? 360)

      const sW = availableWidth > 0 ? availableWidth / cardW : 1
      const sH = availableHeight > 0 ? availableHeight / cardH : 1
      let cand = Math.min(sW, sH)
      cand = Math.max(0.1, Math.min(cand, 5))

      if (Number.isFinite(cand) && Math.abs(autoScale - cand) > 0.001) {
        setAutoScale(cand)
        log('PreviewSection', 'Auto-scale updated (fixed preset)', {
          cand,
          isAutoCanvas,
          availableWidth,
          availableHeight,
          cardH,
        })
      }
      return
    }

    // If not Auto Card or if Canvas is Auto, reset scale to 1
    if (autoScale !== 1) {
      setAutoScale(1)
    }
  }, [
    isAutoCanvas,
    canvasWidth,
    canvasHeight,
    layout.cardAuto,
    layout.measuredCardHeight,
    layout.paddingAuto,
    containerRef.current,
    cardRef.current,
  ])

  const autoExtractColors = async (imageUrl: string) => {
    try {
      console.log('[PreviewSection] autoExtractColors triggered for image')
      const extracted = await extractColorsFromImage(imageUrl)
      if (extracted) {
        console.log(
          '[PreviewSection] Applying extracted colors to store:',
          extracted
        )
        updateNestedField('colors', 'bg1', extracted.primary)
        updateNestedField('colors', 'bg2', extracted.secondary)
        updateField('extractedColors', {
          bg1: extracted.primary,
          bg2: extracted.secondary,
        })
      } else {
        console.warn('[PreviewSection] extractColorsFromImage returned null')
      }
    } catch (error) {
      console.error('[PreviewSection] Auto color extraction error:', error)
    }
  }

  const resetDefaultsForGeneration = () => {
    // Clear persisted preferences to ensure generation uses defaults
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('spread-preferences-v4')
      }
    } catch {
      // ignore
    }
    // Reset to defaults before generating
    updateLayout('cardAuto', true)
    updateField('paddingAuto', true)
    updateLayout('cardScale', 1)
    updateField('exportScale', undefined)
    updateField('uiScale', 1)
    log('PreviewSection', 'Reset to defaults for generation', {
      cardAuto: true,
      paddingAuto: true,
      cardScale: 1,
    })
  }

  const handleGenerate = async () => {
    resetDefaultsForGeneration()
    if (!inputUrl) return
    setIsLoadingMetadata(true)
    try {
      const data = await fetchMetadata(inputUrl)
      if (data) {
        const [base64Favicon, base64Image] = await Promise.all([
          data.favicon ? urlToBase64(data.favicon) : Promise.resolve(null),
          data.image ? urlToBase64(data.image) : Promise.resolve(null),
        ])

        setFullState({
          url: inputUrl,
          title: data.title,
          description: data.description,
          image: base64Image || data.image,
          favicon: base64Favicon || data.favicon,
          domain: data.domain,
          author: data.author || '',
          template: data.template,
          isWelcomeState: false, // Transition to editor view
          isSidebarOpen: true, // Expand sidebar on success
        })

        if (data.image) await autoExtractColors(base64Image || data.image)
      } else {
        alert('Não foi possível carregar os dados deste link.')
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao buscar link.')
    } finally {
      setIsLoadingMetadata(false)
    }
  }

  const handleDownload = async () => {
    const target = exportOnlyRef.current || exportRef.current
    if (!target) return
    setIsGenerating(true)
    updateField('isExporting', true)

    try {
      // Dynamic imports for bundle optimization
      const download = (await import('downloadjs')).default
      // Give a moment for the DOM to update styles (fallback colors)
      await new Promise(r => setTimeout(r, 100))
      await document.fonts.ready

      let dataUrl: string
      let thumbnailUrl: string

      // BIFURCATED EXPORT: Use SVG exporter for Frames, html-to-image for standard cards
      if (frame.enabled) {
        console.log('[SPREAD-DEBUG] Using SVG Exporter for Frame mode')
        // Lazy load svg exporter
        const { exportSvgToPng, getSvgContentFromContainer } =
          await import('../../services/svgExporter')

        const svgContainer = target.querySelector('.svg-frame-renderer__svg')
        if (!svgContainer) {
          throw new Error(
            'Frame SVG container not found. Frame may not be rendered.'
          )
        }

        const svgContent = getSvgContentFromContainer(
          svgContainer as HTMLElement
        )
        if (!svgContent) {
          throw new Error('Failed to extract SVG content from Frame.')
        }

        // Export High-Res
        const pngBlob = await exportSvgToPng(svgContent, {
          width: canvasSize.width,
          pixelRatio: 2,
        })
        dataUrl = await new Promise<string>(resolve => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(pngBlob)
        })

        // Export Low-Res Thumbnail
        const thumbBlob = await exportSvgToPng(svgContent, {
          width: canvasSize.width,
          pixelRatio: 0.15,
        })
        thumbnailUrl = await new Promise<string>(resolve => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(thumbBlob)
        })
      } else {
        // Standard export path (html-to-image)
        console.log('[SPREAD-DEBUG] Using html-to-image for standard card')
        const fontCss = await getEmbeddedFontCSS(currentState.fontFamily)
        const { toPng } = await import('html-to-image')

        const options = {
          cacheBust: true,
          skipFonts: true,
          fontEmbedCSS: fontCss,
          filter: (node: HTMLElement) => {
            if (
              node.tagName === 'LINK' &&
              (node as HTMLLinkElement).href?.includes('fonts.googleapis')
            )
              return false
            if (node.tagName === 'IMG') {
              const src = (node as HTMLImageElement).src
              if (
                src &&
                src.startsWith('http') &&
                !src.includes('localhost') &&
                src.includes('favicon')
              )
                return false
            }
            return true
          },
        }

        const unifiedExportScale = computeUnifiedExportScale({
          exportScale,
          cardScale: layout.cardScale,
          autoScale,
          preset: canvasSize.preset,
        })
        console.log(
          '[SPREAD-DEBUG] Starting export details (unified):',
          JSON.stringify(
            {
              type: 'EXPORT',
              width: target.offsetWidth,
              height: target.offsetHeight,
              preset: canvasSize.preset,
              autoScale: autoScale,
              exportScale: unifiedExportScale,
            },
            null,
            2
          )
        )
        dataUrl = await toPng(target as HTMLElement, {
          ...options,
          pixelRatio: 2,
        })
        console.log('[SPREAD-DEBUG] High-res export completed')

        thumbnailUrl = await toPng(target, {
          ...options,
          pixelRatio: 0.15,
        })
      }

      saveToHistory({ ...currentState, previewImage: thumbnailUrl })
      download(dataUrl, `spread-${Date.now()}.png`)
    } catch (e) {
      console.error('Download failed', e)
      alert('Falha ao gerar imagem.')
    } finally {
      setIsGenerating(false)
      updateField('isExporting', false)
    }
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden relative"
      role="region"
      aria-label="Preview"
    >
      <div className="absolute inset-0 -z-10">
        {isWelcomeState ? (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-transparent" />
          </div>
        ) : (
          <>
            <div
              className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-80"
              style={backgroundStyle}
            />
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none mix-blend-overlay"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="editor-grid"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                  <circle cx="0" cy="0" r="1" fill="white" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#editor-grid)" />
            </svg>
          </>
        )}
      </div>

      <div
        className={`flex-shrink-0 w-full max-w-2xl mx-auto px-3 sm:px-4 z-20 transition-all duration-1000 ${isWelcomeState ? 'mt-4 sm:mt-12 py-4 sm:py-8' : 'mt-2 sm:mt-4 py-2 sm:py-3'}`}
      >
        <div
          className={`flex gap-2 sm:gap-3 rounded-2xl p-1.5 sm:p-2 border border-white/10 ring-1 ring-white/5 transition-all duration-500 ${isWelcomeState ? 'bg-black/40 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)]' : 'bg-black/60 backdrop-blur-xl shadow-2xl'}`}
        >
          <input
            type="url"
            placeholder="Cole seu link aqui..."
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            className="flex-1 bg-transparent px-3 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none min-w-0"
            aria-label="URL do link"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoadingMetadata}
            className="flex-shrink-0 bg-white text-black px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-black hover:bg-gray-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50 flex items-center justify-center gap-2 group min-h-[44px]"
            aria-label="Gerar card"
          >
            {isLoadingMetadata ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                <Zap
                  size={18}
                  className="fill-black group-hover:scale-125 transition-transform"
                />{' '}
                <span className="hidden sm:inline">Gerar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* NEW RENDER/MEASURE ARCHITECTURE */}
      {isDevMode() && (
        <button
          onClick={() => setDiagnosticMode(d => !d)}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 60,
            background: 'rgba(0,0,0,.6)',
            color: '#fff',
            border: '1px solid #fff',
            padding: '6px 8px',
            borderRadius: 4,
          }}
        >
          Diagnostics: {diagnosticMode ? 'On' : 'Off'}
        </button>
      )}
      {diagnosticMode && isDevMode() && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 50,
            padding: '6px 8px',
            background: 'rgba(0,0,0,.6)',
            color: '#fff',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          Canvas {canvasWidth}x{canvasHeight} • Card 640x
          {cardRef.current?.offsetHeight ?? 360} • ViewScale{' '}
          {viewScale.toFixed(2)} ({scalePercent}%) • CardScale{' '}
          {layout.cardScale} • Padding {layout.padding}
          {layout.paddingAuto ? ' (auto)' : ''} • AutoScale:{' '}
          {isAutoScale ? 'ON' : 'OFF'}
        </div>
      )}

      {/* Indicador de escala para usuario */}
      {!isWelcomeState && (
        <div
          className="absolute bottom-4 left-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10"
          style={{ position: 'absolute' }}
        >
          <Maximize size={14} className="text-white/60" />
          <span className="text-white/80 text-sm font-medium">
            {scalePercent}%
          </span>
          {!isAutoScale && (
            <button
              onClick={resetToAuto}
              className="ml-1 p-1 rounded hover:bg-white/10 transition-colors"
              title="Resetar para escala automatica"
            >
              <RotateCcw size={12} className="text-white/60" />
            </button>
          )}
          {isAutoScale && (
            <span className="text-[10px] text-white/40 uppercase tracking-wider ml-1">
              Auto
            </span>
          )}
        </div>
      )}
      <div
        ref={containerRef}
        className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-4"
      >
        <div
          className="relative transition-transform duration-500 ease-out origin-center flex flex-col items-center justify-center p-20"
          style={{
            transform: `scale(${viewScale})`,
            minWidth: 'min-content',
          }}
        >
          {isWelcomeState ? (
            <div
              ref={exportRef}
              className="relative w-max max-w-[90vw] mx-auto z-10 transition-all duration-700"
            >
              <WelcomeCard />
            </div>
          ) : (
            <div
              key="preview-artboard"
              ref={exportRef}
              className={
                isAutoCanvas
                  ? 'artboard-root relative overflow-visible w-fit h-fit transition-all duration-300'
                  : 'artboard-root relative overflow-visible transition-all duration-300'
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
              {/* Pattern Layer */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay z-0"
                style={patternStyle}
              />

              <div
                className={
                  isAutoCanvas
                    ? 'relative z-10 p-20 flex flex-col items-center justify-center overflow-visible w-full h-full'
                    : 'relative z-10 flex items-center justify-center h-full w-full overflow-visible'
                }
              >
                <div
                  ref={cardRef}
                  className="w-fit h-fit overflow-visible"
                  style={{
                    transform:
                      frame.enabled && !isWelcomeState
                        ? 'none'
                        : `translate(${cardPosition.x}%, ${cardPosition.y}%) scale(${computeUnifiedExportScale({ exportScale, cardScale: layout.cardScale, autoScale, preset: canvasSize.preset })})`,
                    transformOrigin: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PreviewCard
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    padding={paddingValue()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isWelcomeState && history.length > 0 && (
        <div className="flex-shrink-0 py-6 z-20 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3 font-medium">
            Recentes
          </p>
          <div className="flex items-center gap-3">
            {history.slice(0, 3).map(item => (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="w-16 h-16 rounded-lg border border-white/10 hover:border-white/40 hover:scale-105 transition-all shadow-lg overflow-hidden bg-black/40 relative group min-w-[44px] min-h-[44px]"
                title={item.title}
                aria-label={`Carregar histórico: ${item.title || 'Sem título'}`}
              >
                {item.previewImage ? (
                  <img
                    src={item.previewImage}
                    alt=""
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Sparkles size={12} />
                  </div>
                )}
              </button>
            ))}
            <button
              onClick={() => updateField('isSidebarOpen', true)}
              className="w-16 h-16 rounded-lg border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1 text-white/30 hover:text-white group"
            >
              <span className="text-[9px] uppercase tracking-wider group-hover:text-white/70">
                Histórico
              </span>
            </button>
          </div>
        </div>
      )}

      {!isWelcomeState && (
        <div className="flex-shrink-0 py-4 sm:py-6 flex justify-center z-10 mb-2 sm:mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-sm min-h-[44px]"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Download size={18} />
            )}
            {isGenerating ? 'Gerando...' : 'Baixar Imagem'}
          </button>
        </div>
      )}

      {/* Invisble Artboard for High-Fidelity Exports */}
      <HeadlessArtboard ref={exportOnlyRef} />
    </div>
  )
}
