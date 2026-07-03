import React from 'react'
import { resolvePublicAsset } from '../../utils/resolvePublicAsset'

export const WelcomeCard: React.FC = () => {
  return (
    <div className="relative group w-full max-w-2xl font-sans">
      {/* Card Wrapper */}
      <div className="w-full transition-all duration-300 relative rounded-xl p-1.5">
        {/* Inner Content Card */}
        <div
          className="relative flex flex-col gap-6 p-8 border border-white/5 z-10 transition-all duration-300 rounded-xl min-h-[460px] shadow-2xl backdrop-blur-3xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(15, 15, 20, 0.4)',
            boxShadow: '0 25px 100px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header (REMOVED REDUNDANCY) */}

          {/* Animated Graphic Content */}
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="relative flex items-center justify-center py-16 flex-shrink-0">
              {/* Improved Circular Background with Glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[320px] h-[320px] bg-violet-600/15 rounded-full blur-[80px] animate-pulse" />
                <div className="absolute w-44 h-44 bg-gradient-to-tr from-white/10 to-white/5 rounded-full border border-white/20 backdrop-blur-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)] ring-1 ring-white/10" />
              </div>

              {/* Animated SVG Graphic */}
              <div className="relative z-10 w-28 h-28 transform transition-transform duration-700 hover:scale-110">
                <img
                  src={resolvePublicAsset('logo.svg')}
                  alt="Spread Logo"
                  className="w-full h-full opacity-90 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-color-shift"
                  style={{ filter: 'brightness(1.5) contrast(1.1)' }}
                />

                {/* Lightning Bolt Accessory (premium touch) */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-xl flex items-center justify-center animate-bounce duration-[3000ms]">
                  <svg viewBox="0 0 24 24" fill="black" className="w-5 h-5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 text-center mt-auto mb-8">
            <h2 className="font-black leading-tight text-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Bem-vindo ao Spread
            </h2>
            <p className="opacity-70 leading-relaxed font-medium text-lg text-white/70 max-w-sm mx-auto px-4">
              Crie visualizações de links incríveis para compartilhar nas redes
              sociais.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
