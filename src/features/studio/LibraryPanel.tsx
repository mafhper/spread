import React, { useState } from 'react'
import { ArrowRight, Link2, Loader2 } from 'lucide-react'

import { ColorTabs } from '../../components/toolbar/tabs/ColorTabs'
import { BackgroundTabs } from '../../components/toolbar/tabs/BackgroundTabs'
import { useCardStore } from '../../store/cardStore'
import { PresetLibrary } from './PresetLibrary'

export type LibraryPanelId = 'content' | 'presets' | 'backgrounds'

export interface LibraryPanelProps {
  inputUrl: string
  setInputUrl: (value: string) => void
  onLoad: () => void
  loadState: 'idle' | 'metadata' | 'assets' | 'ready' | 'error'
  errorMessage: string
}

const tabs: Array<{ id: LibraryPanelId; label: string }> = [
  { id: 'content', label: 'Conteúdo' },
  { id: 'presets', label: 'Presets' },
  { id: 'backgrounds', label: 'Fundos' },
]

export const LibraryPanel: React.FC<LibraryPanelProps> = ({
  inputUrl,
  setInputUrl,
  onLoad,
  loadState,
  errorMessage,
}) => {
  const [activePanel, setActivePanel] = useState<LibraryPanelId>('content')
  const { title, description, author, template, updateField } = useCardStore()
  const isLoading = loadState === 'metadata' || loadState === 'assets'

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
            <p className="load-status" aria-live="polite">
              {loadState === 'metadata' && 'Lendo metadados…'}
              {loadState === 'assets' && 'Preparando imagens…'}
              {loadState === 'ready' && 'Conteúdo atualizado.'}
              {loadState === 'error' && errorMessage}
            </p>

            <label className="studio-field">
              <span>Título</span>
              <textarea
                rows={3}
                value={title}
                onChange={event => updateField('title', event.target.value)}
              />
            </label>
            <label className="studio-field">
              <span>{template === 'music' ? 'Artista' : 'Descrição'}</span>
              <textarea
                rows={4}
                value={template === 'music' ? author : description}
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
