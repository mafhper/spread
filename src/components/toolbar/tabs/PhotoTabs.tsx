import { RotateCcw } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'

export const PhotoTabs: React.FC = () => {
  const { layout, updateNestedField, resetPhoto } = useCardStore()
  const updateLayout = (field: string, val: unknown): void =>
    updateNestedField('layout', field, val)

  return (
    <div className="space-y-6 pt-2">
      <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
        Foto do Link
      </h4>

      {/* Image Aspect Ratio */}
      <div>
        <label
          htmlFor="photo-aspect-select"
          className="block text-xs font-medium mb-1.5 text-[var(--text-muted)]"
        >
          Formato da Área da Foto
        </label>
        <select
          id="photo-aspect-select"
          value={layout.aspectRatio}
          onChange={e => updateLayout('aspectRatio', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
        >
          <option value="aspect-video" className="bg-[#0f0f0f]">
            16:9 (Padrão)
          </option>
          <option value="aspect-square" className="bg-[#0f0f0f]">
            1:1 (Quadrado)
          </option>
          <option value="aspect-[4/3]" className="bg-[#0f0f0f]">
            4:3 (Clássico)
          </option>
          <option value="aspect-[9/16]" className="bg-[#0f0f0f]">
            9:16 (Stories)
          </option>
          <option value="aspect-[4/5]" className="bg-[#0f0f0f]">
            4:5 (Portrait)
          </option>
          <option value="aspect-auto" className="bg-[#0f0f0f]">
            Original (Sem Cortar)
          </option>
        </select>
        <p className="text-[10px] text-white/30 mt-2 ml-1">
          Original preserva a altura da imagem.
        </p>
      </div>

      {/* Image Scale */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="photo-zoom-slider"
            className="text-xs font-medium text-[var(--text-muted)]"
          >
            Zoom da Foto
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white font-mono">
              {Math.round(layout.imageScale * 100)}%
            </span>
            <button
              onClick={() => updateLayout('imageScale', 1)}
              className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
              title="Resetar Zoom"
            >
              <RotateCcw size={10} />
            </button>
          </div>
        </div>
        <input
          id="photo-zoom-slider"
          type="range"
          min="0.5"
          max="2.5"
          step="0.05"
          value={layout.imageScale}
          onChange={e => updateLayout('imageScale', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>

      {/* Image Position */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="photo-offset-x"
              className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider"
            >
              Ajuste X
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white font-mono">
                {layout.imageOffsetX}px
              </span>
              <button
                onClick={() => updateLayout('imageOffsetX', 0)}
                className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                title="Resetar X"
              >
                <RotateCcw size={8} />
              </button>
            </div>
          </div>
          <input
            id="photo-offset-x"
            type="range"
            min="-400"
            max="400"
            step="1"
            value={layout.imageOffsetX}
            onChange={e =>
              updateLayout('imageOffsetX', parseInt(e.target.value))
            }
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="photo-offset-y"
              className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider"
            >
              Ajuste Y
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white font-mono">
                {layout.imageOffsetY}px
              </span>
              <button
                onClick={() => updateLayout('imageOffsetY', 0)}
                className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/20 hover:text-white/60"
                title="Resetar Y"
              >
                <RotateCcw size={8} />
              </button>
            </div>
          </div>
          <input
            id="photo-offset-y"
            type="range"
            min="-400"
            max="400"
            step="1"
            value={layout.imageOffsetY}
            onChange={e =>
              updateLayout('imageOffsetY', parseInt(e.target.value))
            }
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>
      {/* Reset Section */}
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={resetPhoto}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl text-xs font-semibold text-white/50 hover:text-red-400 transition-all group"
        >
          <RotateCcw
            size={14}
            className="group-hover:rotate-[-45deg] transition-transform"
          />
          Resetar Ajustes de Foto
        </button>
      </div>
    </div>
  )
}
