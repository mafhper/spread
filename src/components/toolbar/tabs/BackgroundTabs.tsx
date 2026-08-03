import React, { useRef } from 'react'
import { Upload, Trash2, RotateCcw } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'

export const BackgroundTabs: React.FC = () => {
  const {
    pattern,
    customBgImage,
    updateField,
    patternOpacity,
    patternScale,
    resetBackground,
  } = useCardStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    <div className="background-controls">
      {/* Pattern Selector */}
      <div className="background-pattern-section">
        <span className="block text-xs font-medium mb-2 text-white/50">
          Padrão / Textura
        </span>
        <div className="background-pattern-grid">
          {[
            { value: 'none', label: 'Nenhum' },
            { value: 'dots', label: 'Pontos' },
            { value: 'grid', label: 'Grid' },
            { value: 'noise', label: 'Ruído' },
            { value: 'lines', label: 'Linhas' },
            { value: 'diagonal', label: 'Diag.' },
            { value: 'mesh', label: 'Lattice' },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => updateField('pattern', p.value)}
              className={`background-pattern-button px-2 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                pattern === p.value
                  ? 'bg-white text-black'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              aria-label={`Selecionar padrão: ${p.label}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Controls */}
      {pattern !== 'none' && (
        <div className="background-pattern-controls">
          <div className="background-pattern-control">
            <div className="background-pattern-heading mb-1">
              <span className="block text-[10px] font-medium text-white/50">
                Opacidade
              </span>
              <div className="background-pattern-value">
                <span className="text-[9px] font-mono text-white/40">
                  {Math.round(patternOpacity * 100)}%
                </span>
                <button
                  onClick={() => updateField('patternOpacity', 0.1)}
                  className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Resetar"
                  aria-label="Resetar opacidade do padrão"
                >
                  <RotateCcw size={10} />
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={patternOpacity}
              onChange={e =>
                updateField('patternOpacity', parseFloat(e.target.value))
              }
              className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="background-pattern-control">
            <div className="background-pattern-heading mb-1">
              <span className="block text-[10px] font-medium text-white/50">
                Escala
              </span>
              <div className="background-pattern-value">
                <span className="text-[9px] font-mono text-white/40">
                  {Math.round(patternScale * 100)}%
                </span>
                <button
                  onClick={() => updateField('patternScale', 1)}
                  className="p-3 -m-2.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Resetar"
                  aria-label="Resetar escala do padrão"
                >
                  <RotateCcw size={10} />
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={patternScale}
              onChange={e =>
                updateField('patternScale', parseFloat(e.target.value))
              }
              className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
      {/* Custom Image */}
      <div className="background-image-section">
        <span className="block text-xs font-medium mb-2 text-white/50">
          Imagem de Fundo
        </span>

        {!customBgImage ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            className="background-upload flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors bg-white/5"
          >
            <span className="background-upload-label text-xs text-white/50 flex items-center gap-2">
              <Upload size={16} /> Escolher Imagem...
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative group">
            <img
              src={customBgImage}
              alt="Custom Background"
              className="w-full h-24 object-cover rounded-xl border border-white/10"
            />
            <button
              onClick={() => updateField('customBgImage', null)}
              className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Remover imagem"
              aria-label="Remover imagem de fundo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      {/* Reset Section */}
      <div className="background-reset-section pt-6 border-t border-white/5">
        <button
          onClick={resetBackground}
          className="background-reset-button w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl text-xs font-semibold text-white/50 hover:text-red-400 transition-all group"
        >
          <RotateCcw
            size={14}
            className="group-hover:rotate-[-45deg] transition-transform"
          />
          Resetar Categoria (Fundo)
        </button>
      </div>
    </div>
  )
}
