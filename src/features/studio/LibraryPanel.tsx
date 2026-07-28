import React, { useState } from 'react'
import {
  ArrowRight,
  Image as ImageIcon,
  Link2,
  Loader2,
  Monitor,
  RotateCcw,
  Smartphone,
  Tablet,
} from 'lucide-react'

import { CanvasControls } from '../../components/toolbar/tabs/CanvasControls'
import { CardTabs } from '../../components/toolbar/tabs/CardTabs'
import { PhotoTabs } from '../../components/toolbar/tabs/PhotoTabs'
import { TypographyTabs } from '../../components/toolbar/tabs/TypographyTabs'
import { ColorTabs } from '../../components/toolbar/tabs/ColorTabs'
import { BackgroundTabs } from '../../components/toolbar/tabs/BackgroundTabs'
import { useCardStore } from '../../store/cardStore'
import {
  PAGE_CAPTURE_VIEWPORTS,
  type LinkMediaSource,
  type OutputMode,
  type PageCaptureArea,
  type PageCaptureViewport,
} from '../../types/capture'
import { PresetLibrary } from './PresetLibrary'

type PanelId = 'content' | 'composition' | 'appearance'

export interface LibraryPanelProps {
  inputUrl: string
  setInputUrl: (value: string) => void
  onLoad: () => void
  onCapturePage: () => void
  onOutputModeChange: (mode: OutputMode) => void
  isReady: boolean
  loadState: 'idle' | 'metadata' | 'page' | 'assets' | 'ready' | 'error'
  errorMessage: string
  mediaSource: LinkMediaSource
  captureViewport: PageCaptureViewport
  captureArea: PageCaptureArea
  onCaptureSettingChange: (
    field: 'mediaSource' | 'captureViewport' | 'captureArea',
    value: LinkMediaSource | PageCaptureViewport | PageCaptureArea
  ) => void
}

const captureViewports = [
  { id: 'desktop' as const, Icon: Monitor, ...PAGE_CAPTURE_VIEWPORTS.desktop },
  { id: 'tablet' as const, Icon: Tablet, ...PAGE_CAPTURE_VIEWPORTS.tablet },
  { id: 'mobile' as const, Icon: Smartphone, ...PAGE_CAPTURE_VIEWPORTS.mobile },
]

