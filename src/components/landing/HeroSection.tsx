/**
 * Hero Section - Main landing area with animated logo and URL input
 * 
 * Features a unique geometric mesh background with flowing gradients,
 * the Spread logo with a subtle pulse animation, and the main CTA input.
 */

import React from 'react';
import { Zap, Loader2, Sparkles } from 'lucide-react';

interface HeroSectionProps {
    inputUrl: string;
    setInputUrl: (url: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    inputUrl,
    setInputUrl,
    onGenerate,
    isLoading
}) => {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden snap-start">
            {/* Animated Background - Geometric Mesh */}
            <div className="absolute inset-0">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />
                
                {/* Flowing gradient orbs */}
                <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-violet-600/15 rounded-full blur-[120px] animate-blob-slow" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-fuchsia-600/15 rounded-full blur-[120px] animate-blob-slow animation-delay-2000" />
                <div className="absolute top-[40%] left-[50%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] animate-blob-slow animation-delay-4000" />
                
                {/* Geometric grid overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="hero-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
                            <circle cx="0" cy="0" r="1.5" fill="white" opacity="0.4" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hero-grid)" />
                </svg>

                {/* Radial spotlight */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-violet-500/5 via-transparent to-transparent rounded-full pointer-events-none" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
                {/* Animated Logo */}
                <div className="relative mb-8 sm:mb-12">
                    {/* Glow ring */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-44 h-44 sm:w-52 sm:h-52 bg-gradient-to-tr from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse" />
                    </div>
                    
                    {/* Logo container */}
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 transform hover:scale-110 transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-pink-500 rounded-3xl rotate-6 opacity-80" />
                        <div className="absolute inset-1 bg-zinc-950 rounded-3xl flex items-center justify-center">
                            <img 
                                src="/spread/logo.svg" 
                                alt="Spread" 
                                className="w-16 h-16 sm:w-20 sm:h-20 opacity-90 drop-shadow-[0_0_30px_rgba(139,92,246,0.4)] animate-color-shift"
                                style={{ filter: 'brightness(1.3) contrast(1.1)' }}
                            />
                        </div>
                        
                        {/* Sparkle accent */}
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-lg shadow-2xl flex items-center justify-center animate-bounce">
                            <Sparkles size={18} className="text-violet-600" />
                        </div>
                    </div>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 sm:mb-6">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
                        Spread
                    </span>
                </h1>

                {/* Tagline */}
                <p className="text-lg sm:text-xl md:text-2xl text-white/60 font-medium max-w-2xl mb-8 sm:mb-12 leading-relaxed">
                    Crie visualizações <span className="text-white/90">elegantes</span> de links para compartilhar nas redes sociais
                </p>

                {/* URL Input */}
                <div className="w-full max-w-2xl">
                    <div className="flex gap-2 sm:gap-3 rounded-2xl p-1.5 sm:p-2 bg-white/5 backdrop-blur-2xl border border-white/10 ring-1 ring-white/5 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
                        <input
                            type="url"
                            placeholder="Cole seu link aqui..."
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
                            className="flex-1 bg-transparent px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg text-white placeholder:text-white/30 focus:outline-none min-w-0"
                        />
                        <button 
                            onClick={onGenerate}
                            disabled={isLoading}
                            className="flex-shrink-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition-all shadow-xl shadow-violet-500/25 disabled:opacity-50 flex items-center gap-2 sm:gap-3 group min-h-[52px]"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <>
                                    <Zap size={20} className="fill-white group-hover:scale-125 transition-transform" />
                                    <span>Gerar</span>
                                </>
                            )}
                        </button>
                    </div>
                    
                    {/* Hint text */}
                    <p className="text-white/30 text-sm mt-4">
                        YouTube, Spotify, artigos, qualquer link com metadados Open Graph
                    </p>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
                <span className="text-xs text-white/40 uppercase tracking-widest">Explorar</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
            </div>
        </section>
    );
};
