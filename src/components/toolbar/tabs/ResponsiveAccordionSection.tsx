import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

interface ResponsiveAccordionSectionProps {
  title: string
  summary: string
  children: React.ReactNode
  action?: React.ReactNode
  defaultMobileOpen?: boolean
}

export const ResponsiveAccordionSection: React.FC<
  ResponsiveAccordionSectionProps
> = ({ title, summary, children, action, defaultMobileOpen = false }) => {
  const [isCompactViewport, setIsCompactViewport] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(defaultMobileOpen)

  React.useEffect(() => {
    const syncViewportMode = () => setIsCompactViewport(window.innerWidth < 768)

    syncViewportMode()
    window.addEventListener('resize', syncViewportMode)

    return () => window.removeEventListener('resize', syncViewportMode)
  }, [])

  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
      {isCompactViewport ? (
        <button
          type="button"
          onClick={() => setIsOpen(current => !current)}
          className="w-full px-4 py-4 text-left flex items-start justify-between gap-3"
          aria-expanded={isOpen}
          aria-label={`${title} ${summary}`.trim()}
        >
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
              {title}
            </p>
            <p className="mt-1 text-xs text-white/55">{summary}</p>
          </div>
          <ChevronDown
            size={16}
            className={clsx(
              'mt-0.5 flex-none text-white/40 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      ) : (
        <div className="flex items-start justify-between gap-3 px-4 pt-4">
          <div className="min-w-0">
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
              {title}
            </h4>
            <p className="mt-1 text-xs text-white/45">{summary}</p>
          </div>
          {action}
        </div>
      )}

      {(isOpen || !isCompactViewport) && (
        <div
          className={clsx(
            'px-4 pb-4',
            isCompactViewport ? 'pt-1 border-t border-white/6' : 'pt-4'
          )}
        >
          {isCompactViewport && action ? (
            <div className="mb-3 flex justify-end">{action}</div>
          ) : null}
          {children}
        </div>
      )}
    </section>
  )
}
