import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, Link2, Play } from 'lucide-react'

import {
  CompositionArtboard,
  type CompositionArtboardState,
} from '../composition/CompositionArtboard'
import { setPendingUrl } from '../../utils/persistence'
import { studioRepository } from './repository'

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const playlistId = 'PLJyBe8KsD3JfDLw9hJhwGl2XDpcgEowGk'

const playlistExamples = [
  {
    id: '02oUVpfOGoU',
    title: 'Psiu',
    artist: 'Liniker',
    colors: { bg1: '#241432', bg2: '#b3547a', text: '#fff8f2' },
    gradientStyle: '135deg',
  },
  {
    id: 'FngDSOuCNAA',
    title: 'Cold Little Heart',
    artist: 'Michael Kiwanuka',
    colors: { bg1: '#17252b', bg2: '#a4663c', text: '#fff8ed' },
    gradientStyle: '150deg',
  },
  {
    id: 'CoJ23XNHgG0',
    title: 'Banho de folhas',
    artist: 'Luedji Luna',
    colors: { bg1: '#102b25', bg2: '#a37b45', text: '#f7f4e9' },
    gradientStyle: '125deg',
  },
] as const

type PlaylistExample = (typeof playlistExamples)[number]

function getExampleUrl(example: PlaylistExample) {
  return `https://www.youtube.com/watch?v=${example.id}&list=${playlistId}`
}

function getExampleState(
  example: PlaylistExample,
  measuredCardHeight: number
): CompositionArtboardState {
  return {
    title: example.title,
    description: 'Seleção da playlist Mp3.',
    author: example.artist,
    image: `https://i.ytimg.com/vi/${example.id}/hqdefault.jpg`,
    favicon: null,
    domain: 'music.youtube.com',
    template: 'music' as const,
    isWelcomeState: false,
    colors: example.colors,
    gradientStyle: example.gradientStyle,
    pattern: 'dots' as const,
    patternOpacity: 0.1,
    patternScale: 1,
    customBgImage: null,
    canvasSize: {
      width: 1200,
      height: 630,
      preset: 'auto',
      roundness: 20,
    },
    cardPosition: { x: 0, y: 0 },
    fontFamily: 'Inter',
    titleSize: 112,
    subtitleSize: 100,
    textAlign: 'left' as const,
    exportScale: 1,
    layout: {
      aspectRatio: 'aspect-video',
      imagePosition: 'object-center',
      imageFit: 'cover' as const,
      imageScale: 1,
      imageOffsetX: 0,
      imageOffsetY: 0,
      outerRadius: 0,
      innerRadius: 24,
      padding: 64,
      paddingAuto: false,
      opacity: 0.82,
      shadowOffsetX: 0,
      shadowOffsetY: 18,
      shadowBlur: 42,
      shadowSpread: -12,
      shadowColor: '#000000',
      shadowOpacity: 0.28,
      backdropBlur: 0,
      cardScale: 1,
      cardAuto: false,
      cardAspectRatio: 'aspect-auto',
      showHeader: true,
      headerMode: 'both' as const,
      headerPosition: 'right' as const,
      measuredCardHeight,
    },
  }
}

export const LandingApp: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('')
  const [hasDraft, setHasDraft] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [selectedExampleId, setSelectedExampleId] = useState<string>(
    playlistExamples[0].id
  )
  const [measuredCardHeight, setMeasuredCardHeight] = useState(590)
  const cardRef = useRef<HTMLDivElement>(null)
  const selectedExample =
    playlistExamples.find(example => example.id === selectedExampleId) ||
    playlistExamples[0]
  const previewState = getExampleState(selectedExample, measuredCardHeight)

  useEffect(() => {
    setIsInteractive(true)
    studioRepository
      .loadDraft()
      .then(draft => setHasDraft(Boolean(draft)))
      .catch(() => setHasDraft(false))
  }, [])

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const updateMeasuredHeight = () => {
      const height = Math.ceil(card.offsetHeight)
      if (height > 0) {
        setMeasuredCardHeight(current =>
          current === height ? current : height
        )
      }
    }
    const observer = new ResizeObserver(updateMeasuredHeight)
    observer.observe(card)
    updateMeasuredHeight()
    return () => observer.disconnect()
  }, [selectedExampleId])

  const selectExample = (example: PlaylistExample) => {
    setSelectedExampleId(example.id)
  }

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

          <div className="landing-examples">
            <p>Exemplos da sua playlist</p>
            <div className="landing-example-list">
              {playlistExamples.map(example => (
                <button
                  key={example.id}
                  type="button"
                  disabled={!isInteractive}
                  aria-pressed={selectedExample.id === example.id}
                  onClick={() => selectExample(example)}
                >
                  <span>{example.title}</span>
                  <small>{example.artist}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="landing-quick-actions">
            <button
              disabled={!isInteractive}
              onClick={() => openEditor(getExampleUrl(selectedExample))}
            >
              <Play size={15} aria-hidden="true" /> Editar este exemplo
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
            <span aria-live="polite">{selectedExample.artist}</span>
            <span>
              {playlistExamples.indexOf(selectedExample) + 1}/
              {playlistExamples.length}
            </span>
          </div>
          <div className="landing-proof-stage">
            <div className="landing-proof-scale">
              <CompositionArtboard
                canvasWidth={1080}
                canvasHeight={1080}
                autoScale={1}
                cardRef={cardRef}
                cardPadding={64}
                state={previewState}
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
