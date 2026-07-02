import React, { useRef } from 'react'
import {
  Smartphone,
  Square,
  Monitor,
  Image as ImageIcon,
  Maximize,
  Wand2,
  Loader2,
  Upload,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useCardStore } from '../../../store/cardStore'
import { useColorExtractor } from '../../../hooks/useColorExtractor'
import { GradientDirectionPicker } from './GradientDirectionPicker'
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

export const CanvasControls: React.FC = () => {
  const {
    canvasSize,
    cardPosition,
    colors,
    pattern,
    customBgImage,
    image,
    updateNestedField,
    updateField,
  } = useCardStore()
  const { extractColorsFromImage } = useColorExtractor()
  const [isExtracting, setIsExtracting] = React.useState(false)
  const [isCompactViewport, setIsCompactViewport] = React.useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleColorChange = (key: 'bg1' | 'bg2', val: string) => {
    updateNestedField('colors', key, val)
  }

  const handleAutoColors = async () => {
    if (!image) return
    setIsExtracting(true)
    try {
      const extracted = await extractColorsFromImage(image)
      if (extracted) {
        updateNestedField('colors', 'bg1', extracted.primary)
        updateNestedField('colors', 'bg2', extracted.secondary)
      }
    } catch (error) {
      console.error('[CanvasControls] Erro ao extrair cores:', error)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      const result = event.target?.result as string
      updateField('customBgImage', result)
    }
    reader.readAsDataURL(file)
  }

  const activePreset =
    CANVAS_PRESETS.find(preset => preset.name === canvasSize.preset) ??
    CANVAS_PRESETS[0]
  const activePresetDimensions =
    activePreset.width > 0 && activePreset.height > 0
      ? `${activePreset.width}x${activePreset.height}`
      : 'Escala livre'

  const textureSummary = customBgImage
    ? 'Imagem customizada'
    : pattern === 'dots'
      ? 'Pontos'
      : pattern === 'grid'
        ? 'Grid'
        : pattern === 'noise'
          ? 'Ruído'
          : pattern === 'lines'
            ? 'Linhas'
            : pattern === 'diagonal'
              ? 'Diagonal'
              : pattern === 'mesh'
                ? 'Lattice'
                : 'Sem textura'

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
          id: 'colors',
          title: 'Cores do Fundo',
          summary: `${colors.bg1.toUpperCase()} → ${colors.bg2.toUpperCase()}`,
          action: (
            <button
              onClick={handleAutoColors}
              disabled={isExtracting || !image}
              className="flex items-center gap-1 rounded-md bg-white/5 px-3 py-1.5 min-h-[32px] text-[10px] font-bold transition-all hover:bg-white/10 disabled:opacity-30"
              aria-label="Extrair cores automaticamente"
            >
              {isExtracting ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Wand2 size={14} />
              )}
              Auto
            </button>
          ),
          content: (
            <div
              className={clsx('space-y-2.5', isCompactViewport && 'space-y-2')}
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
                  <input
                    type="color"
                    value={colors.bg1}
                    onChange={e => handleColorChange('bg1', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors.bg1}
                    onChange={e => handleColorChange('bg1', e.target.value)}
                    className="w-full bg-transparent text-[10px] font-mono uppercase text-white/80 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
                  <input
                    type="color"
                    value={colors.bg2}
                    onChange={e => handleColorChange('bg2', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors.bg2}
                    onChange={e => handleColorChange('bg2', e.target.value)}
                    className="w-full bg-transparent text-[10px] font-mono uppercase text-white/80 focus:outline-none"
                  />
                </div>
              </div>

              <GradientDirectionPicker />
            </div>
          ),
        },
        {
          id: 'texture',
          title: 'Textura e Imagem',
          summary: textureSummary,
          content: (
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: 'none', label: 'Nenhum' },
                    { value: 'dots', label: 'Pontos' },
                    { value: 'grid', label: 'Grid' },
                    { value: 'noise', label: 'Ruído' },
                    { value: 'lines', label: 'Linhas' },
                    { value: 'diagonal', label: 'Diag.' },
                  ] as const
                )
                  .slice(0, 6)
                  .map(p => (
                    <button
                      key={p.value}
                      onClick={() => updateField('pattern', p.value)}
                      className={`min-h-[38px] rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all ${
                        pattern === p.value
                          ? 'bg-white text-black'
                          : 'bg-white/5 hover:bg-white/10 text-white/50'
                      }`}
                      aria-label={`Selecionar padrão: ${p.label}`}
                    >
                      {p.label}
                    </button>
                  ))}
              </div>

              {!customBgImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full min-h-[40px] items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 py-2.5 text-[10px] text-white/50 transition-all hover:border-white/40 hover:text-white"
                  aria-label="Fazer upload de imagem customizada para o fundo"
                >
                  <Upload size={14} /> Imagem Customizada
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </button>
              ) : (
                <div className="relative group rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={customBgImage}
                    alt="Custom Background"
                    className="w-full h-16 object-cover"
                  />
                  <button
                    onClick={() => updateField('customBgImage', null)}
                    className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px]"
                    aria-label="Remover imagem customizada"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
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
