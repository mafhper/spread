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

const GRADIENT_ANGLES = [
  { label: '↗', value: '45deg' },
  { label: '→', value: '90deg' },
  { label: '↘', value: '135deg' },
  { label: '↓', value: '180deg' },
  { label: '↙', value: '225deg' },
  { label: '←', value: '270deg' },
  { label: '↖', value: '315deg' },
  { label: '○', value: 'circle at center' },
]

export const CanvasControls: React.FC = () => {
  const {
    canvasSize,
    cardPosition,
    colors,
    gradientStyle,
    pattern,
    customBgImage,
    image,
    updateNestedField,
    updateField,
    resetCanvas,
  } = useCardStore()
  const { extractColorsFromImage } = useColorExtractor()
  const [isExtracting, setIsExtracting] = React.useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    console.log('[CanvasControls] Manual auto-color trigger')
    try {
      const extracted = await extractColorsFromImage(image)
      if (extracted) {
        console.log('[CanvasControls] Manual extraction success:', extracted)
        updateNestedField('colors', 'bg1', extracted.primary)
        updateNestedField('colors', 'bg2', extracted.secondary)
      }
    } finally {
      setIsExtracting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = event => {
        const result = event.target?.result as string
        updateField('customBgImage', result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Tamanho do Canvas */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Área de Trabalho (Canvas)
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {CANVAS_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 p-3 min-h-[64px] rounded-xl border transition-all text-[10px]',
                canvasSize.preset === preset.name
                  ? 'bg-white text-black border-transparent shadow-lg scale-105'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'
              )}
              aria-label={`Tamanho ${preset.label}`}
            >
              {preset.icon}
              <span className="font-bold">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Cores e Gradiente */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
            Cores do Fundo
          </h4>
          <button
            onClick={handleAutoColors}
            disabled={isExtracting || !image}
            className="flex items-center gap-1 px-3 py-2 min-h-[32px] bg-white/5 hover:bg-white/10 rounded-md text-[10px] font-bold transition-all disabled:opacity-30"
            aria-label="Extrair cores automaticamente"
          >
            {isExtracting ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Wand2 size={14} />
            )}
            Auto
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
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
              className="w-full bg-transparent text-[10px] font-mono uppercase focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
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
              className="w-full bg-transparent text-[10px] font-mono uppercase focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="grid grid-cols-8 gap-1">
            {GRADIENT_ANGLES.map(angle => (
              <button
                key={angle.value}
                onClick={() => updateField('gradientStyle', angle.value)}
                className={`aspect-square min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-[12px] font-bold transition-all ${
                  gradientStyle === angle.value
                    ? 'bg-white text-black scale-110'
                    : 'bg-white/5 hover:bg-white/10 text-white/40'
                }`}
                title={angle.value}
                aria-label={`Ângulo do gradiente: ${angle.value}`}
              >
                {angle.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Textura e Imagem */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Textura e Imagem
        </h4>

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
            .slice(0, 3)
            .map(p => (
              <button
                key={p.value}
                onClick={() => updateField('pattern', p.value)}
                className={`px-3 py-2 rounded-lg text-[10px] font-medium transition-all min-w-[44px] min-h-[44px] ${
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
            className="w-full min-h-[44px] py-3 border border-dashed border-white/20 rounded-xl bg-white/5 text-[10px] text-white/50 hover:border-white/40 hover:text-white transition-all flex items-center justify-center gap-2"
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

      {/* 4. Posição do Card */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Posição do Card
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-white/40 block">Eixo X</span>
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
                updateNestedField('cardPosition', 'x', parseInt(e.target.value))
              }
              className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-white/40 block">Eixo Y</span>
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
                updateNestedField('cardPosition', 'y', parseInt(e.target.value))
              }
              className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
      {/* Reset Section */}
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={resetCanvas}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl text-xs font-semibold text-white/50 hover:text-red-400 transition-all group"
        >
          <RotateCcw
            size={14}
            className="group-hover:rotate-[-45deg] transition-transform"
          />
          Resetar Área e Posição
        </button>
      </div>
    </div>
  )
}
