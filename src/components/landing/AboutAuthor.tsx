import { ExternalLink, Heart, Globe } from 'lucide-react'

export const AboutAuthor: React.FC = () => {
  return (
    <section
      id="sobre"
      className="relative min-h-screen py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-950 flex items-center overflow-hidden snap-start"
    >
      {/* Harmonious Transition Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-950/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,_rgba(217,70,239,0.25),_transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,_rgba(236,72,153,0.2),_transparent_65%)]" />
      </div>

      <div className="max-w-4xl mx-auto relative w-full">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/60 mb-6">
            Sobre
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Web aberta e acessível
          </h2>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Acredito em uma web <span className="text-white/90">livre</span>,
            enriquecida com aplicações feitas com{' '}
            <Heart className="inline w-5 h-5 text-red-400 fill-red-400 mx-1" />{' '}
            carinho. Ferramentas simples que resolvem problemas reais.
          </p>
        </div>

        {/* Authors Profile */}
        <div className="flex flex-col items-center mb-10 sm:mb-12">
          <div className="relative group mb-6">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <img
              src="https://github.com/mafhper.png"
              alt="mafhper"
              className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-full border-2 border-white/10 shadow-2xl"
            />
          </div>
          <h3 className="text-2xl font-black text-white mb-1">mafhper</h3>
          <p className="text-white/40 font-medium">Full Stack & UI Designer</p>
        </div>

        {/* Philosophy card */}
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-12 mb-12 shadow-2xl ring-1 ring-white/5">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
              <Globe size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Código aberto, sempre
              </h3>
              <p className="text-white/50 leading-relaxed mb-4">
                Todos os meus projetos são open source. Você pode explorar o
                código, contribuir, fazer fork, ou simplesmente aprender. A web
                é de todos.
              </p>
              <a
                href="https://github.com/mafhper"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Ver perfil no GitHub
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
