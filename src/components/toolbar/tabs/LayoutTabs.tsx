import React from 'react'
import { Layout, ChevronDown } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'

export const LayoutTabs: React.FC = () => {
  const { layout, updateLayout } = useCardStore()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <details
      className="group"
      open={isOpen}
      onToggle={e => setIsOpen(e.currentTarget.open)}
    >
      <summary className="flex items-center justify-between font-medium text-sm text-[var(--text-muted)] uppercase tracking-wider mb-3 group-hover:text-[var(--text-main)] transition-colors cursor-pointer list-none">
        <span className="flex items-center gap-2">
          <Layout size={16} /> Layout do Card
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </summary>

      <div className="space-y-6 pl-1 pt-2">
        {/* 1. Proporções do Card */}
        <div className="space-y-4 pt-2">
          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
            1. Proporções do Card
          </h4>

          {/* Card Aspect Ratio */}
          <fieldset>
            <legend className="block text-xs font-medium mb-1.5 text-[var(--text-muted)]">
              Formato do Card
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Auto', value: 'aspect-auto' },
                { label: '1:1 Quadrado', value: 'aspect-square' },
                { label: '16:9 Vídeo', value: 'aspect-video' },
                { label: '4:3 Clássico', value: 'aspect-[4/3]' },
              ].map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => updateLayout('cardAspectRatio', preset.value)}
                  className={`px-2 py-1.5 rounded text-[10px] font-medium border transition-colors ${
                    layout.cardAspectRatio === preset.value
                      ? 'bg-[var(--accent-primary)] text-white border-transparent'
                      : 'bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Card Scale */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="card-scale"
                className="text-xs font-medium text-[var(--text-muted)]"
              >
                Tamanho do Card (Escala)
              </label>
              <span className="text-xs text-[var(--accent-primary)] font-mono">
                {Math.round(layout.cardScale * 100)}%
              </span>
            </div>
            <input
              id="card-scale"
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={layout.cardScale}
              onChange={e =>
                updateLayout('cardScale', parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>

        {/* 2. Estilo e Transparência */}
        <div className="space-y-4 pt-2 border-t border-white/5">
          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
            2. Estilo e Transparência
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Opacity */}
            <div>
              <label
                htmlFor="layout-opacity"
                className="block text-[10px] text-[var(--text-muted)] mb-1"
              >
                Opacidade ({Math.round(layout.opacity * 100)}%)
              </label>
              <input
                id="layout-opacity"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={layout.opacity}
                onChange={e =>
                  updateLayout('opacity', parseFloat(e.target.value))
                }
                className="w-full"
              />
            </div>
            {/* Backdrop Blur */}
            <div>
              <label
                htmlFor="layout-blur"
                className="block text-[10px] text-[var(--text-muted)] mb-1"
              >
                Blur (Vidro)
              </label>
              <input
                id="layout-blur"
                type="range"
                min="0"
                max="24"
                step="1"
                value={layout.backdropBlur ?? 12}
                onChange={e =>
                  updateLayout('backdropBlur', parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Inner Radius */}
            <div>
              <label
                htmlFor="layout-radius"
                className="block text-[10px] text-[var(--text-muted)] mb-1"
              >
                Arredondamento
              </label>
              <input
                id="layout-radius"
                type="range"
                min="0"
                max="32"
                step="2"
                value={layout.innerRadius}
                onChange={e =>
                  updateLayout('innerRadius', parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>
            {/* Padding */}
            <div>
              <label
                htmlFor="layout-padding"
                className="block text-[10px] text-[var(--text-muted)] mb-1"
              >
                Margem Interna
              </label>
              <input
                id="layout-padding"
                type="range"
                min="0"
                max="12"
                step="1"
                value={layout.padding}
                onChange={e =>
                  updateLayout('padding', parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* 3. Shadow & Depth */}
        <div className="space-y-4 pt-2 border-t border-white/5">
          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
            3. Sombra e Profundidade
          </h4>

          <div className="flex gap-3">
            <div className="flex-1">
              <label
                htmlFor="shadow-color"
                className="block text-[10px] text-white/40 mb-1"
              >
                Sombra
              </label>
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1.5 border border-white/10">
                <input
                  id="shadow-color"
                  type="color"
                  value={layout.shadowColor ?? '#000000'}
                  onChange={e => updateLayout('shadowColor', e.target.value)}
                  className="w-5 h-5 rounded bg-transparent border-none p-0 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-white/60 uppercase">
                  {layout.shadowColor ?? '#000000'}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <label
                htmlFor="shadow-opacity"
                className="block text-[10px] text-white/40 mb-1"
              >
                Opacidade Semente
              </label>
              <input
                id="shadow-opacity"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={layout.shadowOpacity ?? 0.25}
                onChange={e =>
                  updateLayout('shadowOpacity', parseFloat(e.target.value))
                }
                className="w-full accent-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="shadow-offset-y"
                className="block text-[10px] text-white/40 mb-1"
              >
                Posição Y
              </label>
              <input
                id="shadow-offset-y"
                type="range"
                min="-50"
                max="50"
                value={layout.shadowOffsetY ?? 25}
                onChange={e =>
                  updateLayout('shadowOffsetY', parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>
            <div>
              <label
                htmlFor="shadow-blur"
                className="block text-[10px] text-white/40 mb-1"
              >
                Difusão (Blur)
              </label>
              <input
                id="shadow-blur"
                type="range"
                min="0"
                max="100"
                value={layout.shadowBlur ?? 50}
                onChange={e =>
                  updateLayout('shadowBlur', parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* 4. Enquadramento da Imagem */}
        <div className="space-y-4 pt-2 border-t border-white/5">
          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
            4. Foto do Link
          </h4>

          {/* Image Aspect Ratio */}
          <div>
            <label
              htmlFor="image-aspect-ratio"
              className="block text-xs font-medium mb-1.5 text-[var(--text-muted)]"
            >
              Formato da Área da Foto
            </label>
            <select
              id="image-aspect-ratio"
              value={layout.aspectRatio}
              onChange={e => updateLayout('aspectRatio', e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            >
              <option value="aspect-video">16:9 (Padrão)</option>
              <option value="aspect-square">1:1 (Quadrado)</option>
              <option value="aspect-[4/3]">4:3 (Clássico)</option>
              <option value="aspect-[9/16]">9:16 (Stories)</option>
              <option value="aspect-[4/5]">4:5 (Portrait)</option>
            </select>
          </div>

          {/* Image Scale */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="image-scale"
                className="text-xs font-medium text-[var(--text-muted)]"
              >
                Zoom da Foto
              </label>
              <span className="text-xs text-[var(--accent-primary)] font-mono">
                {Math.round(layout.imageScale * 100)}%
              </span>
            </div>
            <input
              id="image-scale"
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={layout.imageScale}
              onChange={e =>
                updateLayout('imageScale', parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>

          {/* Image Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="image-offset-x"
                  className="text-[10px] font-medium text-[var(--text-muted)]"
                >
                  Ajuste X
                </label>
                <span className="text-[10px] text-[var(--accent-primary)] font-mono">
                  {layout.imageOffsetX}px
                </span>
              </div>
              <input
                id="image-offset-x"
                type="range"
                min="-400"
                max="400"
                step="1"
                value={layout.imageOffsetX}
                onChange={e =>
                  updateLayout('imageOffsetX', parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="image-offset-y"
                  className="text-[10px] font-medium text-[var(--text-muted)]"
                >
                  Ajuste Y
                </label>
                <span className="text-[10px] text-[var(--accent-primary)] font-mono">
                  {layout.imageOffsetY}px
                </span>
              </div>
              <input
                id="image-offset-y"
                type="range"
                min="-400"
                max="400"
                step="1"
                value={layout.imageOffsetY}
                onChange={e =>
                  updateLayout('imageOffsetY', parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </details>
  )
}
