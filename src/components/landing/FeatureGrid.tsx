/**
 * Feature Grid - Showcases key features of Spread
 * 
 * Displays 6 features in a responsive grid with icons and descriptions.
 * Uses a subtle glass-morphism card style.
 */

import React from 'react';
import { 
    Wand2, 
    Palette, 
    Lock, 
    LayoutGrid, 
    ImageDown, 
    History 
} from 'lucide-react';

const features = [
    {
        icon: Wand2,
        title: 'Extração Automática',
        description: 'Metadados Open Graph extraídos em segundos de qualquer URL',
        gradient: 'from-violet-500 to-purple-600'
    },
    {
        icon: Palette,
        title: 'Cores Inteligentes',
        description: 'Paleta de cores extraída automaticamente da imagem do link',
        gradient: 'from-fuchsia-500 to-pink-600'
    },
    {
        icon: Lock,
        title: '100% Privado',
        description: 'Processamento no navegador, sem servidor, sem rastreamento',
        gradient: 'from-emerald-500 to-teal-600'
    },
    {
        icon: LayoutGrid,
        title: 'Templates Múltiplos',
        description: 'Layouts otimizados para música, notícias e conteúdo geral',
        gradient: 'from-cyan-500 to-blue-600'
    },
    {
        icon: ImageDown,
        title: 'Export HD',
        description: 'PNG em alta resolução (2x) pronto para redes sociais',
        gradient: 'from-orange-500 to-amber-600'
    },
    {
        icon: History,
        title: 'Histórico Local',
        description: 'Suas criações salvas localmente para acesso rápido',
        gradient: 'from-rose-500 to-red-600'
    }
];

export const FeatureGrid: React.FC = () => {
    return (
        <section className="relative min-h-screen py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-950 flex items-center overflow-hidden snap-start">
            {/* Gradient Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(139,92,246,0.25),_transparent_65%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,_rgba(139,92,246,0.2),_transparent_65%)]" />
            </div>

            <div className="max-w-6xl mx-auto relative w-full">
                {/* Section header */}
                <div className="text-center mb-16 sm:mb-20">
                    <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/60 mb-6">
                        Recursos
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                        Tudo que você precisa
                    </h2>
                    <p className="text-lg text-white/50 max-w-xl mx-auto">
                        Ferramentas poderosas para criar visualizações impressionantes em segundos
                    </p>
                </div>

                {/* Feature grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature, index) => (
                        <article 
                            key={index}
                            className="group relative p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 hover:bg-white/[0.04] text-center"
                        >
                            {/* Icon */}
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <div className="scale-90 sm:scale-100">
                                    <feature.icon size={22} className="text-white sm:w-6 sm:h-6" />
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Hover glow */}
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
