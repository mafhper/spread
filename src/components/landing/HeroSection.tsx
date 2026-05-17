/**
 * Hero Section - Main landing area with animated logo and URL input
 *
 * Features a unique geometric mesh background with flowing gradients,
 * the Spread logo with a subtle pulse animation, and the main CTA input.
 */

import React from 'react'
import { Zap, Loader2, Save } from 'lucide-react'

interface HeroSectionProps {
  inputUrl: string
  setInputUrl: (url: string) => void
  onGenerate: () => void
  isLoading: boolean
  hasDraft?: boolean
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  inputUrl,
  setInputUrl,
  onGenerate,
  isLoading,
  hasDraft = false,
}) => {
  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:min-h-screen sm:px-6 sm:py-0 lg:px-8"
      style={{ minHeight: '100dvh' }}
    >
      {/* Animated Background - Geometric Mesh */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />

        {/* Flowing gradient orbs */}
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-violet-600/15 rounded-full blur-[120px] animate-blob-slow" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-fuchsia-600/15 rounded-full blur-[120px] animate-blob-slow animation-delay-2000" />
        <div className="absolute top-[40%] left-[50%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] animate-blob-slow animation-delay-4000" />

        {/* Geometric grid overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.12]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
              <circle cx="0" cy="0" r="1.5" fill="white" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        {/* Radial spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-violet-500/5 via-transparent to-transparent rounded-full pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        {/* Animated Logo */}
        <div className="relative mb-5 sm:mb-12">
          {/* Logo container */}
          <div className="relative w-24 h-24 sm:w-36 sm:h-36 transition-transform duration-500 hover:scale-[1.04]">
            <div
              className="absolute -inset-10 sm:-inset-14 rounded-[3rem] opacity-55 blur-2xl mix-blend-screen animate-hero-logo-glow-color"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(139,92,246,0.24) 0%, rgba(217,70,239,0.18) 24%, rgba(34,211,238,0.12) 46%, rgba(236,72,153,0.08) 60%, rgba(24,24,27,0) 78%)',
              }}
            />
            <div
              className="absolute -inset-[3px] sm:-inset-1 rounded-[1.9rem] opacity-85 animate-hero-logo-color-wheel"
              style={{
                backgroundImage:
                  'conic-gradient(from 210deg, rgba(139,92,246,0.82), rgba(217,70,239,0.86), rgba(236,72,153,0.74), rgba(34,211,238,0.76), rgba(139,92,246,0.82))',
              }}
            />
            <div className="absolute inset-0 rounded-3xl bg-zinc-950/96 shadow-[0_12px_40px_rgba(0,0,0,0.28),inset_0_0_24px_rgba(255,255,255,0.03)]" />
            <div className="absolute inset-[4px] rounded-[1.35rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_48%),linear-gradient(180deg,rgba(24,24,27,0.98),rgba(9,9,11,0.98))]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/spread/logo.svg"
                alt="Spread"
                className="w-12 h-12 sm:w-20 sm:h-20 opacity-95 drop-shadow-[0_0_18px_rgba(217,70,239,0.2)]"
                style={{ filter: 'brightness(1.16) contrast(1.06)' }}
                fetchPriority="high"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-3 sm:mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
            Spread
          </span>
        </div>

        {/* Tagline */}
        <p className="mb-6 max-w-2xl px-4 text-base font-medium leading-relaxed text-white/60 sm:mb-12 sm:text-xl md:text-2xl">
          Crie visualizações <span className="text-white/90">elegantes</span> de
          links para compartilhar nas redes sociais
        </p>

        {/* URL Input */}
        <div className="w-full max-w-2xl px-2">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 rounded-2xl p-1.5 sm:p-2 bg-white/5 backdrop-blur-2xl border border-white/10 ring-1 ring-white/5 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
            <input
              type="url"
              placeholder="Cole seu link aqui..."
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onGenerate()}
              className="flex-1 bg-transparent px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg text-white placeholder:text-white/30 focus:outline-none min-w-0"
              aria-label="URL"
              onFocus={e => {
                if (window.innerWidth >= 768) return

                const input = e.currentTarget
                window.setTimeout(() => {
                  input.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                  })
                }, 120)
              }}
            />
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="flex-shrink-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition-all shadow-xl shadow-violet-500/25 disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3 group min-h-[52px]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <Zap
                    size={20}
                    className="fill-white group-hover:scale-125 transition-transform"
                  />
                  <span>Gerar</span>
                </>
              )}
            </button>
          </div>

          {/* Draft indicator and hint text */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 px-2">
            {hasDraft && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-medium animate-pulse">
                <Save size={12} />
                Rascunho salvo
              </span>
            )}
            <p className="text-sm text-white/30">
              YouTube, Spotify, artigos, qualquer link com metadados Open Graph
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
