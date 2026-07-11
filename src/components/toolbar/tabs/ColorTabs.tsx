import React from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import { useColorExtractor } from '../../../hooks/useColorExtractor'
import { ResponsiveSectionDeck } from './ResponsiveSectionDeck'
import { GradientDirectionPicker } from './GradientDirectionPicker'

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

type BackgroundColorKey = 'bg1' | 'bg2'

type HsvColor = {
  hue: number
  saturation: number
  value: number
}

type RgbColor = {
  red: number
  green: number
  blue: number
}

const isHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const normalizeHexColor = (value: string) =>
  isHexColor(value) ? value.toLowerCase() : null

const hexToRgb = (hex: string): RgbColor => {
  const normalized = normalizeHexColor(hex) || '#000000'
  const parsed = Number.parseInt(normalized.slice(1), 16)

  return {
    red: (parsed >> 16) & 255,
    green: (parsed >> 8) & 255,
    blue: parsed & 255,
  }
}

const componentToHex = (value: number) =>
  Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, '0')

const rgbToHex = ({ red, green, blue }: RgbColor) =>
  `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`

const hsvToRgb = ({ hue, saturation, value }: HsvColor): RgbColor => {
  const chroma = value * saturation
  const hueSegment = hue / 60
  const secondLargestComponent = chroma * (1 - Math.abs((hueSegment % 2) - 1))
  const lightnessOffset = value - chroma

  let red = 0
  let green = 0
  let blue = 0

  if (hueSegment >= 0 && hueSegment < 1) {
    red = chroma
    green = secondLargestComponent
  } else if (hueSegment >= 1 && hueSegment < 2) {
    red = secondLargestComponent
    green = chroma
  } else if (hueSegment >= 2 && hueSegment < 3) {
    green = chroma
    blue = secondLargestComponent
  } else if (hueSegment >= 3 && hueSegment < 4) {
    green = secondLargestComponent
    blue = chroma
  } else if (hueSegment >= 4 && hueSegment < 5) {
    red = secondLargestComponent
    blue = chroma
  } else {
    red = chroma
    blue = secondLargestComponent
  }

  return {
    red: (red + lightnessOffset) * 255,
    green: (green + lightnessOffset) * 255,
    blue: (blue + lightnessOffset) * 255,
  }
}

const rgbToHsv = ({ red, green, blue }: RgbColor): HsvColor => {
  const normalizedRed = red / 255
  const normalizedGreen = green / 255
  const normalizedBlue = blue / 255
  const max = Math.max(normalizedRed, normalizedGreen, normalizedBlue)
  const min = Math.min(normalizedRed, normalizedGreen, normalizedBlue)
  const delta = max - min
  let hue = 0

  if (delta !== 0) {
    if (max === normalizedRed) {
      hue = 60 * (((normalizedGreen - normalizedBlue) / delta) % 6)
    } else if (max === normalizedGreen) {
      hue = 60 * ((normalizedBlue - normalizedRed) / delta + 2)
    } else {
      hue = 60 * ((normalizedRed - normalizedGreen) / delta + 4)
    }
  }

  return {
    hue: Math.round((hue + 360) % 360),
    saturation: max === 0 ? 0 : delta / max,
    value: max,
  }
}

const colorFromHsv = (hsv: HsvColor) => rgbToHex(hsvToRgb(hsv))

const getDraftColor = (
  drafts: Record<BackgroundColorKey, string>,
  key: BackgroundColorKey
) => (key === 'bg1' ? drafts.bg1 : drafts.bg2)

const setDraftColor = (
  drafts: Record<BackgroundColorKey, string>,
  key: BackgroundColorKey,
  value: string
) => (key === 'bg1' ? { ...drafts, bg1: value } : { ...drafts, bg2: value })

