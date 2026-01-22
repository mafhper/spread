import React, { useRef } from 'react';
import { useCardStore } from '../../../store/cardStore';
import { Smartphone, Square, Monitor, Image as ImageIcon, Maximize, Wand2, Loader2, Upload, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useColorExtractor } from '../../../hooks/useColorExtractor';

interface CanvasPreset {
    name: string;
    label: string;
    width: number;
    height: number;
    icon: React.ReactNode;
}

const CANVAS_PRESETS: CanvasPreset[] = [
    { name: 'auto', label: 'Auto', width: 0, height: 0, icon: <Maximize size={14} /> },
    { name: 'story', label: 'Story', width: 1080, height: 1920, icon: <Smartphone size={14} /> },
    { name: 'post', label: 'Post', width: 1080, height: 1350, icon: <ImageIcon size={14} /> },
    { name: 'square', label: 'Quadrado', width: 1080, height: 1080, icon: <Square size={14} /> },
    { name: 'landscape', label: 'Paisagem', width: 1920, height: 1080, icon: <Monitor size={14} /> },
    { name: 'twitter', label: 'Twitter', width: 1200, height: 675, icon: <Monitor size={14} /> },
];

const GRADIENT_ANGLES = [
    { label: '↗', value: '45deg' },
    { label: '→', value: '90deg' },
    { label: '↘', value: '135deg' },
    { label: '↓', value: '180deg' },
    { label: '↙', value: '225deg' },
    { label: '←', value: '270deg' },
    { label: '↖', value: '315deg' },
    { label: '○', value: 'circle at center' },
];

export const CanvasControls: React.FC = () => {
    const { 
        canvasSize, cardPosition, colors, gradientStyle, pattern, 
        customBgImage, image, updateNestedField, updateField 
    } = useCardStore();
    const { extractColorsFromImage } = useColorExtractor();
    const [isExtracting, setIsExtracting] = React.useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePresetSelect = (preset: CanvasPreset) => {
        updateNestedField('canvasSize', 'width', preset.width);
        updateNestedField('canvasSize', 'height', preset.height);
        updateNestedField('canvasSize', 'preset', preset.name);
    };

    const handleColorChange = (key: 'bg1' | 'bg2', val: string) => {
        updateNestedField('colors', key, val);
    };

    const handleAutoColors = async () => {
        if (!image) return;
        setIsExtracting(true);
        console.log('[CanvasControls] Manual auto-color trigger');
        try {
            const extracted = await extractColorsFromImage(image);
            if (extracted) {
                console.log('[CanvasControls] Manual extraction success:', extracted);
                updateNestedField('colors', 'bg1', extracted.primary);
                updateNestedField('colors', 'bg2', extracted.secondary);
            }
        } finally {
            setIsExtracting(false);
        }
    };

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
        <div className="space-y-6">
            {/* 1. Tamanho do Canvas */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Área de Trabalho (Canvas)</h4>
                <div className="grid grid-cols-3 gap-2">
                    {CANVAS_PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => handlePresetSelect(preset)}
                            className={clsx(
                                "flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all text-[10px]",
                                canvasSize.preset === preset.name 
                                    ? "bg-white text-black border-transparent shadow-lg scale-105" 
                                    : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30"
                            )}
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
                    <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Cores do Fundo</h4>
                    <button
                        onClick={handleAutoColors}
                        disabled={isExtracting || !image}
                        className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md text-[9px] font-bold transition-all disabled:opacity-30"
                    >
                        {isExtracting ? <Loader2 className="animate-spin" size={12} /> : <Wand2 size={12} />}
                        Auto
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                        <input type="color" value={colors.bg1} onChange={(e) => handleColorChange('bg1', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent" />
                        <input type="text" value={colors.bg1} onChange={(e) => handleColorChange('bg1', e.target.value)} className="w-full bg-transparent text-[10px] font-mono uppercase focus:outline-none" />
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                        <input type="color" value={colors.bg2} onChange={(e) => handleColorChange('bg2', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent" />
                        <input type="text" value={colors.bg2} onChange={(e) => handleColorChange('bg2', e.target.value)} className="w-full bg-transparent text-[10px] font-mono uppercase focus:outline-none" />
                    </div>
                </div>

                <div>
                    <div className="grid grid-cols-8 gap-1">
                        {GRADIENT_ANGLES.map((angle) => (
                            <button
                                key={angle.value}
                                onClick={() => updateField('gradientStyle', angle.value)}
                                className={`aspect-square rounded-md text-[10px] font-bold transition-all ${
                                    gradientStyle === angle.value 
                                        ? 'bg-white text-black scale-110' 
                                        : 'bg-white/5 hover:bg-white/10 text-white/40'
                                }`}
                                title={angle.value}
                            >
                                {angle.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Textura e Imagem */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Textura e Imagem</h4>
                
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'none', label: 'Nenhum' },
                        { value: 'dots', label: 'Pontos' },
                        { value: 'grid', label: 'Grid' },
                        { value: 'noise', label: 'Ruído' },
                        { value: 'lines', label: 'Linhas' },
                        { value: 'diagonal', label: 'Diag.' },
                    ].slice(0, 3).map((p) => (
                        <button
                            key={p.value} onClick={() => updateField('pattern', p.value)}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                                pattern === p.value ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10 text-white/50'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {!customBgImage ? (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 border border-dashed border-white/20 rounded-xl bg-white/5 text-[10px] text-white/50 hover:border-white/40 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Upload size={14} /> Imagem Customizada
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </button>
                ) : (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10">
                        <img src={customBgImage} alt="Custom Background" className="w-full h-16 object-cover" />
                        <button onClick={() => updateField('customBgImage', null)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* 4. Posição do Card */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Posição do Card</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-[10px] text-white/40 block mb-1">X: {cardPosition.x}%</span>
                        <input type="range" min="-50" max="50" step="5" value={cardPosition.x} onChange={(e) => updateNestedField('cardPosition', 'x', parseInt(e.target.value))} className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div>
                        <span className="text-[10px] text-white/40 block mb-1">Y: {cardPosition.y}%</span>
                        <input type="range" min="-50" max="50" step="5" value={cardPosition.y} onChange={(e) => updateNestedField('cardPosition', 'y', parseInt(e.target.value))} className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    );
};
