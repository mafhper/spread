import React from 'react'
import { AlignLeft, AlignCenter, AlignRight, RotateCcw } from 'lucide-react'
import { clsx } from 'clsx'
import { useCardStore } from '../../../store/cardStore'

export const TypographyTabs: React.FC = () => {
  const {
    title,
    description,
    author,
    template,
    fontFamily,
    textAlign,
    titleSize,
    subtitleSize,
    colors,
    updateField,
    updateNestedField,
    resetTypography,
  } = useCardStore()

  const fonts = [
    'Inter',
    'Roboto',
    'Poppins',
    'Montserrat',
    'Open Sans',
    'Nunito',
    'Raleway',
    'Oswald',
    'Playfair Display',
    'Merriweather',
  ]

  // Determine target field based on template
  const isMusicTemplate = template === 'music'
  const subtitleValue = isMusicTemplate ? author : description

  const handleSubtitleChange = (value: string) => {
    if (isMusicTemplate) {
      updateField('author', value)
    } else {
      updateField('description', value)
    }
  }

  return (
    <div className="space-y-6">
      {/* 0. Conteúdo de Texto */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Conteúdo
        </h4>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="title-input"
              className="block text-[10px] font-medium text-white/40 mb-1.5 uppercase tracking-wider"
            >
              Título Principal
            </label>
            <input
              id="title-input"
              type="text"
              value={title}
              onChange={e => updateField('title', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder-white/20"
              placeholder="Digite o título..."
            />
          </div>

          <div>
            <label
              htmlFor="subtitle-input"
              className="block text-[10px] font-medium text-white/40 mb-1.5 uppercase tracking-wider"
            >
              {isMusicTemplate ? 'Artista / Autor' : 'Subtítulo / Descrição'}
            </label>
            <textarea
              id="subtitle-input"
              value={subtitleValue}
              onChange={e => handleSubtitleChange(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder-white/20 resize-none"
              placeholder={
                isMusicTemplate ? 'Nome do artista...' : 'Digite a descrição...'
              }
            />
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* 1. Escolha de Fonte */}
      <div className="space-y-3">
        <span className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Fonte e Alinhamento
        </span>

        <div className="relative group" tabIndex={0} role="button">
          <div className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer">
            <span
              className="text-lg truncate pr-4"
              style={{ fontFamily: fontFamily }}
            >
              {fontFamily}
            </span>
            <span className="opacity-30 text-xs">▼</span>
          </div>

          <div className="absolute top-full left-0 right-0 mt-2 bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 transform origin-top max-h-64 overflow-y-auto custom-scrollbar">
            {fonts.map(font => (
              <button
                key={font}
                onClick={e => {
                  updateField('fontFamily', font)
                  ;(
                    e.currentTarget.parentElement?.parentElement as HTMLElement
                  )?.blur()
                }}
                className={clsx(
                  'w-full text-left px-4 py-3 text-base border-b border-white/5 last:border-0 hover:bg-white/10 transition-colors',
                  fontFamily === font
                    ? 'bg-white/10 text-white'
                    : 'text-white/40'
                )}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => updateField('textAlign', value)}
              className={clsx(
                'py-2.5 rounded-xl flex justify-center border transition-all',
                textAlign === value
                  ? 'bg-white text-black border-transparent'
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
              )}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* 2. Cores do Texto */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Cor do Texto
        </h4>
        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 border border-white/10">
          <label htmlFor="text-color-picker" className="sr-only">
            Cor do Texto
          </label>
          <input
            id="text-color-picker"
            type="color"
            value={colors.text}
            onChange={e => updateNestedField('colors', 'text', e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent flex-shrink-0"
          />
          <label htmlFor="text-color-hex" className="sr-only">
            Hexadecimal da Cor do Texto
          </label>
          <input
            id="text-color-hex"
            type="text"
            value={colors.text}
            onChange={e => updateNestedField('colors', 'text', e.target.value)}
            className="w-full bg-transparent text-sm font-mono uppercase focus:outline-none text-white/80"
          />
        </div>
      </div>

      {/* 3. Escala Visual */}
      <div className="space-y-5 pt-4 border-t border-white/5">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Escala de Tamanho
        </h4>

        <div className="space-y-2.5">
          <div className="flex justify-between items-end mb-1">
            <label
              htmlFor="title-size-slider"
              className="text-[10px] font-medium text-white/40 uppercase tracking-wider"
            >
              Título
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-white/60">
                {titleSize}%
              </span>
              <button
                onClick={() => updateField('titleSize', 100)}
                className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                title="Resetar Tamanho"
              >
                <RotateCcw size={8} />
              </button>
            </div>
          </div>
          <input
            id="title-size-slider"
            type="range"
            min="20"
            max="300"
            value={titleSize}
            onChange={e => updateField('titleSize', parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-end mb-1">
            <label
              htmlFor="subtitle-size-slider"
              className="text-[10px] font-medium text-white/40 uppercase tracking-wider"
            >
              Subtítulo
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-white/60">
                {subtitleSize}%
              </span>
              <button
                onClick={() => updateField('subtitleSize', 100)}
                className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                title="Resetar Tamanho"
              >
                <RotateCcw size={8} />
              </button>
            </div>
          </div>
          <input
            id="subtitle-size-slider"
            type="range"
            min="20"
            max="300"
            value={subtitleSize}
            onChange={e =>
              updateField('subtitleSize', parseInt(e.target.value))
            }
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>
      {/* Reset Section */}
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={resetTypography}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl text-xs font-semibold text-white/50 hover:text-red-400 transition-all group"
        >
          <RotateCcw
            size={14}
            className="group-hover:rotate-[-45deg] transition-transform"
          />
          Resetar Categoria (Texto)
        </button>
      </div>
    </div>
  )
}
