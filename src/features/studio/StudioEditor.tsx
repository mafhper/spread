import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Download,
  FilePlus2,
  Loader2,
  PanelLeft,
  Redo2,
  Undo2,
  X,
} from 'lucide-react'

import { useCardStore } from '../../store/cardStore'
import { fetchMetadata } from '../../services/metadata'
import { urlToBase64 } from '../../services/exportUtils'
import { getPendingUrl, removePendingUrl } from '../../utils/persistence'
import {
  CANVAS_PRESETS,
  detectViewport,
  VIEWPORT_TO_PRESET,
} from '../../utils/canvasPresets'
import type {
  LinkMediaSource,
  PageCaptureArea,
  PageCaptureViewport,
} from '../../types/capture'
import {
  cardStatePatchFromDocument,
  documentFromCardState,
  type SpreadDocumentV1,
} from '../composition/document'
import { LibraryPanel } from './LibraryPanel'
import { studioRepository } from './repository'

const PreviewSection = lazy(() =>
  import('../../components/preview/PreviewSection').then(module => ({
    default: module.PreviewSection,
  }))
)

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

type MobilePanel = 'library' | null
type LoadState = 'idle' | 'metadata' | 'page' | 'assets' | 'ready' | 'error'
type ExportState = 'idle' | 'running' | 'success' | 'error'