const PageFrameControls: React.FC = () => {
  const { pageFrame, updateNestedField } = useCardStore()
  const setFrame = (field: string, value: unknown) =>
    updateNestedField('pageFrame', field, value)
  const focus = [
    ['Superior esquerdo', -50, -50],
    ['Superior', 0, -50],
    ['Superior direito', 50, -50],
    ['Esquerda', -50, 0],
    ['Centro', 0, 0],
    ['Direita', 50, 0],
    ['Inferior esquerdo', -50, 50],
    ['Inferior', 0, 50],
    ['Inferior direito', 50, 50],
  ] as const

  return (
    <div className="studio-form-stack page-frame-controls">
      <div className="panel-section-heading">
        <div>
          <h2>Enquadramento da página</h2>
          <p>O canvas não altera o dispositivo capturado.</p>
        </div>
      </div>
      <div
        className="capture-source-grid"
        role="group"
        aria-label="Ajuste da página"
      >
        {(['contain', 'cover'] as const).map(fit => (
          <button
            key={fit}
            type="button"
            aria-pressed={pageFrame.fit === fit}
            onClick={() => setFrame('fit', fit)}
          >
            <ImageIcon size={16} aria-hidden="true" />
            <span>
              <strong>
                {fit === 'contain' ? 'Mostrar inteira' : 'Preencher canvas'}
              </strong>
              <small>
                {fit === 'contain'
                  ? 'Mantém todos os limites'
                  : 'Permite recorte e foco'}
              </small>
            </span>
          </button>
        ))}
      </div>
      <label className="studio-field">
        <span>Zoom {Math.round(pageFrame.scale * 100)}%</span>
        <input
          aria-label="Zoom da captura"
          type="range"
          min="0.5"
          max="2.5"
          step="0.05"
          value={pageFrame.scale}
          onChange={event => setFrame('scale', Number(event.target.value))}
        />
      </label>
      <div className="studio-field">
        <span>Foco</span>
        <div
          className="page-focus-grid"
          role="group"
          aria-label="Foco da página"
        >
          {focus.map(([label, x, y]) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              aria-pressed={pageFrame.offsetX === x && pageFrame.offsetY === y}
              onClick={() => {
                setFrame('offsetX', x)
                setFrame('offsetY', y)
              }}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        className="studio-secondary-button"
        onClick={() => {
          setFrame('fit', 'contain')
          setFrame('scale', 1)
          setFrame('offsetX', 0)
          setFrame('offsetY', 0)
        }}
      >
        <RotateCcw size={15} /> Redefinir enquadramento
      </button>
    </div>
  )
}

export const LibraryPanel: React.FC<LibraryPanelProps> = props => {
  const [activePanel, setActivePanel] = useState<PanelId>('content')
  const {
    title,
    description,
    author,
    template,
    outputMode,
    pageCapture,
    updateField,
  } = useCardStore()
  const isLoading =
    !props.isReady ||
    props.loadState === 'metadata' ||
    props.loadState === 'page' ||
    props.loadState === 'assets'
  const isPageMode = outputMode === 'page-capture'
  const needsCapture = isPageMode || props.mediaSource === 'page'

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-title">
        <span>Composição</span>
        <small>Conteúdo, enquadramento e aparência</small>
      </div>
      <div className="studio-segmented" role="tablist" aria-label="Editor">
        {(
          [
            ['content', 'Conteúdo'],
            ['composition', 'Composição'],
            ['appearance', 'Aparência'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={activePanel === id}
            onClick={() => setActivePanel(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="studio-panel-scroll">
        {activePanel === 'content' && (
          <div className="studio-form-stack">
            <div className="panel-section-heading">
              <div>
                <h2>Resultado</h2>
                <p>Escolha antes de ajustar os detalhes.</p>
              </div>
            </div>
            <div
              className="capture-source-grid"
              role="group"
              aria-label="Tipo de resultado"
            >
              <button
                type="button"
                aria-pressed={!isPageMode}
                onClick={() => props.onOutputModeChange('social-card')}
              >
                <ImageIcon size={16} aria-hidden="true" />
                <span>
                  <strong>Card social</strong>
                  <small>Imagem, título e estilo</small>
                </span>
              </button>
              <button
                type="button"
                aria-pressed={isPageMode}
                onClick={() => props.onOutputModeChange('page-capture')}
              >
                <Monitor size={16} aria-hidden="true" />
                <span>
                  <strong>Captura da página</strong>
                  <small>Exportação limpa da página</small>
                </span>
              </button>
            </div>

            <div className="panel-section-heading">
              <div>
                <h2>Link de origem</h2>
                <p>Atualiza os dados sem perder a composição.</p>
              </div>
            </div>
            <form
              className="studio-url-form"
              onSubmit={event => {
                event.preventDefault()
                props.onLoad()
              }}
            >
              <Link2 size={16} aria-hidden="true" />
              <label className="sr-only" htmlFor="studio-source-url">
                URL do link
              </label>
              <input
                id="studio-source-url"
                type="url"
                value={props.inputUrl}
                disabled={!props.isReady}
                onChange={event => props.setInputUrl(event.target.value)}
                placeholder="Cole uma URL"
              />
              <button
                type="submit"
                disabled={!props.inputUrl.trim() || isLoading}
                aria-label="Carregar link"
              >
                {props.loadState === 'metadata' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
              </button>
            </form>
            <p
              className="load-status"
              data-state={props.loadState}
              aria-live="polite"
            >
              {!props.isReady && 'Preparando editor…'}
              {props.loadState === 'metadata' && 'Lendo metadados…'}
              {props.loadState === 'page' &&
                'Renderizando a página e aguardando estabilidade…'}
              {props.loadState === 'assets' && 'Validando a imagem capturada…'}
              {props.loadState === 'ready' && 'Conteúdo atualizado.'}
              {props.loadState === 'error' && props.errorMessage}
            </p>

            {!isPageMode && (
              <div className="capture-source-section">
                <div className="panel-section-heading">
                  <div>
                    <h2>Imagem do card</h2>
                    <p>Capa publicada ou página renderizada.</p>
                  </div>
                </div>
                <div
                  className="capture-source-grid"
                  role="group"
                  aria-label="Imagem do card"
                >
                  <button
                    type="button"
                    aria-pressed={props.mediaSource === 'metadata'}
                    onClick={() =>
                      props.onCaptureSettingChange('mediaSource', 'metadata')
                    }
                  >
                    <ImageIcon size={16} aria-hidden="true" />
                    <span>
                      <strong>Capa</strong>
                      <small>Imagem compartilhada pelo site</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={props.mediaSource === 'page'}
                    onClick={() =>
                      props.onCaptureSettingChange('mediaSource', 'page')
                    }
                  >
                    <Monitor size={16} aria-hidden="true" />
                    <span>
                      <strong>Página</strong>
                      <small>Captura renderizada</small>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {needsCapture && (
              <div className="capture-options">
                <fieldset>
                  <legend>Dispositivo da captura</legend>
                  <div
                    className="capture-device-grid"
                    role="group"
                    aria-label="Dispositivo da captura"
                  >
                    {captureViewports.map(
                      ({ id, Icon, label, width, height }) => (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={props.captureViewport === id}
                          disabled={isLoading}
                          onClick={() =>
                            props.onCaptureSettingChange('captureViewport', id)
                          }
                        >
                          <Icon size={15} aria-hidden="true" />
                          <span>{label}</span>
                          <small>
                            {width} × {height}
                          </small>
                        </button>
                      )
                    )}
                  </div>
                </fieldset>
                <label className="studio-field capture-area-field">
                  <span>Área capturada</span>
                  <select
                    value={props.captureArea}
                    disabled={isLoading}
                    onChange={event =>
                      props.onCaptureSettingChange(
                        'captureArea',
                        event.target.value as PageCaptureArea
                      )
                    }
                  >
                    <option value="viewport">Tela visível</option>
                    <option value="main">Conteúdo principal</option>
                    <option value="fullPage">Página inteira</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="studio-capture-button"
                  disabled={!props.inputUrl.trim() || isLoading}
                  onClick={props.onCapturePage}
                >
                  {isLoading && props.loadState !== 'metadata' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Monitor size={16} />
                  )}
                  {pageCapture ? 'Atualizar captura' : 'Capturar página'}
                </button>
                {pageCapture && (
                  <p className="capture-loading-note">
                    A exportação usa a última captura concluída até você
                    atualizar esta página.
                  </p>
                )}
              </div>
            )}

            {!isPageMode && (
              <>
                <label className="studio-field">
                  <span>Título</span>
                  <textarea
                    rows={3}
                    value={title}
                    disabled={!props.isReady}
                    onChange={event => updateField('title', event.target.value)}
                  />
                </label>
                <label className="studio-field">
                  <span>{template === 'music' ? 'Artista' : 'Descrição'}</span>
                  <textarea
                    rows={4}
                    value={template === 'music' ? author : description}
                    disabled={!props.isReady}
                    onChange={event =>
                      updateField(
                        template === 'music' ? 'author' : 'description',
                        event.target.value
                      )
                    }
                  />
                </label>
              </>
            )}
          </div>
        )}

        {activePanel === 'composition' && (
          <div className="legacy-controls studio-form-stack">
            <CanvasControls showCardPosition={!isPageMode} />
            {isPageMode ? (
              <PageFrameControls />
            ) : (
              <>
                <CardTabs />
                <PhotoTabs />
              </>
            )}
          </div>
        )}

        {activePanel === 'appearance' && (
          <div className="legacy-controls studio-form-stack">
            <PresetLibrary />
            <div className="panel-divider" />
            <ColorTabs />
            <div className="panel-divider" />
            <BackgroundTabs />
            {!isPageMode && (
              <>
                <div className="panel-divider" />
                <TypographyTabs />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
