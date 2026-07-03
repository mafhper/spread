import React from 'react'
import {
  Smartphone,
  Square,
  Monitor,
  Image as ImageIcon,
  Maximize,
  RotateCcw,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useCardStore } from '../../../store/cardStore'
import { ResponsiveSectionDeck } from './ResponsiveSectionDeck'

interface CanvasPreset {
  name: string
  label: string
  width: number
  height: number
  icon: React.ReactNode
}

const CANVAS_PRESETS: CanvasPreset[] = [
  {
    name: 'auto',
    label: 'Auto',
    width: 0,
    height: 0,
    icon: <Maximize size={14} />,
  },
  {
    name: 'story',
    label: 'Story',
    width: 1080,
    height: 1920,
    icon: <Smartphone size={14} />,
  },
  {
    name: 'post',
    label: 'Post',
    width: 1080,
    height: 1350,
    icon: <ImageIcon size={14} />,
  },
  {
    name: 'square',
    label: 'Quadrado',
    width: 1080,
    height: 1080,
    icon: <Square size={14} />,
  },
  {
    name: 'landscape',
    label: 'Paisagem',
    width: 1920,
    height: 1080,
    icon: <Monitor size={14} />,
  },
  {
    name: 'twitter',
    label: 'Twitter',
    width: 1200,
    height: 676,
    icon: <Monitor size={14} />,
  },
]

// Inspector › Canvas: cuida apenas do formato/dimensão e da posição do card.
// Cores, gradiente e textura do fundo vivem no painel Fundos (ColorTabs /
// BackgroundTabs) — não devem ser duplicados aqui.
export const CanvasControls: React.FC = () => {
  const { canvasSize, cardPosition, updateNestedField } = useCardStore()
  const [isCompactViewport, setIsCompactViewport] = React.useState(false)

  React.useEffect(() => {
    const syncViewportMode = () => setIsCompactViewport(window.innerWidth < 768)

    syncViewportMode()
    window.addEventListener('resize', syncViewportMode)

    return () => window.removeEventListener('resize', syncViewportMode)
  }, [])

  const handlePresetSelect = (preset: CanvasPreset) => {
    updateNestedField('canvasSize', 'width', preset.width)
    updateNestedField('canvasSize', 'height', preset.height)
    updateNestedField('canvasSize', 'preset', preset.name)
  }

  const activePreset =
    CANVAS_PRESETS.find(preset => preset.name === canvasSize.preset) ??
    CANVAS_PRESETS[0]
  const activePresetDimensions =
    activePreset.width > 0 && activePreset.height > 0
      ? `${activePreset.width}x${activePreset.height}`
      : 'Escala livre'

  return (
    <ResponsiveSectionDeck
      sections={[
        {
          id: 'canvas',
          title: 'Área de Trabalho (Canvas)',
          summary: `Preset atual: ${activePreset.label}`,
          defaultMobile: true,
          content: (
            <div className="space-y-2.5">
              <div className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  Visualização
                </p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">
                    {activePreset.label}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-white/45">
                    {activePresetDimensions}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {CANVAS_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className={clsx(
                      'flex flex-col items-center justify-center rounded-xl border transition-all',
                      isCompactViewport
                        ? 'min-h-[54px] gap-1 px-2 py-1.5'
                        : 'min-h-[64px] gap-1 p-3',
                      canvasSize.preset === preset.name
                        ? 'bg-white text-black border-transparent shadow-lg scale-[1.02]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'
                    )}
                    aria-label={`Tamanho ${preset.label}`}
                  >
                    <span className="text-[13px]">{preset.icon}</span>
                    <span className="font-bold text-[10px]">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ),
        },
        {
          id: 'position',
          title: 'Posição do Card',
          summary: `X ${cardPosition.x}% · Y ${cardPosition.y}%`,
          content: (
            <div className="space-y-2.5">
              <div className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-white/40 block">
                    Eixo X
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-white/40">
                      {cardPosition.x}%
                    </span>
                    <button
                      onClick={() => updateNestedField('cardPosition', 'x', 0)}
                      className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Resetar X"
                      aria-label="Resetar posição X"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={cardPosition.x}
                  onChange={e =>
                    updateNestedField(
                      'cardPosition',
                      'x',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-white/40 block">
                    Eixo Y
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-white/40">
                      {cardPosition.y}%
                    </span>
                    <button
                      onClick={() => updateNestedField('cardPosition', 'y', 0)}
                      className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Resetar Y"
                      aria-label="Resetar posição Y"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={cardPosition.y}
                  onChange={e =>
                    updateNestedField(
                      'cardPosition',
                      'y',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
