import React from 'react';
import { useCardStore } from '../../../store/cardStore';
import { Layout } from 'lucide-react';

export const CardTabs: React.FC = () => {
    const { layout, updateNestedField } = useCardStore();
    const updateLayout = (field: string, val: unknown) => updateNestedField('layout', field, val);

    return (
        <div className="space-y-6">
             <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Proporções do Card</h4>
                
                {/* Card Aspect Ratio */}
                <div>
                    <label htmlFor="card-preset" className="block text-xs font-medium mb-1.5 text-[var(--text-muted)]">Formato do Card</label>
                    <div id="card-preset" className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Auto', value: 'aspect-auto' },
                            { label: '1:1 Quadrado', value: 'aspect-square' },
                            { label: '16:9 Vídeo', value: 'aspect-video' },
                            { label: '4:3 Clássico', value: 'aspect-[4/3]' },
                        ].map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => {
                                    console.log('[CardTabs] Selecting preset:', preset.value);
                                    updateLayout('cardAspectRatio', preset.value);
                                }}
                                className={`px-2 py-1.5 rounded text-[10px] font-medium border transition-colors ${
                                    layout.cardAspectRatio === preset.value
                                        ? 'bg-white text-black border-transparent'
                                        : 'bg-white/5 text-[var(--text-muted)] border-white/10 hover:border-white/30'
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card Scale */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="card-scale" className="text-xs font-medium text-[var(--text-muted)]">Tamanho do Card (Escala)</label>
                        <span className="text-xs text-white font-mono">{Math.round(layout.cardScale * 100)}%</span>
                    </div>
                    <input 
                        id="card-scale"
                        type="range" min="0.5" max="1.5" step="0.05"
                        value={layout.cardScale}
                        onChange={(e) => updateLayout('cardScale', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Branding do Card</h4>
                
                <div className="flex items-center justify-between">
                    <label htmlFor="show-header-toggle" className="text-xs font-medium text-[var(--text-muted)]">Exibir Logo/Título</label>
                    <button 
                        id="show-header-toggle"
                        onClick={() => updateLayout('showHeader', !layout.showHeader)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${layout.showHeader ? 'bg-white' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${layout.showHeader ? 'left-6 bg-black' : 'left-1 bg-white/40'}`} />
                    </button>
                </div>

                {layout.showHeader && (
                    <div>
                        <label className="block text-[10px] text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Posição do Header</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Esquerda', value: 'left' },
                                { label: 'Direita', value: 'right' },
                            ].map((pos) => (
                                <button
                                    key={pos.value}
                                    onClick={() => updateLayout('headerPosition', pos.value)}
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

             <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Estilo e Transparência</h4>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Opacidade ({Math.round(layout.opacity * 100)}%)</label>
                        <input 
                            aria-label="Opacidade"
                            type="range" min="0" max="1" step="0.05"
                            value={layout.opacity}
                            onChange={(e) => updateLayout('opacity', parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Blur (Vidro)</label>
                        <input 
                            type="range" min="0" max="24" step="1"
                            value={layout.backdropBlur ?? 12}
                            onChange={(e) => updateLayout('backdropBlur', parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Arredondamento</label>
                        <input 
                            type="range" min="0" max="32" step="2"
                            value={layout.innerRadius}
                            onChange={(e) => updateLayout('innerRadius', parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Margem Interna</label>
                        <input 
                            type="range" min="0" max="12" step="1"
                            value={layout.padding}
                            onChange={(e) => updateLayout('padding', parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Sombra e Profundidade</h4>
                
                <div className="flex gap-3">
                    <div className="flex-1">
                         <label className="block text-[10px] text-white/40 mb-1">Sombra</label>
                         <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1.5 border border-white/10">
                             <input 
                                type="color" 
                                value={layout.shadowColor ?? '#000000'} 
                                onChange={(e) => updateLayout('shadowColor', e.target.value)} 
                                className="w-5 h-5 rounded bg-transparent border-none p-0 cursor-pointer" 
                             />
                             <span className="text-[10px] font-mono text-white/60 uppercase">{layout.shadowColor ?? '#000000'}</span>
                         </div>
                    </div>
                    <div className="flex-1">
                         <label className="block text-[10px] text-white/40 mb-1">Opacidade Semente</label>
                         <input 
                            type="range" min="0" max="1" step="0.05" 
                            value={layout.shadowOpacity ?? 0.25} 
                            onChange={(e) => updateLayout('shadowOpacity', parseFloat(e.target.value))} 
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white mt-2" 
                         />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                         <label className="block text-[10px] text-white/40 mb-1">Posição Y</label>
                         <input 
                            type="range" min="-50" max="50" 
                            value={layout.shadowOffsetY ?? 25} 
                            onChange={(e) => updateLayout('shadowOffsetY', parseInt(e.target.value))} 
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" 
                         />
                    </div>
                    <div>
                         <label className="block text-[10px] text-white/40 mb-1">Difusão (Blur)</label>
                         <input 
                            type="range" min="0" max="100" 
                            value={layout.shadowBlur ?? 50} 
                            onChange={(e) => updateLayout('shadowBlur', parseInt(e.target.value))} 
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" 
                         />
                    </div>
                </div>
             </div>
        </div>
    );
};
