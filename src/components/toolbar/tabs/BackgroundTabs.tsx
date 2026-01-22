import React, { useRef } from 'react';
import { useCardStore } from '../../../store/cardStore';
import { Upload, Trash2 } from 'lucide-react';

export const BackgroundTabs: React.FC = () => {
    const { pattern, customBgImage, updateField } = useCardStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                updateField('customBgImage', result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-5">
            {/* Pattern Selector */}
            <div>
                <span className="block text-xs font-medium mb-2 text-white/50">Padrão / Textura</span>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { value: 'none', label: 'Nenhum' },
                        { value: 'dots', label: 'Pontos' },
                        { value: 'grid', label: 'Grid' },
                        { value: 'noise', label: 'Ruído' },
                        { value: 'lines', label: 'Linhas' },
                        { value: 'diagonal', label: 'Diag.' },
                    ].map((p) => (
                        <button
                            key={p.value}
                            onClick={() => updateField('pattern', p.value)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                pattern === p.value 
                                    ? 'bg-white text-black' 
                                    : 'bg-white/10 hover:bg-white/20'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                </div>
                
                {/* Pattern Controls */}
                {pattern !== 'none' && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-xs font-medium mb-2 text-white/50">Opacidade</span>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05"
                                value={useCardStore.getState().patternOpacity}
                                onChange={(e) => updateField('patternOpacity', parseFloat(e.target.value))}
                                className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <span className="block text-xs font-medium mb-2 text-white/50">Escala</span>
                            <input 
                                type="range" 
                                min="0.5" 
                                max="3" 
                                step="0.1"
                                value={useCardStore.getState().patternScale}
                                onChange={(e) => updateField('patternScale', parseFloat(e.target.value))}
                                className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            {/* Custom Image */}
            <div>
                <span className="block text-xs font-medium mb-2 text-white/50">Imagem de Fundo</span>
                
                {!customBgImage ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors bg-white/5"
                    >
                        <span className="text-xs text-white/50 flex items-center gap-2">
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
                        <img src={customBgImage} alt="Custom Background" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                        <button 
                            onClick={() => updateField('customBgImage', null)}
                            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remover imagem"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
