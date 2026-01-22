import React from 'react';
import { useCardStore } from '../../../store/cardStore';
import { Wand2, Loader2 } from 'lucide-react';
import { useColorExtractor } from '../../../hooks/useColorExtractor';

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
];

export const ColorTabs: React.FC = () => {
    const { colors, gradientStyle, image, updateNestedField, updateField } = useCardStore();
    const { extractColorsFromImage, isExtracting } = useColorExtractor();

    const handleColorChange = (key: 'bg1' | 'bg2' | 'text', val: string) => {
        updateNestedField('colors', key, val);
    };

    const handleAutoColor = async () => {
        if (!image) {
            alert('Gere um card com imagem primeiro para usar cores automáticas.');
            return;
        }
        const extracted = await extractColorsFromImage(image);
        if (extracted) {
            handleColorChange('bg1', extracted.primary);
            handleColorChange('bg2', extracted.secondary);
        }
    };

    return (
        <div className="space-y-5">
            {/* Auto Color Button */}
            <button
                onClick={handleAutoColor}
                disabled={isExtracting || !image}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isExtracting ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                {isExtracting ? 'Extraindo...' : 'Cores Automáticas'}
            </button>

            {/* Manual Color Pickers */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium mb-1.5 text-white/50">Cor 1</label>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                        <input 
                            type="color" 
                            value={colors.bg1}
                            onChange={(e) => handleColorChange('bg1', e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                        />
                        <input
                            type="text"
                            value={colors.bg1}
                            onChange={(e) => handleColorChange('bg1', e.target.value)}
                            className="w-full bg-transparent text-xs font-mono uppercase focus:outline-none"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-medium mb-1.5 text-white/50">Cor 2</label>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                        <input 
                            type="color" 
                            value={colors.bg2}
                            onChange={(e) => handleColorChange('bg2', e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                        />
                        <input
                            type="text"
                            value={colors.bg2}
                            onChange={(e) => handleColorChange('bg2', e.target.value)}
                            className="w-full bg-transparent text-xs font-mono uppercase focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Gradient Direction */}
            <div>
                <label className="block text-xs font-medium mb-2 text-white/50">Direção do Gradiente</label>
                <div className="grid grid-cols-8 gap-1">
                    {GRADIENT_ANGLES.map((angle) => (
                        <button
                            key={angle.value}
                            onClick={() => updateField('gradientStyle', angle.value)}
                            className={`aspect-square rounded-lg text-sm font-bold transition-all ${
                                gradientStyle === angle.value 
                                    ? 'bg-white text-black scale-105' 
                                    : 'bg-white/10 hover:bg-white/20'
                            }`}
                            title={angle.value}
                        >
                            {angle.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Presets */}
            <div>
                <label className="block text-xs font-medium mb-2 text-white/50">Presets</label>
                <div className="grid grid-cols-5 gap-2">
                    {COLOR_PRESETS.map(([c1, c2], i) => (
                        <button
                            key={i}
                            onClick={() => {
                                handleColorChange('bg1', c1);
                                handleColorChange('bg2', c2);
                            }}
                            className="aspect-square rounded-full border border-white/20 hover:scale-110 hover:border-white/50 transition-all shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                            title={`${c1} → ${c2}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
