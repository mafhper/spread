/**
 * GitHub Activity Section - Displays recent commits
 *
 * Uses static data for build efficiency as requested by the user.
 */

import React, { memo } from 'react'
import { GitCommit, ExternalLink, Calendar } from 'lucide-react'

const commits = [
  {
    message: 'feat: implement modern landing page with mobile-first design',
    date: '2026-01-23',
    hash: 'a1b2c3d',
    author: 'mafhper',
  },
  {
    message: 'fix: mobile UX and download button positioning',
    date: '2026-01-23',
    hash: 'e4f5g6h',
    author: 'mafhper',
  },
  {
    message: 'refactor: restructure SpreadEditor for conditional rendering',
    date: '2026-01-23',
    hash: 'i7j8k9l',
    author: 'mafhper',
  },
  {
    message: 'perf: optimize image loading and animations',
    date: '2026-01-22',
    hash: 'm0n1o2p',
    author: 'mafhper',
  },
]

const GitHubActivityBase: React.FC = () => {
  const [data, setData] = React.useState(commits)

  React.useEffect(() => {
    fetch('https://api.github.com/repos/mafhper/spread/commits?per_page=4')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formatted = json.map((item: any) => ({
            message: item.commit.message.split('\n')[0], // Only first line
            date: new Date(item.commit.author.date).toISOString().split('T')[0],
            hash: item.sha.substring(0, 7),
            author: item.commit.author.name,
          }))
          setData(formatted)
        }
      })
      .catch(err => console.error('Failed to fetch commits:', err))
  }, [])

  return (
    <section className="relative min-h-screen py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-950 flex items-center overflow-hidden snap-start">
      {/* Harmonious Transition Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/30 to-indigo-900/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_rgba(99,102,241,0.25),_transparent_70%)]" />
      </div>

      <div className="max-w-4xl mx-auto relative w-full">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/60 mb-6">
            Desenvolvimento
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Últimas Atualizações
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Acompanhe o desenvolvimento do projeto diretamente do GitHub
          </p>
        </div>

        {/* Commit list */}
        <div className="space-y-4">
          {data.map((commit, index) => (
            <div
              key={index}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all duration-300"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <GitCommit size={20} />
                </div>
                <div>
                  <p className="text-white font-medium line-clamp-1 group-hover:text-violet-300 transition-colors">
                    {commit.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/30 flex items-center gap-1">
                      <Calendar size={12} />
                      {commit.date}
                    </span>
                    <span className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-white/40">
                      {commit.hash}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                <span className="text-sm text-white/30">
                  by{' '}
                  <span className="text-white/60 font-medium">
                    {commit.author}
                  </span>
                </span>
                <a
                  href={`https://github.com/mafhper/spread/commit/${commit.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* GitHub CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://github.com/mafhper/spread"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all"
          >
            Ver Repositório Completo
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}

export const GitHubActivity = memo(GitHubActivityBase)
