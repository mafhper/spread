/**
 * Projects and Footer Component - Combined final section
 *
 * Displays other projects grid and the site footer in a single snap-start section.
 */

import React from 'react'
import { ExternalLink, Heart, Github } from 'lucide-react'

const projects = [
  {
    name: 'PersonalNews',
    description: 'Seu feed de notícias pessoal e customizável',
    url: 'https://mafhper.github.io/personalnews',
    githubUrl: 'https://github.com/mafhper/personalnews',
    image: '/spread/assets/personal-news.png',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'AuraWall',
    description: 'Wallpapers generativos com estética única',
    url: 'https://mafhper.github.io/aurawall',
    githubUrl: 'https://github.com/mafhper/aurawall',
    image: '/spread/assets/aurawall.png',
    gradient: 'from-purple-500 to-pink-500',
  },
]

export const ProjectsAndFooter: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 bg-zinc-950 overflow-hidden snap-start flex flex-col">
      {/* Background elements for continuity */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-zinc-950" />
      </div>

      <div className="max-w-5xl mx-auto relative w-full pt-20 pb-12 sm:pt-32 sm:pb-16 flex-grow">
        {/* Other projects heading */}
        <div className="text-center mb-10 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Conheça outros projetos
          </h3>
          <p className="text-white/40 font-medium">
            Mais ferramentas criadas com o mesmo carinho
          </p>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-20 sm:mb-32">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group relative flex flex-col rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden shadow-2xl hover:-translate-y-1"
            >
              {/* Card Image Container - Links to App */}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video overflow-hidden block"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                />
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* External Link Icon Overlay */}
                <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/50 group-hover:text-white transition-colors border border-white/10">
                  <ExternalLink size={18} />
                </div>
              </a>

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
                    {project.name}
                  </h4>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/20 hover:text-white transition-colors p-1 bg-white/5 rounded-lg border border-transparent hover:border-white/10"
                    title="Ver código no GitHub"
                    onClick={e => e.stopPropagation()}
                  >
                    <Github size={18} />
                  </a>
                </div>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  {project.description}
                </p>

                {/* Explicit Live Link */}
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors pointer-events-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <span>Acessar aplicação</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Hover Bottom Border */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${project.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
              />
            </div>
          ))}
        </div>

        {/* Footer Content */}
        <footer className="pt-12 border-t border-white/5">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <img
                  src="/spread/logo.svg"
                  alt=""
                  className="w-6 h-6 opacity-90 invert brightness-0"
                />
              </div>
              <span className="font-black text-xl text-white">Spread</span>
            </div>
            <p className="text-white/40 text-sm italic">
              Visualizações elegantes de links
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <a
              href="https://github.com/mafhper/spread"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors px-3 py-1 bg-white/5 rounded-full border border-white/5 hover:border-violet-500/30"
            >
              GitHub
            </a>
            <a
              href="https://github.com/mafhper/spread/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors px-3 py-1 bg-white/5 rounded-full border border-white/5 hover:border-violet-500/30"
            >
              Licença MIT
            </a>
            <a
              href="https://github.com/mafhper/spread/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors px-3 py-1 bg-white/5 rounded-full border border-white/5 hover:border-violet-500/30"
            >
              Contribuir
            </a>
          </div>

          <div className="text-center text-white/20 text-xs sm:text-sm">
            <p className="flex items-center justify-center gap-1.5">
              Feito com{' '}
              <Heart
                size={14}
                className="text-red-500 fill-red-500 animate-pulse"
              />{' '}
              por
              <a
                href="https://github.com/mafhper"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors font-medium decoration-violet-500/50 hover:underline"
              >
                mafhper
              </a>
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-widest opacity-50">
              © {currentYear} Spread
            </p>
          </div>
        </footer>
      </div>
    </section>
  )
}
