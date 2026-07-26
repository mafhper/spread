import * as React from 'react'
import { RotateCcw } from 'lucide-react'

import { useCardStore } from '../../../store/cardStore'

const focusPositions = [
  { value: 'object-left-top', label: 'Superior esquerdo' },
  { value: 'object-top', label: 'Superior central' },
  { value: 'object-right-top', label: 'Superior direito' },
  { value: 'object-left', label: 'Centro esquerdo' },
  { value: 'object-center', label: 'Centro' },
  { value: 'object-right', label: 'Centro direito' },
  { value: 'object-left-bottom', label: 'Inferior esquerdo' },
  { value: 'object-bottom', label: 'Inferior central' },
  { value: 'object-right-bottom', label: 'Inferior direito' },
] as const

export const PhotoTabs: React.FC = () => {
  const { layout, updateNestedField, setFullState, resetPhoto } = useCardStore()
  const updateLayout = (field: string, value: unknown): void =>
    updateNestedField('layout', field, value)

  const setFocus = (imagePosition: string) => {
    setFullState({
      layout: {
        ...layout,
        imagePosition,
        imageOffsetX: 0,
        imageOffsetY: 0,
      },
    })
  }

  return (
    <div className="photo-controls">
      <div className="panel-section-heading">
        <div>
          <h3>Enquadramento</h3>
          <p>Redimensione a imagem e escolha o ponto que deve receber foco.</p>
        </div>
      </div>

      <label className="studio-field">
        <span>Formato da área</span>
        <select
          value={layout.aspectRatio}
          onChange={event => updateLayout('aspectRatio', event.target.value)}
        >
          <option value="aspect-video">16:9 · Paisagem</option>
          <option value="aspect-square">1:1 · Quadrado</option>
          <option value="aspect-[4/3]">4:3 · Clássico</option>
          <option value="aspect-[9/16]">9:16 · Story</option>
          <option value="aspect-[4/5]">4:5 · Retrato</option>
          <option value="aspect-auto">Original · Sem recorte</option>
        </select>
      </label>

      <fieldset className="photo-option-group">
        <legend>Ajuste à área</legend>
        <div className="photo-fit-grid" role="group" aria-label="Ajuste à área">
          <button
            type="button"
            aria-pressed={layout.imageFit === 'cover'}
            onClick={() => updateLayout('imageFit', 'cover')}
          >
            Preencher
            <small>Pode recortar as bordas</small>
          </button>
          <button
            type="button"
            aria-pressed={layout.imageFit === 'contain'}
            onClick={() => updateLayout('imageFit', 'contain')}
          >
            Mostrar inteira
            <small>Preserva toda a imagem</small>
          </button>
        </div>
      </fieldset>

      <div className="photo-slider-control">
        <div className="photo-control-heading">
          <label htmlFor="photo-zoom-slider">Tamanho da imagem</label>
          <span>{Math.round(layout.imageScale * 100)}%</span>
          <button
            type="button"
            onClick={() => updateLayout('imageScale', 1)}
            aria-label="Restaurar tamanho da imagem"
            title="Restaurar tamanho"
          >
            <RotateCcw size={13} />
          </button>
        </div>
        <input
          id="photo-zoom-slider"
          type="range"
          min="0.5"
          max="2.5"
          step="0.05"
          value={layout.imageScale}
          onChange={event =>
            updateLayout('imageScale', Number(event.target.value))
          }
        />
      </div>

      <fieldset className="photo-option-group">
        <legend>Ponto de foco</legend>
        <div
          className="image-focus-grid"
          role="group"
          aria-label="Ponto de foco da imagem"
        >
          {focusPositions.map(position => (
            <button
              key={position.value}
              type="button"
              aria-label={position.label}
              aria-pressed={layout.imagePosition === position.value}
              title={position.label}
              onClick={() => setFocus(position.value)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className="photo-help">
          Escolha onde manter o assunto principal quando houver recorte.
        </p>
      </fieldset>

      <div className="photo-offset-grid">
        <div className="photo-slider-control">
          <div className="photo-control-heading">
            <label htmlFor="photo-offset-x">Mover na horizontal</label>
            <span>{layout.imageOffsetX}px</span>
          </div>
          <input
            id="photo-offset-x"
            type="range"
            min="-400"
            max="400"
            step="1"
            value={layout.imageOffsetX}
            onChange={event =>
              updateLayout('imageOffsetX', Number(event.target.value))
            }
          />
        </div>
        <div className="photo-slider-control">
          <div className="photo-control-heading">
            <label htmlFor="photo-offset-y">Mover na vertical</label>
            <span>{layout.imageOffsetY}px</span>
          </div>
          <input
            id="photo-offset-y"
            type="range"
            min="-400"
            max="400"
            step="1"
            value={layout.imageOffsetY}
            onChange={event =>
              updateLayout('imageOffsetY', Number(event.target.value))
            }
          />
        </div>
      </div>

      <button type="button" className="photo-reset-button" onClick={resetPhoto}>
        <RotateCcw size={14} aria-hidden="true" />
        Restaurar enquadramento
      </button>
    </div>
  )
}
