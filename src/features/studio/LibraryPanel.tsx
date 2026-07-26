import React, { useState } from 'react'
import {
  ArrowRight,
  Image as ImageIcon,
  Link2,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react'

import { ColorTabs } from '../../components/toolbar/tabs/ColorTabs'
import { BackgroundTabs } from '../../components/toolbar/tabs/BackgroundTabs'
import { useCardStore } from '../../store/cardStore'
import {
  PAGE_CAPTURE_VIEWPORTS,
  type LinkMediaSource,
  type PageCaptureArea,
  type PageCaptureViewport,
} from '../../types/capture'
import { PresetLibrary } from './PresetLibrary'

export type LibraryPanelId = 'content' | 'presets' | 'backgrounds'

export interface LibraryPanelProps {
  inputUrl: string
  setInputUrl: (value: string) => void
  onLoad: () => void
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

const tabs: Array<{ id: LibraryPanelId; label: string }> = [
  { id: 'content', label: 'Conteúdo' },
  { id: 'presets', label: 'Presets' },
  { id: 'backgrounds', label: 'Fundos' },
]

const captureViewports: Array<{
  id: PageCaptureViewport
  Icon: React.ComponentType<{ size?: number }>
  label: string
  width: number
  height: number
}> = [
  { id: 'desktop', Icon: Monitor, ...PAGE_CAPTURE_VIEWPORTS.desktop },
  { id: 'tablet', Icon: Tablet, ...PAGE_CAPTURE_VIEWPORTS.tablet },
  { id: 'mobile', Icon: Smartphone, ...PAGE_CAPTURE_VIEWPORTS.mobile },
]

export const LibraryPanel: React.FC<LibraryPanelProps> = ({
  inputUrl,
  setInputUrl,
  onLoad,
  isReady,
  loadState,
  errorMessage,
  mediaSource,
  captureViewport,
  captureArea,
  onCaptureSettingChange,
}) => {
  const [activePanel, setActivePanel] = useState<LibraryPanelId>('content')
  const { title, description, author, template, updateField } = useCardStore()
  const isLoading =
    !isReady ||
    loadState === 'metadata' ||
    loadState === 'page' ||
    loadState === 'assets'

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-title">
        <span>Biblioteca</span>
        <small>Fonte e direção visual</small>
      </div>
      <div className="studio-segmented" role="tablist" aria-label="Biblioteca">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activePanel === tab.id}
            onClick={() => setActivePanel(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="studio-panel-scroll">
        {activePanel === 'content' && (
          <div className="studio-form-stack">
            <div className="panel-section-heading">
              <div>
                <h2>Link de origem</h2>
                <p>Atualize o conteúdo sem perder o estilo atual.</p>
              </div>
            </div>
            <form
              className="studio-url-form"
              onSubmit={event => {
                event.preventDefault()
                onLoad()
              }}
            >
              <Link2 size={16} aria-hidden="true" />
              <label className="sr-only" htmlFor="studio-source-url">
                URL do link
              </label>
              <input
                id="studio-source-url"
                type="url"
                value={inputUrl}
                disabled={!isReady}
                onChange={event => setInputUrl(event.target.value)}
                placeholder="Cole uma URL"
              />
              <button
                type="submit"
                disabled={!inputUrl.trim() || isLoading}
                aria-label="Carregar link"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
              </button>
            </form>
            <p
              className="load-status"
              data-state={loadState}
              aria-live="polite"
            >
              {!isReady && 'Preparando editor…'}
              {loadState === 'metadata' && 'Lendo metadados…'}
              {loadState === 'page' &&
                'Abrindo a página e aguardando o conteúdo…'}
              {loadState === 'assets' && 'Preparando imagens…'}
              {loadState === 'ready' && 'Conteúdo atualizado.'}
              {loadState === 'error' && errorMessage}
            </p>

            <div className="capture-source-section">
              <div className="panel-section-heading">
                <div>
                  <h3>Visual do link</h3>
                  <p>Escolha entre a capa publicada e a página renderizada.</p>
                </div>
              </div>
              <div
                className="capture-source-grid"
                role="group"
                aria-label="Visual do link"
              >
                <button
                  type="button"
                  aria-label="Usar capa do link"
                  aria-pressed={mediaSource === 'metadata'}
                  disabled={isLoading}
                  onClick={() =>
                    onCaptureSettingChange('mediaSource', 'metadata')
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
                  aria-label="Usar captura da página"
                  aria-pressed={mediaSource === 'page'}
                  disabled={isLoading}
                  onClick={() => onCaptureSettingChange('mediaSource', 'page')}
                >
                  <Monitor size={16} aria-hidden="true" />
                  <span>
                    <strong>Página</strong>
                    <small>Captura depois do carregamento</small>
                  </span>
                </button>
              </div>

              {mediaSource === 'page' && (
                <div className="capture-options">
                  <fieldset>
                    <legend>Dispositivo</legend>
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
                            aria-label={`Capturar como ${label}`}
                            aria-pressed={captureViewport === id}
                            disabled={isLoading}
                            onClick={() =>
                              onCaptureSettingChange('captureViewport', id)
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
                      value={captureArea}
                      disabled={isLoading}
                      onChange={event =>
                        onCaptureSettingChange(
                          'captureArea',
                          event.target.value as PageCaptureArea
                        )
                      }
                    >
                      <option value="viewport">Tela visível</option>
                      <option value="main">Conteúdo principal</option>
                      <option value="fullPage">Página inteira</option>
                    </select>
                    <small>
                      {captureArea === 'viewport' &&
                        'Usa somente o que cabe no dispositivo escolhido.'}
                      {captureArea === 'main' &&
                        'Recorta a área principal indicada pelo próprio site.'}
                      {captureArea === 'fullPage' &&
                        'Inclui todo o conteúdo ao longo da rolagem.'}
                    </small>
                  </label>

                  <p className="capture-loading-note">
                    O Spread aguarda a atividade de rede terminar antes de
                    fotografar a página.
                  </p>
                </div>
              )}
            </div>

            <label className="studio-field">
              <span>Título</span>
              <textarea
                rows={3}
                value={title}
                disabled={!isReady}
                onChange={event => updateField('title', event.target.value)}
              />
            </label>
            <label className="studio-field">
              <span>{template === 'music' ? 'Artista' : 'Descrição'}</span>
              <textarea
                rows={4}
                value={template === 'music' ? author : description}
                disabled={!isReady}
                onChange={event =>
                  updateField(
                    template === 'music' ? 'author' : 'description',
                    event.target.value
                  )
                }
              />
            </label>
          </div>
        )}
        {activePanel === 'presets' && <PresetLibrary />}
        {activePanel === 'backgrounds' && (
          <div className="legacy-controls studio-form-stack">
            <ColorTabs />
            <div className="panel-divider" />
            <BackgroundTabs />
          </div>
        )}
      </div>
    </div>
  )
}
