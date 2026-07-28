import * as React from 'react'
import {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react'
// No static imports for heavy libs
import {
  Image as ImageIcon,
  Loader2,
  Zap,
  Maximize,
  RotateCcw,
} from 'lucide-react'
import { useCardStore } from '../../store/cardStore'
import { CompositionArtboard } from '../../features/composition/CompositionArtboard'
import { log } from '../../utils/logger'
import { CANVAS_PRESETS } from '../../utils/canvasPresets'
import { WelcomeCard } from './WelcomeCard'

import { useHistory } from '../../hooks/useHistory'
import { fetchLinkMetadata } from '../../services/metadata'
import { useColorExtractor } from '../../hooks/useColorExtractor'
import {
  urlToBase64,
  getEmbeddedFontCSS,
  waitForImages,
  waitForStableLayout,
  nextAnimationFrame,
} from '../../services/exportUtils'
import { useAutoScale } from '../../hooks/useAutoScale'

export interface PreviewSectionHandle {
  download: () => Promise<void>
}

export const PreviewSection = forwardRef<PreviewSectionHandle>(
  function PreviewSection(_, ref) {
    const {
      url,
      colors,
      canvasSize,
      cardPosition,
      gradientStyle,
      customBgImage,
      updateLayout,
      updateField,
      setFullState,
      updateNestedField,
      isWelcomeState,
      isSidebarOpen,
      layout,
      outputMode,
      pageCapture,
    } = useCardStore()
    const currentState = useCardStore()
    const { saveToHistory, history, loadFromHistory } = useHistory()
    const { extractColorsFromImage } = useColorExtractor()
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const [isCompactViewport, setIsCompactViewport] = useState(false)
    const [isToolbarCompact, setIsToolbarCompact] = useState(false)
    const isMobileEditing =
      !isWelcomeState && isCompactViewport && isSidebarOpen

    // helper: dynamic padding value depending on paddingAuto and breakpoint
    const paddingValue = () => {
      if (layout?.paddingAuto) {
        if (isMobileEditing) {
          return 12
        }
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
      recalculate,
      resetToAuto,
      containerRef,
      contentRef: exportRef,
    } = useAutoScale({
      minScale: isMobileEditing ? 0.08 : 0.2,
      maxScale: 1.0,
      padding: paddingValue(),
      enabled: !isWelcomeState,
    })
    const previewScale = isMobileEditing ? viewScale * 0.9 : viewScale

    const [inputUrl, setInputUrl] = useState(url)

    useEffect(() => {
      const syncViewportDensity = () => {
        setIsCompactViewport(window.innerWidth < 640)
        setIsToolbarCompact(window.innerWidth < 1024)
      }

      syncViewportDensity()
      window.addEventListener('resize', syncViewportDensity)

      return () => window.removeEventListener('resize', syncViewportDensity)
    }, [])

    useEffect(() => {
      if (isWelcomeState) return

      const frameId = requestAnimationFrame(() => {
        recalculate()
      })

      return () => cancelAnimationFrame(frameId)
    }, [
      canvasSize.width,
      canvasSize.height,
      canvasSize.preset,
      isSidebarOpen,
      isCompactViewport,
      layout.measuredCardHeight,
      recalculate,
      isWelcomeState,
    ])

    // Helper & Computed States
    const isAutoCanvas = canvasSize.preset === 'auto'

    console.log('[PreviewSection] Render Cycle', {
      isWelcomeState,
      isAutoCanvas,
      canvasSize,
      viewScale,
    })

    const isDirectPage = outputMode === 'page-capture' && !!pageCapture
    const canvasWidth =
      isDirectPage && canvasSize.preset === 'auto'
        ? pageCapture.width || canvasSize.width || 1080
        : canvasSize.width > 0
          ? canvasSize.width
          : CANVAS_PRESETS[canvasSize.preset]?.w || 1080
    const canvasHeight =
      isDirectPage && canvasSize.preset === 'auto'
        ? pageCapture.height || canvasSize.height || 1080
        : canvasSize.height > 0
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

        // Auto canvas wraps only the social card. Direct page mode receives
        // its size from the committed capture asset.
        if (isAutoCanvas && outputMode === 'social-card') {
          const targetWidth = newWidth
          const targetHeight = newHeight

          if (
            (Math.abs(canvasSize.width - targetWidth) > 1 ||
              Math.abs(canvasSize.height - targetHeight) > 1) &&
            targetWidth > 0 &&
            targetHeight > 0
          ) {
            updateNestedField('canvasSize', 'width', targetWidth)
            updateNestedField('canvasSize', 'height', targetHeight)
            console.log('[Layout] Auto Canvas dimensions updated:', {
              targetWidth,
              targetHeight,
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
      outputMode,
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
      if (layout.cardAuto && !isAutoCanvas && !isDirectPage) {
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
      isDirectPage,
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
        const data = await fetchLinkMetadata(inputUrl)
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
            coverImage: base64Image || data.image,
            pageCapture: null,
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
      const target = exportRef.current
      if (!target) return
      updateField('isExporting', true)

      try {
        // Dynamic imports for bundle optimization
        const download = (await import('downloadjs')).default
        // Aguarda recursos antes de rasterizar: fontes prontas, imagens
        // decodificadas e layout estável (evita PNG com imagem em branco ou
        // capturada durante reflow). Substitui o antigo setTimeout(100).
        await document.fonts.ready
        await waitForImages(target)
        await waitForStableLayout(target)
        await nextAnimationFrame()

        let dataUrl: string
        let thumbnailUrl: string

        {
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

          // The captured node is the same node shown in the editor. Viewport
          // zoom lives on its parent and never changes exported geometry.
          console.log(
            '[SPREAD-DEBUG] Starting export details:',
            JSON.stringify(
              {
                type: 'EXPORT',
                width: target.offsetWidth,
                height: target.offsetHeight,
                preset: canvasSize.preset,
                autoScale,
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
        throw e
      } finally {
        updateField('isExporting', false)
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        download: handleDownload,
      }),
      [handleDownload]
    )

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

        {isWelcomeState && (
          <div className="flex-shrink-0 w-full max-w-2xl mx-auto px-3 sm:px-4 z-20 transition-all duration-1000 mt-4 sm:mt-12 py-4 sm:py-8">
            <div className="rounded-2xl p-1.5 sm:p-2 border border-white/10 ring-1 ring-white/5 transition-all duration-500 bg-black/40 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                  className="flex-shrink-0 w-full sm:w-auto bg-white text-black px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-black hover:bg-gray-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50 flex items-center justify-center gap-2 group min-h-[44px]"
                  aria-label="Gerar card"
                >
                  {isLoadingMetadata ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <Zap
                        size={18}
                        className="fill-black group-hover:scale-125 transition-transform"
                      />
                      <span>Gerar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de escala para usuario */}
        {!isWelcomeState && !isToolbarCompact && (
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
          className={`flex-1 w-full relative overflow-hidden flex justify-center ${
            isToolbarCompact
              ? isMobileEditing
                ? 'items-center px-3 pt-0 pb-2'
                : 'items-start px-3 pt-2 pb-4'
              : 'items-center p-4'
          }`}
        >
          <div
            className={`relative transition-transform duration-500 ease-out origin-center flex flex-col items-center justify-center ${
              isToolbarCompact
                ? isMobileEditing
                  ? 'px-1 py-1'
                  : 'p-8 sm:p-12'
                : 'p-20'
            }`}
            style={{
              transform: `scale(${previewScale})`,
              marginTop: isMobileEditing ? -12 : 0,
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
              <CompositionArtboard
                key="preview-artboard"
                ref={exportRef}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                fitScale={autoScale}
                cardRef={cardRef}
                cardPadding={paddingValue()}
              />
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
                      <ImageIcon size={12} />
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
      </div>
    )
  }
)
