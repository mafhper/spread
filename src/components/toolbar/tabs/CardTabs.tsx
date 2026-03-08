import React from 'react'
import { RotateCcw } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import { ResponsiveSectionDeck } from './ResponsiveSectionDeck'

export const CardTabs: React.FC = () => {
  const { layout, updateNestedField } = useCardStore()
  const updateLayout = (field: string, val: unknown) =>
    updateNestedField('layout', field, val)
  const brandingSummary = layout.showHeader
    ? `Header visível · ${layout.headerPosition === 'left' ? 'Esquerda' : 'Direita'}`
    : 'Header oculto'

  return (
    <ResponsiveSectionDeck
      sections={[
        {
          id: 'ratio',
          title: 'Proporções do Card',
          summary: `Escala ${Math.round(layout.cardScale * 100)}% · ${layout.cardAuto ? 'Auto' : 'Manual'}`,
          defaultMobile: true,
          content: (
            <div className="space-y-4">
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Padding Auto
                  </span>
                  <input
                    type="checkbox"
                    checked={layout.paddingAuto}
                    onChange={e =>
                      updateLayout('paddingAuto', e.target.checked)
                    }
                    className="w-5 h-3 rounded-full bg-white/20"
                    title="Auto padding entre card e canvas"
                  />
                </div>
                {!layout.paddingAuto && (
                  <div>
                    <span className="text-xs mr-2">Padding (px)</span>
                    <input
                      type="range"
                      min={0}
                      max={80}
                      step={1}
                      value={layout.padding}
                      onChange={e =>
                        updateLayout('padding', parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                )}
              </div>
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
                      className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Resetar Escala"
                      aria-label="Resetar escala do card"
                    >
                      <RotateCcw size={12} />
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

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Auto Tamanho do Card
                  </span>
                  <button
                    onClick={() => updateLayout('cardAuto', !layout.cardAuto)}
                    className={`w-12 h-7 rounded-full transition-colors relative flex items-center min-w-[44px] min-h-[28px] ${layout.cardAuto ? 'bg-white' : 'bg-white/10'}`}
                    title={layout.cardAuto ? 'Desativar Auto' : 'Ativar Auto'}
                    aria-label={
                      layout.cardAuto
                        ? 'Desativar redimensionamento automático'
                        : 'Ativar redimensionamento automático'
                    }
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full transition-all shadow-sm ${layout.cardAuto ? 'left-6 bg-black' : 'left-1 bg-white/40'}`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-white/60">
                  Quando ativo, o card ajusta seu tamanho automaticamente com
                  base no canvas e no padding. Pode ser fine-tuned pela
                  porcentagem acima quando necessário.
                </p>
              </div>
            </div>
          ),
        },
        {
          id: 'branding',
          title: 'Branding do Card',
          summary: brandingSummary,
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="show-header-toggle"
                  className="text-xs font-medium text-[var(--text-muted)]"
                >
                  Exibir Logo/Título
                </label>
                <button
                  id="show-header-toggle"
                  onClick={() => updateLayout('showHeader', !layout.showHeader)}
                  className={`w-12 h-7 rounded-full transition-colors relative min-w-[44px] min-h-[28px] ${layout.showHeader ? 'bg-white' : 'bg-white/10'}`}
                  aria-label={
                    layout.showHeader
                      ? 'Ocultar logo e título'
                      : 'Exibir logo e título'
                  }
                >
                  <div
                    className={`absolute top-1 w-5 h-5 rounded-full transition-all ${layout.showHeader ? 'left-6 bg-black' : 'left-1 bg-white/40'}`}
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
                        onClick={() =>
                          updateLayout('headerPosition', pos.value)
                        }
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
          ),
        },
        {
          id: 'style',
          title: 'Estilo e Transparência',
          summary: `Opacidade ${Math.round(layout.opacity * 100)}% · Raio ${layout.innerRadius}px`,
          content: (
            <div className="space-y-4">
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
                        className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Resetar Opacidade"
                        aria-label="Resetar opacidade do card"
                      >
                        <RotateCcw size={10} />
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
                        className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Resetar"
                        aria-label="Resetar arredondamento"
                      >
                        <RotateCcw size={10} />
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
                        className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Resetar"
                        aria-label="Resetar margem interna"
                      >
                        <RotateCcw size={10} />
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
                    onChange={e =>
                      updateLayout('padding', parseInt(e.target.value))
                    }
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            </div>
          ),
        },
        {
          id: 'shadow',
          title: 'Sombra e Profundidade',
          summary: `Blur ${layout.shadowBlur ?? 50}px · Opacidade ${Math.round((layout.shadowOpacity ?? 0.25) * 100)}%`,
          content: (
            <div className="space-y-4">
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
                      onChange={e =>
                        updateLayout('shadowColor', e.target.value)
                      }
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
                        className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Resetar"
                        aria-label="Resetar opacidade da sombra"
                      >
                        <RotateCcw size={10} />
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
                        className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Resetar X"
                        aria-label="Resetar sombra X"
                      >
                        <RotateCcw size={10} />
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
                        className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Resetar Y"
                        aria-label="Resetar sombra Y"
                      >
                        <RotateCcw size={10} />
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
                      className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Resetar"
                      aria-label="Resetar difusão da sombra"
                    >
                      <RotateCcw size={10} />
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
            </div>
          ),
        },
      ]}
    />
  )
}
