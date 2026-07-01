import React from 'react'
import {
  Wand2,
  Loader2,
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  CircleDot,
} from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import { useColorExtractor } from '../../../hooks/useColorExtractor'
import { ResponsiveSectionDeck } from './ResponsiveSectionDeck'

// Layout espacial de bússola 3x3: cada botão fica na posição visual da direção
// para onde o gradiente aponta; o centro é o gradiente radial.
const GRADIENT_ANGLES = [
  { value: '315deg', Icon: ArrowUpLeft, label: 'Superior esquerda' },
  { value: '0deg', Icon: ArrowUp, label: 'Cima' },
  { value: '45deg', Icon: ArrowUpRight, label: 'Superior direita' },
  { value: '270deg', Icon: ArrowLeft, label: 'Esquerda' },
  { value: 'circle at center', Icon: CircleDot, label: 'Radial' },
  { value: '90deg', Icon: ArrowRight, label: 'Direita' },
  { value: '225deg', Icon: ArrowDownLeft, label: 'Inferior esquerda' },
  { value: '180deg', Icon: ArrowDown, label: 'Baixo' },
  { value: '135deg', Icon: ArrowDownRight, label: 'Inferior direita' },
]

const COLOR_PRESETS = [
  ['#09090b', '#27272a'], // Zinc
  ['#171717', '#404040'], // Neutral
  ['#0f172a', '#1e293b'], // Slate
  ['#2e1065', '#581c87'], // Purple
  ['#172554', '#1e40af'], // Blue
  ['#1e1b4b', '#4338ca'], // Indigo
  ['#022c22', '#166534'], // Green
  ['#450a0a', '#991b1b'], // Red
  ['#4a044e', '#86198f'], // Fuchsia
  ['#0c0a09', '#ea580c'], // Orange-Black
  ['#FF0080', '#7928CA'], // Vercel
  ['#8A2387', '#E94057'], // JShine
  ['#0093E9', '#80D0C7'], // Blue Water
  ['#667eea', '#764ba2'], // Purple Rose
  ['#f093fb', '#f5576c'], // Pink
]

export const ColorTabs: React.FC = () => {
  const { colors, gradientStyle, image, updateNestedField, updateField } =
    useCardStore()
  const { extractColorsFromImage, isExtracting } = useColorExtractor()

  const handleColorChange = (key: 'bg1' | 'bg2' | 'text', val: string) => {
    updateNestedField('colors', key, val)
  }

  const handleAutoColor = async () => {
    if (!image) {
      alert('Gere um card com imagem primeiro para usar cores automáticas.')
      return
    }
    const extracted = await extractColorsFromImage(image)
    if (extracted) {
      handleColorChange('bg1', extracted.primary)
      handleColorChange('bg2', extracted.secondary)
      updateField('extractedColors', {
        bg1: extracted.primary,
        bg2: extracted.secondary,
      })
    }
  }

  return (
    <ResponsiveSectionDeck
      sections={[
        {
          id: 'manual',
          title: 'Ajuste Manual',
          summary: `${colors.bg1.toUpperCase()} → ${colors.bg2.toUpperCase()}`,
          defaultMobile: true,
          action: (
            <button
              onClick={handleAutoColor}
              disabled={isExtracting || !image}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 hover:from-sky-500/30 hover:to-cyan-500/30 border border-sky-400/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isExtracting ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Wand2 size={14} />
              )}
              {isExtracting ? 'Extraindo...' : 'Auto'}
            </button>
          ),
          content: (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="bg-color-1"
                  className="block text-xs font-medium mb-1.5 text-white/50"
                >
                  Cor 1
                </label>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                  <input
                    id="bg-color-1"
                    type="color"
                    value={colors.bg1}
                    onChange={e => handleColorChange('bg1', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors.bg1}
                    onChange={e => handleColorChange('bg1', e.target.value)}
                    className="w-full bg-transparent text-xs font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bg-color-2"
                  className="block text-xs font-medium mb-1.5 text-white/50"
                >
                  Cor 2
                </label>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                  <input
                    id="bg-color-2"
                    type="color"
                    value={colors.bg2}
                    onChange={e => handleColorChange('bg2', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors.bg2}
                    onChange={e => handleColorChange('bg2', e.target.value)}
                    className="w-full bg-transparent text-xs font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ),
        },
        {
          id: 'gradient',
          title: 'Direção do Gradiente',
          summary: gradientStyle,
          content: (
            <div className="grid w-fit grid-cols-3 gap-1.5">
              {GRADIENT_ANGLES.map(({ value, Icon, label }) => {
                const active = gradientStyle === value
                return (
                  <button
                    key={value}
                    onClick={() => updateField('gradientStyle', value)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                      active
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-white/55 hover:bg-white/10 hover:text-white'
                    }`}
                    title={value}
                    aria-label={`Gradiente: ${label} (${value})`}
                    aria-pressed={active}
                  >
                    <Icon size={15} strokeWidth={active ? 2.4 : 2} />
                  </button>
                )
              })}
            </div>
          ),
        },
        {
          id: 'presets',
          title: 'Presets',
          summary: `${COLOR_PRESETS.length} combinações rápidas`,
          content: (
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map(([c1, c2], i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleColorChange('bg1', c1)
                    handleColorChange('bg2', c2)
                  }}
                  className="aspect-square min-w-[44px] min-h-[44px] rounded-full border border-white/20 hover:scale-110 hover:border-white/50 transition-all shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                  }}
                  title={`${c1} → ${c2}`}
                  aria-label={`Preset de cor ${i + 1}: ${c1} para ${c2}`}
                />
              ))}
            </div>
          ),
        },
      ]}
    />
  )
}
