import * as React from 'react'
import { clsx } from 'clsx'
import { ResponsiveAccordionSection } from './ResponsiveAccordionSection'

export interface ResponsiveSectionDeckItem {
  id: string
  title: string
  summary: string
  content: React.ReactNode
  action?: React.ReactNode
  summaryClassName?: string
  defaultMobile?: boolean
}

interface ResponsiveSectionDeckProps {
  sections: ResponsiveSectionDeckItem[]
}

export const ResponsiveSectionDeck: React.FC<ResponsiveSectionDeckProps> = ({
  sections,
}) => {
  const [isCompactViewport, setIsCompactViewport] = React.useState(false)
  const defaultSectionId =
    sections.find(section => section.defaultMobile)?.id ?? sections[0]?.id ?? ''
  const [activeSectionId, setActiveSectionId] =
    React.useState<string>(defaultSectionId)

  React.useEffect(() => {
    const syncViewportMode = () => setIsCompactViewport(window.innerWidth < 768)

    syncViewportMode()
    window.addEventListener('resize', syncViewportMode)

    return () => window.removeEventListener('resize', syncViewportMode)
  }, [])

  React.useEffect(() => {
    if (!sections.some(section => section.id === activeSectionId)) {
      setActiveSectionId(defaultSectionId)
    }
  }, [activeSectionId, defaultSectionId, sections])

  if (!isCompactViewport) {
    return (
      <div className="space-y-4">
        {sections.map(section => (
          <ResponsiveAccordionSection
            key={section.id}
            title={section.title}
            summary={section.summary}
            summaryClassName={section.summaryClassName}
            action={section.action}
            defaultMobileOpen={section.defaultMobile}
          >
            {section.content}
          </ResponsiveAccordionSection>
        ))}
      </div>
    )
  }

  const activeSection =
    sections.find(section => section.id === activeSectionId) ?? sections[0]

  if (!activeSection) {
    return null
  }

  return (
    <div className="space-y-2.5">
      <div className="-mx-3 overflow-x-auto px-3 scrollbar-hide">
        <div className="flex min-w-max gap-1.5 pr-10">
          {sections.map(section => {
            const isActive = section.id === activeSection.id

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSectionId(section.id)}
                className={clsx(
                  'flex-none rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all',
                  isActive
                    ? 'border-white/10 bg-white text-black'
                    : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white'
                )}
                aria-pressed={isActive}
              >
                {section.title}
              </button>
            )
          })}
        </div>
      </div>

      <section className="rounded-2xl border border-white/8 bg-white/[0.025] shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        {activeSection.action && (
          <div className="flex justify-end px-2.5 pt-2.5">
            {activeSection.action}
          </div>
        )}
        <div className="px-2.5 pt-2 pb-2.5">{activeSection.content}</div>
      </section>
    </div>
  )
}