type ColorPickerFieldProps = {
  label: string
  value: string
  draftValue: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onDraftChange: (value: string) => void
  onCommit: (value: string) => void
  onResetDraft: () => void
}

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  value,
  draftValue,
  isOpen,
  onOpen,
  onClose,
  onDraftChange,
  onCommit,
  onResetDraft,
}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const isDraggingRef = React.useRef(false)
  const displayedColor = normalizeHexColor(draftValue) || value
  const hsv = React.useMemo(
    () => rgbToHsv(hexToRgb(displayedColor)),
    [displayedColor]
  )
  const hueColor = colorFromHsv({
    hue: hsv.hue,
    saturation: 1,
    value: 1,
  })

  React.useEffect(() => {
    if (!isOpen) return

    const closeFromOutside = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) onClose()
    }
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onResetDraft()
        onClose()
      }
    }

    document.addEventListener('pointerdown', closeFromOutside)
    document.addEventListener('keydown', closeWithEscape)

    return () => {
      document.removeEventListener('pointerdown', closeFromOutside)
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [isOpen, onClose, onResetDraft])

  const pickFromPlane = (
    event: React.PointerEvent<HTMLButtonElement>,
    shouldCommit: boolean
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const saturation = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const nextValue = 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1)
    const nextColor = colorFromHsv({
      hue: hsv.hue,
      saturation,
      value: nextValue,
    })

    onDraftChange(nextColor)
    if (shouldCommit) onCommit(nextColor)
  }

  const commitHue = (hue: number) => {
    const nextColor = colorFromHsv({ ...hsv, hue })
    onDraftChange(nextColor)
    onCommit(nextColor)
  }

  const commitTextValue = () => {
    if (isHexColor(draftValue)) {
      onCommit(draftValue)
      return
    }

    onResetDraft()
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label
        htmlFor={`${label.toLowerCase().replace(' ', '-')}-hex`}
        className="block text-xs font-medium mb-1.5 text-white/50"
      >
        {label}
      </label>
      <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
        <button
          type="button"
          aria-label={`Abrir seletor ${label}`}
          aria-expanded={isOpen}
          onClick={() => {
            if (isOpen) onClose()
            else onOpen()
          }}
          className="w-8 h-8 rounded-lg border border-white/20 shrink-0 shadow-inner focus:outline-none focus:ring-2 focus:ring-white/30"
          style={{ backgroundColor: displayedColor }}
        />
        <input
          id={`${label.toLowerCase().replace(' ', '-')}-hex`}
          type="text"
          value={draftValue}
          aria-label={label}
          onChange={event => onDraftChange(event.target.value)}
          onBlur={commitTextValue}
          onKeyDown={event => {
            if (event.key === 'Enter') event.currentTarget.blur()
            if (event.key === 'Escape') {
              onResetDraft()
              event.currentTarget.blur()
            }
          }}
          inputMode="text"
          spellCheck={false}
          className="w-full bg-transparent text-xs font-mono uppercase focus:outline-none"
        />
      </div>

      {isOpen ? (
        <div
          role="dialog"
          aria-label={`Seletor ${label}`}
          className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-white/10 bg-[#121212] p-3 shadow-2xl"
        >
          <button
            type="button"
            aria-label={`Selecionar ${label}`}
            onPointerDown={event => {
              isDraggingRef.current = true
              event.currentTarget.setPointerCapture?.(event.pointerId)
              pickFromPlane(event, false)
            }}
            onPointerMove={event => {
              if (isDraggingRef.current) pickFromPlane(event, false)
            }}
            onPointerUp={event => {
              isDraggingRef.current = false
              pickFromPlane(event, true)
            }}
            onKeyDown={event => {
              const step = event.shiftKey ? 0.1 : 0.04
              let saturation = hsv.saturation
              let nextValue = hsv.value

              if (event.key === 'ArrowLeft') saturation -= step
              else if (event.key === 'ArrowRight') saturation += step
              else if (event.key === 'ArrowDown') nextValue -= step
              else if (event.key === 'ArrowUp') nextValue += step
              else return

              event.preventDefault()
              const nextColor = colorFromHsv({
                hue: hsv.hue,
                saturation: clamp(saturation, 0, 1),
                value: clamp(nextValue, 0, 1),
              })
              onDraftChange(nextColor)
              onCommit(nextColor)
            }}
            className="relative h-32 w-full cursor-crosshair rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            style={{
              backgroundColor: hueColor,
              backgroundImage:
                'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
            }}
          >
            <span
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.65)]"
              style={{
                left: `${hsv.saturation * 100}%`,
                top: `${(1 - hsv.value) * 100}%`,
              }}
            />
          </button>

          <label className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
            Tom
            <input
              type="range"
              min="0"
              max="360"
              value={hsv.hue}
              aria-label={`${label}: tom`}
              onChange={event => {
                const nextHue = Number(event.target.value)
                onDraftChange(colorFromHsv({ ...hsv, hue: nextHue }))
              }}
              onMouseUp={event => commitHue(Number(event.currentTarget.value))}
              onTouchEnd={event => commitHue(Number(event.currentTarget.value))}
              onKeyUp={event => commitHue(Number(event.currentTarget.value))}
              onBlur={event => commitHue(Number(event.currentTarget.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
              }}
            />
          </label>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span
              className="h-8 w-8 rounded-lg border border-white/15"
              style={{ backgroundColor: displayedColor }}
            />
            <button
              type="button"
              onClick={onClose}
              className="min-h-[36px] rounded-lg border border-white/10 bg-white/10 px-3 text-xs font-semibold text-white/75 transition-colors hover:bg-white/15 hover:text-white"
            >
              Pronto
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export const ColorTabs: React.FC = () => {
  const { colors, gradientStyle, image, updateNestedField, updateField } =
    useCardStore()
  const { extractColorsFromImage, isExtracting } = useColorExtractor()
  const [activePicker, setActivePicker] =
    React.useState<BackgroundColorKey | null>(null)
  const [colorDrafts, setColorDrafts] = React.useState<
    Record<BackgroundColorKey, string>
  >({
    bg1: colors.bg1,
    bg2: colors.bg2,
  })

  React.useEffect(() => {
    setColorDrafts({ bg1: colors.bg1, bg2: colors.bg2 })
  }, [colors.bg1, colors.bg2])

  const handleColorChange = (key: 'bg1' | 'bg2' | 'text', val: string) => {
    updateNestedField('colors', key, val)
  }

  const commitColorDraft = (key: BackgroundColorKey, nextValue?: string) => {
    const value = nextValue || getDraftColor(colorDrafts, key)
    const savedValue = key === 'bg1' ? colors.bg1 : colors.bg2
    if (!isHexColor(value)) {
      setColorDrafts(drafts => setDraftColor(drafts, key, savedValue))
      return
    }

    handleColorChange(key, value)
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
            <div className="grid grid-cols-1 gap-2.5">
              <ColorPickerField
                label="Cor 1"
                value={colors.bg1}
                draftValue={colorDrafts.bg1}
                isOpen={activePicker === 'bg1'}
                onOpen={() => setActivePicker('bg1')}
                onClose={() => setActivePicker(null)}
                onDraftChange={value =>
                  setColorDrafts(drafts => setDraftColor(drafts, 'bg1', value))
                }
                onCommit={value => commitColorDraft('bg1', value)}
                onResetDraft={() =>
                  setColorDrafts(drafts =>
                    setDraftColor(drafts, 'bg1', colors.bg1)
                  )
                }
              />

              <ColorPickerField
                label="Cor 2"
                value={colors.bg2}
                draftValue={colorDrafts.bg2}
                isOpen={activePicker === 'bg2'}
                onOpen={() => setActivePicker('bg2')}
                onClose={() => setActivePicker(null)}
                onDraftChange={value =>
                  setColorDrafts(drafts => setDraftColor(drafts, 'bg2', value))
                }
                onCommit={value => commitColorDraft('bg2', value)}
                onResetDraft={() =>
                  setColorDrafts(drafts =>
                    setDraftColor(drafts, 'bg2', colors.bg2)
                  )
                }
              />
            </div>
          ),
        },
        {
          id: 'gradient',
          title: 'Direção do Gradiente',
          summary: gradientStyle,
          content: <GradientDirectionPicker />,
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
