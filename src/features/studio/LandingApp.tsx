import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, Link2, Play } from 'lucide-react'

import { CompositionArtboard } from '../composition/CompositionArtboard'
import { useCardStore } from '../../store/cardStore'
import { setPendingUrl } from '../../utils/persistence'
import { resolvePublicAsset } from '../../utils/resolvePublicAsset'
import { studioRepository } from './repository'

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const exampleUrl = 'https://github.com/mafhper/spread'

export const LandingApp: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('')
  const [hasDraft, setHasDraft] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const { setFullState } = useCardStore()

  useEffect(() => {
    setFullState({
      title: 'Spread — composição visual para links',
      description: 'Preview e exportação compartilham o mesmo renderer.',
      author: 'Spread',
      image: resolvePublicAsset('assets/social-preview.png'),
      favicon: null,
      domain: 'spread.app',
      isWelcomeState: false,
    })
    studioRepository
      .loadDraft()
      .then(draft => setHasDraft(Boolean(draft)))
      .catch(() => setHasDraft(false))
  }, [setFullState])

  const openEditor = (url?: string) => {
    const value = url?.trim()
    if (value) setPendingUrl(value)
    window.location.assign(`${base}/editor/`)
  }

  return (
    <main className="landing-studio">
      <header className="landing-nav">
        <a className="studio-brand" href={`${base}/`} aria-label="Spread">
          <span className="studio-brand-mark" aria-hidden="true">
            S
          </span>
          <span>Spread</span>
        </a>
        <div className="landing-nav-actions">
          <a className="landing-about-link" href={`${base}/info/`}>
            Sobre
          </a>
          <a className="button-secondary" href={`${base}/editor/`}>
            Abrir editor
          </a>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <p className="eyebrow">Composição visual para links</p>
          <h1 id="landing-title">Cole um link. Ajuste o visual. Exporte.</h1>
          <p className="landing-lede">
            Transforme qualquer página, música ou notícia em um card pronto para
            compartilhar — com controle real sobre canvas, imagem e tipografia.
          </p>

          <form
            className="landing-url-form"
            onSubmit={event => {
              event.preventDefault()
              openEditor(inputUrl)
            }}
          >
            <Link2 size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="landing-url">
              URL do link
            </label>
            <input
              id="landing-url"
              type="url"
              value={inputUrl}
              onChange={event => setInputUrl(event.target.value)}
              placeholder="https://exemplo.com/conteudo"
            />
            <button type="submit" disabled={!inputUrl.trim()}>
              Criar card <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          <div className="landing-quick-actions">
            <button onClick={() => openEditor(exampleUrl)}>
              <Play size={15} aria-hidden="true" /> Usar exemplo
            </button>
            {hasDraft && (
              <button onClick={() => openEditor()}>Continuar edição</button>
            )}
          </div>
        </div>

        <div
          className="landing-proof"
          aria-label="Exemplo real do renderer Spread"
        >
          <div className="landing-proof-toolbar">
            <span>Preview</span>
            <span>Auto</span>
          </div>
          <div className="landing-proof-stage">
            <div className="landing-proof-scale">
              <CompositionArtboard
                canvasWidth={1080}
                canvasHeight={1080}
                autoScale={1}
                cardRef={cardRef}
                cardPadding={64}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="landing-capabilities"
        aria-label="Recursos principais"
      >
        <article>
          <span>01</span>
          <h2>Conteúdo automático</h2>
          <p>Metadados, imagem e contexto carregados a partir da URL.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Composição precisa</h2>
          <p>
            Canvas e card compartilham a mesma geometria no preview e no PNG.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>Estilos reutilizáveis</h2>
          <p>Presets salvam a direção visual sem sobrescrever seu conteúdo.</p>
        </article>
      </section>
    </main>
  )
}