export const StudioEditor: React.FC = () => {
  const state = useCardStore()
  const [inputUrl, setInputUrl] = useState(state.url)
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [exportState, setExportState] = useState<ExportState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null)
  const [historyVersion, setHistoryVersion] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const previewRef = useRef<
    | import('../../components/preview/PreviewSection').PreviewSectionHandle
    | null
  >(null)
  const initialUrlRef = useRef<string | null>(null)
  const pastRef = useRef<SpreadDocumentV1[]>([])
  const futureRef = useRef<SpreadDocumentV1[]>([])
  const applyingHistoryRef = useRef(false)

  useEffect(() => {
    const sync = () => setIsCompact(window.innerWidth < 900)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const draft = await studioRepository.loadDraft()
        if (draft && active) {
          state.setFullState({
            ...cardStatePatchFromDocument(draft),
            isWelcomeState: false,
          })
          setInputUrl(draft.content.url)
        } else if (active) {
          state.updateField('isWelcomeState', false)
        }
      } catch {
        if (active) state.updateField('isWelcomeState', false)
      }

      const pendingUrl = getPendingUrl()
      if (active && pendingUrl) {
        setInputUrl(pendingUrl)
        initialUrlRef.current = pendingUrl
        removePendingUrl()
      }
      if (active) setIsReady(true)
    })()

    return () => {
      active = false
      abortRef.current?.abort()
    }
  }, [])

  const handleLoad = useCallback(
    async (overrideUrl?: string) => {
      const sourceUrl = (overrideUrl || inputUrl).trim()
      if (!sourceUrl) return

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setErrorMessage('')
      const currentState = useCardStore.getState()
      const isPageCapture = currentState.mediaSource === 'page'
      setLoadState(isPageCapture ? 'page' : 'metadata')

      try {
        const metadata = await fetchMetadata(sourceUrl, {
          signal: controller.signal,
          capture: isPageCapture
            ? {
                viewport: currentState.captureViewport,
                area: currentState.captureArea,
              }
            : undefined,
        })
        if (!metadata) {
          throw new Error(
            isPageCapture
              ? 'A página não concluiu a captura. Tente outra área ou dispositivo.'
              : 'Não foi possível ler este link.'
          )
        }
        if (controller.signal.aborted) return

        setLoadState('assets')
        const [favicon, image] = await Promise.all([
          metadata.favicon
            ? urlToBase64(metadata.favicon, { signal: controller.signal })
            : Promise.resolve(null),
          metadata.image
            ? urlToBase64(metadata.image, { signal: controller.signal })
            : Promise.resolve(null),
        ])
        if (controller.signal.aborted) return

        currentState.setFullState({
          url: sourceUrl,
          title: metadata.title || metadata.domain,
          description: metadata.description,
          image: image || metadata.image,
          favicon: favicon || metadata.favicon,
          domain: metadata.domain,
          author: metadata.author,
          template: metadata.template,
          isWelcomeState: false,
        })
        setInputUrl(sourceUrl)
        setLoadState('ready')
      } catch (error) {
        if (controller.signal.aborted) return
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar este link.'
        )
        setLoadState('error')
      }
    },
    [inputUrl]
  )

  const updateCaptureSetting = (
    field: 'mediaSource' | 'captureViewport' | 'captureArea',
    value: LinkMediaSource | PageCaptureViewport | PageCaptureArea
  ) => {
    if (field === 'mediaSource' && value === 'page') {
      const viewport = detectViewport()
      const presetName = VIEWPORT_TO_PRESET[viewport]
      const preset = CANVAS_PRESETS[presetName]
      state.updateField('mediaSource', value)
      state.updateField('captureViewport', viewport)
      state.updateNestedField('canvasSize', 'width', preset.w)
      state.updateNestedField('canvasSize', 'height', preset.h)
      state.updateNestedField('canvasSize', 'preset', presetName)
      state.updateLayout('aspectRatio', 'aspect-auto')
      state.updateLayout('imageFit', 'contain')
      state.updateNestedField('cardPosition', 'x', 0)
      state.updateNestedField('cardPosition', 'y', 0)
    } else {
      state.updateField(field, value)
    }
    setLoadState('idle')
    setErrorMessage('')
    const currentUrl = useCardStore.getState().url
    if (currentUrl && isReady) {
      void handleLoad(currentUrl)
    }
  }

  useEffect(() => {
    if (!isReady || !initialUrlRef.current) return
    const pending = initialUrlRef.current
    initialUrlRef.current = null
    void handleLoad(pending)
  }, [handleLoad, isReady])

  const serializedDocument = useMemo(
    () => JSON.stringify(documentFromCardState(state)),
    [state]
  )

  useEffect(() => {
    if (!isReady) return
    const timeoutId = window.setTimeout(() => {
      void studioRepository
        .saveDraft(JSON.parse(serializedDocument) as SpreadDocumentV1)
        .catch(() => undefined)
    }, 500)
    return () => window.clearTimeout(timeoutId)
  }, [isReady, serializedDocument])

  useEffect(() => {
    if (!isReady) return
    return useCardStore.subscribe((nextState, previousState) => {
      if (applyingHistoryRef.current) return
      const next = documentFromCardState(nextState)
      const previous = documentFromCardState(previousState)
      if (JSON.stringify(next) === JSON.stringify(previous)) return
      pastRef.current = [...pastRef.current.slice(-49), previous]
      futureRef.current = []
      setHistoryVersion(version => version + 1)
    })
  }, [isReady])

  useEffect(() => {
    if (!mobilePanel) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobilePanel(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobilePanel])

  const applyHistoryDocument = (document: SpreadDocumentV1) => {
    applyingHistoryRef.current = true
    state.setFullState({
      ...cardStatePatchFromDocument(document),
      isWelcomeState: false,
    })
    queueMicrotask(() => {
      applyingHistoryRef.current = false
    })
    setHistoryVersion(version => version + 1)
  }

  const undo = () => {
    const previous = pastRef.current.pop()
    if (!previous) return
    futureRef.current.push(documentFromCardState(useCardStore.getState()))
    applyHistoryDocument(previous)
  }

  const redo = () => {
    const next = futureRef.current.pop()
    if (!next) return
    pastRef.current.push(documentFromCardState(useCardStore.getState()))
    applyHistoryDocument(next)
  }

  const createNew = async () => {
    abortRef.current?.abort()
    await studioRepository.clearDraft().catch(() => undefined)
    state.resetContent()
    state.resetToDefaults()
    state.updateField('isWelcomeState', false)
    setInputUrl('')
    setLoadState('idle')
    setErrorMessage('')
    pastRef.current = []
    futureRef.current = []
    setHistoryVersion(version => version + 1)
  }

  const download = async () => {
    if (!previewRef.current || exportState === 'running') return
    setExportState('running')
    try {
      await previewRef.current.download()
      setExportState('success')
    } catch {
      setExportState('error')
    }
  }

  const dimensions =
    state.canvasSize.preset === 'auto'
      ? 'Auto'
      : `${state.canvasSize.width} × ${state.canvasSize.height}`

  const panelClose = isCompact && mobilePanel && (
    <button
      className="mobile-panel-close"
      onClick={() => setMobilePanel(null)}
      aria-label="Fechar painel"
    >
      <X size={18} />
    </button>
  )

  return (
    <main
      className="studio-shell"
      data-history-version={historyVersion}
      data-ready={isReady}
      aria-busy={!isReady}
    >
      <header className="studio-topbar">
        <a
          className="studio-brand"
          href={`${base}/`}
          aria-label="Voltar ao início"
        >
          <span className="studio-brand-mark" aria-hidden="true">
            <img src={`${base}/logo.svg`} alt="" width={20} height={20} />
          </span>
          <span>Spread</span>
        </a>
        <div className="studio-topbar-center">
          <button onClick={() => void createNew()}>
            <FilePlus2 size={16} />
            <span>Novo</span>
          </button>
          <span className="studio-topbar-divider" />
          <button
            onClick={undo}
            disabled={pastRef.current.length === 0}
            aria-label="Desfazer"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={futureRef.current.length === 0}
            aria-label="Refazer"
          >
            <Redo2 size={16} />
          </button>
          <span
            className="studio-document-name"
            title={state.url || 'Novo card'}
          >
            {state.domain || 'Novo card'}
          </span>
          <span className="studio-dimensions">{dimensions}</span>
        </div>
        <button
          className="studio-export-button"
          onClick={() => void download()}
          disabled={exportState === 'running'}
        >
          {exportState === 'running' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>Exportar</span>
        </button>
      </header>

      <div className="studio-workspace">
        {(!isCompact || mobilePanel === 'library') && (
          <aside
            className={`studio-side-panel studio-library ${isCompact ? 'studio-mobile-sheet' : ''}`}
          >
            {panelClose}
            <LibraryPanel
              inputUrl={inputUrl}
              setInputUrl={setInputUrl}
              onLoad={() => void handleLoad()}
              isReady={isReady}
              loadState={loadState}
              errorMessage={errorMessage}
              mediaSource={state.mediaSource}
              captureViewport={state.captureViewport}
              captureArea={state.captureArea}
              onCaptureSettingChange={updateCaptureSetting}
            />
          </aside>
        )}

        <section className="studio-stage" aria-label="Canvas de composição">
          <Suspense
            fallback={
              <div className="studio-loading">
                <Loader2 className="animate-spin" />
                Preparando canvas…
              </div>
            }
          >
            <PreviewSection ref={previewRef} />
          </Suspense>
        </section>
      </div>

      {isCompact && (
        <nav className="studio-mobile-dock" aria-label="Ferramentas do editor">
          <button
            aria-pressed={mobilePanel === 'library'}
            onClick={() =>
              setMobilePanel(current =>
                current === 'library' ? null : 'library'
              )
            }
          >
            <PanelLeft size={18} /> Ajustes
          </button>
        </nav>
      )}

      <p className="sr-status" aria-live="polite">
        {exportState === 'success' && 'Imagem exportada.'}
        {exportState === 'error' && 'Falha ao exportar a imagem.'}
      </p>
    </main>
  )
}
