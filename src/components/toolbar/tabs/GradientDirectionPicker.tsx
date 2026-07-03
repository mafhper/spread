import React from 'react'
import {
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

// Bússola 3x3: cada botão fica na posição visual da direção para onde o
// gradiente aponta; o centro é o gradiente radial. Fonte única usada tanto no
// painel de Fundos (ColorTabs) quanto no de Canvas (CanvasControls).
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
] as const

export const GradientDirectionPicker: React.FC = () => {
  const { gradientStyle, updateField } = useCardStore()
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-3 gap-1.5">
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
    </div>
  )
}
