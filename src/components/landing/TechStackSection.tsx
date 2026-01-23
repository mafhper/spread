/**
 * Tech Stack Section - Displays the technologies used in Spread
 *
 * Shows technology logos/badges with hover effects.
 */

import React from 'react'

const technologies = [
  {
    name: 'Astro',
    description: 'Meta-framework',
    color: 'from-orange-500 to-pink-500',
    icon: (
      <svg viewBox="0 0 128 128" className="w-8 h-8">
        <path
          fill="currentColor"
          d="M81.504 9.465c.973 1.207 1.469 2.836 2.457 6.09l21.656 71.136a90.079 90.079 0 0 0-25.89-8.765L65.629 30.28a1.833 1.833 0 0 0-3.52.004L48.18 77.902a90.104 90.104 0 0 0-26.003 8.778l21.758-71.14c.996-3.25 1.492-4.876 2.464-6.083a8.023 8.023 0 0 1 3.243-2.398c1.433-.575 3.136-.575 6.535-.575H71.72c3.402 0 5.105 0 6.543.579a7.988 7.988 0 0 1 3.242 2.402Zm-18.314 73.61c-2.673 2.451-8.012 4.127-14.122 4.127-7.738 0-14.064-2.74-14.064-7.316 0-5.238 6.016-6.895 13.18-7.14l15.006-.462v10.79Z"
        />
      </svg>
    ),
  },
  {
    name: 'React',
    description: 'UI Framework',
    color: 'from-cyan-400 to-blue-500',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm0 21.5c-1.5 0-2.7-2.1-3.2-5.3 1-.1 2.1-.2 3.2-.2s2.2.1 3.2.2c-.5 3.2-1.7 5.3-3.2 5.3Zm-8.5-9.5c0-1.5 2.1-2.7 5.3-3.2-.1 1-.2 2.1-.2 3.2s.1 2.2.2 3.2c-3.2-.5-5.3-1.7-5.3-3.2Zm8.5-9.5c1.5 0 2.7 2.1 3.2 5.3-1 .1-2.1.2-3.2.2s-2.2-.1-3.2-.2c.5-3.2 1.7-5.3 3.2-5.3Zm8.5 9.5c0 1.5-2.1 2.7-5.3 3.2.1-1 .2-2.1.2-3.2s-.1-2.2-.2-3.2c3.2.5 5.3 1.7 5.3 3.2Z" />
      </svg>
    ),
  },
  {
    name: 'Tailwind CSS',
    description: 'Styling',
    color: 'from-cyan-500 to-teal-500',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8Zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12Z" />
      </svg>
    ),
  },
  {
    name: 'TypeScript',
    description: 'Type Safety',
    color: 'from-blue-500 to-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0Zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201Zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375Z" />
      </svg>
    ),
  },
  {
    name: 'Zustand',
    description: 'State Management',
    color: 'from-amber-500 to-orange-500',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z" />
      </svg>
    ),
  },
  {
    name: 'html-to-image',
    description: 'Export Engine',
    color: 'from-green-500 to-emerald-500',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
      </svg>
    ),
  },
]

export const TechStackSection: React.FC = () => {
  return (
    <section className="relative min-h-screen py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-950 flex items-center overflow-hidden snap-start">
      {/* Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,_rgba(6,182,212,0.25),_transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_70%,_rgba(59,130,246,0.2),_transparent_65%)]" />
      </div>

      <div className="max-w-5xl mx-auto relative w-full">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/60 mb-6">
            Tecnologia
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Construído com as melhores ferramentas
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Stack moderno para performance e experiência de desenvolvedor
          </p>
        </div>

        {/* Tech grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="group relative p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 text-center"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <div className="scale-90 sm:scale-100">{tech.icon}</div>
              </div>

              {/* Name */}
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                {tech.name}
              </h3>
              <p className="text-white/40 text-xs sm:text-sm">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
