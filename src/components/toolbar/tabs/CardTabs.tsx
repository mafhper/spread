import React from 'react'
import { RotateCcw } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'

export const CardTabs: React.FC = () => {
  const { layout, updateNestedField, resetCard } = useCardStore()
  const updateLayout = (field: string, val: unknown) =>
    updateNestedField('layout', field, val)

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Proporções do Card
        </h4>

        {/* Card Scale */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="card-scale"
              className="text-xs font-medium text-[var(--text-muted)]"
            >
              Tamanho do Card (Escala)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white font-mono">
                {Math.round(layout.cardScale * 100)}%
              </span>
              <button
                onClick={() => updateLayout('cardScale', 1)}
                className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                title="Resetar Escala"
              >
                <RotateCcw size={10} />
              </button>
            </div>
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
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Branding do Card
        </h4>

        <div className="flex items-center justify-between">
          <label
            htmlFor="show-header-toggle"
            className="text-xs font-medium text-[var(--text-muted)]"
          >
            Exibir Logo/Título
          </label>
          <button
            id="show-header-toggle"
            onClick={() => updateLayout('showHeader', !layout.showHeader)}
            className={`w-10 h-5 rounded-full transition-colors relative ${layout.showHeader ? 'bg-white' : 'bg-white/10'}`}
          >
            <div
              className={`absolute top-1 w-3 h-3 rounded-full transition-all ${layout.showHeader ? 'left-6 bg-black' : 'left-1 bg-white/40'}`}
            />
          </button>
        </div>

        {layout.showHeader && (
          <div>
            <label
              htmlFor="header-position"
              className="block text-[10px] text-[var(--text-muted)] mb-1.5 uppercase tracking-wider"
            >
              Posição do Header
            </label>
            <div id="header-position" className="grid grid-cols-2 gap-2">
              {[
                { label: 'Esquerda', value: 'left' },
                { label: 'Direita', value: 'right' },
              ].map(pos => (
                <button
                  key={pos.value}
                  onClick={() => updateLayout('headerPosition', pos.value)}
                  className={`px-2 py-1.5 rounded text-[10px] font-medium border transition-colors ${
                    layout.headerPosition === pos.value
                      ? 'bg-white text-black border-transparent'
                      : 'bg-white/5 text-[var(--text-muted)] border-white/10 hover:border-white/30'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Estilo e Transparência
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="card-opacity"
                className="block text-[10px] text-[var(--text-muted)]"
              >
                Opacidade
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-white/40">
                  {Math.round(layout.opacity * 100)}%
                </span>
                <button
                  onClick={() => updateLayout('opacity', 1)}
                  className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                  title="Resetar Opacidade"
                >
                  <RotateCcw size={8} />
                </button>
              </div>
            </div>
            <input
              id="card-opacity"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={layout.opacity}
              onChange={e =>
                updateLayout('opacity', parseFloat(e.target.value))
              }
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="card-roundness"
                className="block text-[10px] text-[var(--text-muted)]"
              >
                Arredondamento
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-white/40">
                  {layout.innerRadius}px
                </span>
                <button
                  onClick={() => updateLayout('innerRadius', 24)}
                  className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                  title="Resetar"
                >
                  <RotateCcw size={8} />
                </button>
              </div>
            </div>
            <input
              id="card-roundness"
              type="range"
              min="0"
              max="32"
              step="2"
              value={layout.innerRadius}
              onChange={e =>
                updateLayout('innerRadius', parseInt(e.target.value))
              }
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="card-padding"
                className="block text-[10px] text-[var(--text-muted)]"
              >
                Margem Interna
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-white/40">
                  {layout.padding}
                </span>
                <button
                  onClick={() => updateLayout('padding', 6)}
                  className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                  title="Resetar"
                >
                  <RotateCcw size={8} />
                </button>
              </div>
            </div>
            <input
              id="card-padding"
              type="range"
              min="0"
              max="12"
              step="1"
              value={layout.padding}
              onChange={e => updateLayout('padding', parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Sombra e Profundidade
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
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="shadow-opacity"
                className="block text-[10px] text-white/40"
              >
                Opacidade
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-white/40">
                  {Math.round((layout.shadowOpacity ?? 0.25) * 100)}%
                </span>
                <button
                  onClick={() => updateLayout('shadowOpacity', 0.25)}
                  className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                  title="Resetar"
                >
                  <RotateCcw size={8} />
                </button>
              </div>
            </div>
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
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="shadow-x"
                className="block text-[10px] text-white/40"
              >
                Posição X
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-white/40">
                  {layout.shadowOffsetX ?? 0}px
                </span>
                <button
                  onClick={() => updateLayout('shadowOffsetX', 0)}
                  className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                  title="Resetar X"
                >
                  <RotateCcw size={8} />
                </button>
              </div>
            </div>
            <input
              id="shadow-x"
              type="range"
              min="-50"
              max="50"
              value={layout.shadowOffsetX ?? 0}
              onChange={e =>
                updateLayout('shadowOffsetX', parseInt(e.target.value))
              }
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="shadow-y"
                className="block text-[10px] text-white/40"
              >
                Posição Y
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-white/40">
                  {layout.shadowOffsetY ?? 25}px
                </span>
                <button
                  onClick={() => updateLayout('shadowOffsetY', 25)}
                  className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                  title="Resetar Y"
                >
                  <RotateCcw size={8} />
                </button>
              </div>
            </div>
            <input
              id="shadow-y"
              type="range"
              min="-50"
              max="50"
              value={layout.shadowOffsetY ?? 25}
              onChange={e =>
                updateLayout('shadowOffsetY', parseInt(e.target.value))
              }
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="shadow-blur"
                className="block text-[10px] text-white/40"
              >
                Difusão (Blur)
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-white/40">
                  {layout.shadowBlur ?? 50}px
                </span>
                <button
                  onClick={() => updateLayout('shadowBlur', 50)}
                  className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                  title="Resetar"
                >
                  <RotateCcw size={8} />
                </button>
              </div>
            </div>
            <input
              id="shadow-blur"
              type="range"
              min="0"
              max="100"
              value={layout.shadowBlur ?? 50}
              onChange={e =>
                updateLayout('shadowBlur', parseInt(e.target.value))
              }
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
          <div>{/* Empty spacing if needed or another control */}</div>
        </div>
      </div>
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={resetCard}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl text-xs font-semibold text-white/50 hover:text-red-400 transition-all group"
        >
          <RotateCcw
            size={14}
            className="group-hover:rotate-[-45deg] transition-transform"
          />
          Resetar Categoria (Layout)
        </button>
      </div>
    </div>
  )
}
