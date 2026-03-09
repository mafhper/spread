import * as React from 'react'
import { useState, useEffect, lazy, Suspense } from 'react'
import {
  Maximize,
  Type,
  Layout,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Palette,
  RotateCcw,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useCardStore } from '../../store/cardStore'

const CardTabs = lazy(() =>
  import('./tabs/CardTabs').then(m => ({ default: m.CardTabs }))
)
const MediaTabs = lazy(() =>
  import('./tabs/MediaTabs').then(m => ({ default: m.MediaTabs }))
)
const CanvasControls = lazy(() =>
  import('./tabs/CanvasControls').then(m => ({ default: m.CanvasControls }))
)
const TypographyTabs = lazy(() =>
  import('./tabs/TypographyTabs').then(m => ({ default: m.TypographyTabs }))
)
const ColorTabs = lazy(() =>
  import('./tabs/ColorTabs').then(m => ({ default: m.ColorTabs }))
)

type TabType =
  | 'card'
  | 'colors'
  | 'media'
  | 'canvas'
  | 'text'
  | 'frame'
  | 'messages'

const TABS = [
  { id: 'canvas' as const, label: 'Formato', icon: Maximize },
  { id: 'media' as const, label: 'Imagem', icon: ImageIcon },
  { id: 'text' as const, label: 'Texto', icon: Type },
  { id: 'colors' as const, label: 'Cores', icon: Palette },
  { id: 'card' as const, label: 'Ajustes', icon: Layout },
]

const MOBILE_DOCK_HEIGHT = 88

const TabContent: React.FC<{ activeTab: TabType }> = ({ activeTab }) => {
  switch (activeTab) {
    case 'card':
      return <CardTabs />
    case 'colors':
      return <ColorTabs />
    case 'media':
      return <MediaTabs />
    case 'canvas':
      return <CanvasControls />
    case 'text':
      return <TypographyTabs />
    default:
      return null
  }
}

export const Sidebar: React.FC<{
  mobileViewportHeight?: number | null
  onMobileViewportReservationChange?: (height: number) => void
}> = ({ mobileViewportHeight = null, onMobileViewportReservationChange }) => {
  const {
    isSidebarOpen,
    updateField,
    resetCanvas,
    resetColors,
    resetTypography,
    resetCard,
    resetBackground,
    resetPhoto,
  } = useCardStore()
  const [activeTab, setActiveTab] = useState<TabType>('canvas')
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const [mobileSheetRatio, setMobileSheetRatio] = useState(0.62)
  const hasResolvedViewportRef = React.useRef(false)
  const dragStateRef = React.useRef<{
    pointerId: number
    startY: number
    startRatio: number
  } | null>(null)
  const contentScrollRef = React.useRef<HTMLDivElement>(null)
  const activeTabDef = TABS.find(tab => tab.id === activeTab) ?? TABS[0]

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isOpen = isSidebarOpen
  const setIsOpen = (value: boolean) => updateField('isSidebarOpen', value)

  useEffect(() => {
    if (!hasResolvedViewportRef.current) {
      hasResolvedViewportRef.current = true
      return
    }

    if (isMobile && isOpen) {
      setIsOpen(false)
    }
  }, [isMobile, isOpen])

  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0
    }
  }, [activeTab, isOpen])

  useEffect(() => {
    if (isMobile && isOpen) {
      setMobileSheetRatio(0.62)
    }
  }, [isMobile, isOpen])

  const renderTabContent = () => (
    <Suspense
      fallback={
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      }
    >
      <TabContent activeTab={activeTab} />
    </Suspense>
  )

  const handleResetActiveTab = () => {
    switch (activeTab) {
      case 'canvas':
        resetCanvas()
        return
      case 'colors':
        resetColors()
        return
      case 'text':
        resetTypography()
        return
      case 'card':
        resetCard()
        return
      case 'media':
        resetBackground()
        resetPhoto()
        return
      default:
        return
    }
  }

  const activeResetLabel = isMobile
    ? 'Resetar'
    : activeTab === 'media'
      ? 'Resetar Imagem'
      : `Resetar ${activeTabDef.label}`

  const resolveClampedSheetRatio = React.useCallback((ratio: number) => {
    const min = 0.5
    const max = 0.9
    return Math.min(max, Math.max(min, ratio))
  }, [])

  const getNearestSheetRatio = React.useCallback((ratio: number) => {
    const snapPoints = [0.5, 0.62, 0.76, 0.9]
    return snapPoints.reduce((nearest, current) =>
      Math.abs(current - ratio) < Math.abs(nearest - ratio) ? current : nearest
    )
  }, [])

  const resolvedMobileSheetHeight =
    isMobile && mobileViewportHeight != null
      ? Math.round(
          Math.min(
            Math.max(mobileViewportHeight * mobileSheetRatio, 360),
            mobileViewportHeight - 40
          )
        )
      : null

  const resolvedMobileContentHeight =
    resolvedMobileSheetHeight != null
      ? Math.max(resolvedMobileSheetHeight - MOBILE_DOCK_HEIGHT, 220)
      : null

  const handleSheetPointerMove = React.useCallback(
    (event: PointerEvent) => {
      if (!isMobile || mobileViewportHeight == null) return
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) return

      const deltaY = dragState.startY - event.clientY
      const ratioDelta = deltaY / mobileViewportHeight
      setMobileSheetRatio(
        resolveClampedSheetRatio(dragState.startRatio + ratioDelta)
      )
    },
    [isMobile, mobileViewportHeight, resolveClampedSheetRatio]
  )

  const handleSheetPointerEnd = React.useCallback(
    (event: PointerEvent) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) return

      dragStateRef.current = null
      window.removeEventListener('pointermove', handleSheetPointerMove)
      window.removeEventListener('pointerup', handleSheetPointerEnd)
      window.removeEventListener('pointercancel', handleSheetPointerEnd)

      if (!isMobile || mobileViewportHeight == null) return

      const deltaY = event.clientY - dragState.startY
      if (deltaY > mobileViewportHeight * 0.14) {
        setIsOpen(false)
        return
      }

      setMobileSheetRatio(current => getNearestSheetRatio(current))
    },
    [
      getNearestSheetRatio,
      handleSheetPointerMove,
      isMobile,
      mobileViewportHeight,
    ]
  )

  const handleSheetPointerStart = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isMobile || mobileViewportHeight == null) return

    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startRatio: mobileSheetRatio,
    }

    window.addEventListener('pointermove', handleSheetPointerMove)
    window.addEventListener('pointerup', handleSheetPointerEnd)
    window.addEventListener('pointercancel', handleSheetPointerEnd)
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleSheetPointerMove)
      window.removeEventListener('pointerup', handleSheetPointerEnd)
      window.removeEventListener('pointercancel', handleSheetPointerEnd)
    }
  }, [handleSheetPointerEnd, handleSheetPointerMove])

  useEffect(() => {
    if (onMobileViewportReservationChange == null) return

    if (!isMobile) {
      onMobileViewportReservationChange(0)
      return
    }

    onMobileViewportReservationChange(
      isOpen
        ? (resolvedMobileSheetHeight ?? MOBILE_DOCK_HEIGHT)
        : MOBILE_DOCK_HEIGHT
    )
  }, [
    isMobile,
    isOpen,
    onMobileViewportReservationChange,
    resolvedMobileSheetHeight,
  ])

  const renderMobileDock = () => (
    <div className="pointer-events-auto border-t border-white/10 bg-black/92 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="overflow-x-auto rounded-2xl border border-white/8 bg-black/65 px-2 py-1.5 scrollbar-hide">
        <div className="flex min-w-max items-center justify-center gap-2">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsOpen(true)
                }}
                className={clsx(
                  'flex h-11 w-11 flex-none items-center justify-center rounded-xl px-0 transition-all',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                )}
                title={tab.label}
                aria-label={tab.label}
                aria-selected={isActive}
                role="tab"
              >
                <Icon size={16} />
              </button>
            )
          })}
          <button
            onClick={handleResetActiveTab}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-0 text-red-200 transition-all hover:border-red-400/35 hover:bg-red-500/15"
            title={activeResetLabel}
            aria-label={activeResetLabel}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        {isOpen && (
          <div
            className="pointer-events-auto mx-auto flex w-full flex-col overflow-hidden rounded-t-[1.5rem] border border-b-0 border-white/10 bg-black/95 shadow-[0_-18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300"
            style={
              resolvedMobileContentHeight != null
                ? { height: `${resolvedMobileContentHeight}px` }
                : undefined
            }
            aria-label="Barra lateral de personalização"
          >
            <div className="flex-shrink-0 border-b border-white/10 bg-black/92 px-4 pt-2 pb-2">
              <div
                className="relative flex min-h-[34px] items-center justify-center"
                onPointerDown={handleSheetPointerStart}
                style={{ touchAction: 'none' }}
              >
                <div className="h-1.5 w-10 rounded-full bg-white/18" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-0 top-1/2 flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-xl p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Fechar menu lateral"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div
              ref={contentScrollRef}
              className="flex-1 overflow-y-auto px-3 pb-2 pt-2 scrollbar-hide"
            >
              {renderTabContent()}
            </div>
          </div>
        )}

        {renderMobileDock()}
      </div>
    )
  }

  return (
    <>
      <div
        className={clsx(
          'relative z-50 flex h-full flex-shrink-0 flex-col border-r border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl transition-all duration-300',
          isOpen ? 'w-80' : 'w-0 overflow-hidden opacity-0'
        )}
        aria-label="Barra lateral de personalização"
      >
        <div className="flex-shrink-0 border-b border-white/10 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            {React.createElement(activeTabDef.icon, { size: 16 })}
            {activeTabDef.label}
          </h3>
        </div>

        <div
          ref={contentScrollRef}
          className="custom-scrollbar flex-1 overflow-y-auto p-4 pb-6"
        >
          {renderTabContent()}
        </div>

        <div className="flex-shrink-0 border-t border-white/10 bg-black/88 px-3 py-2">
          <button
            onClick={handleResetActiveTab}
            className="flex w-full min-h-[34px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/70 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200"
          >
            <RotateCcw size={13} />
            <span>{activeResetLabel}</span>
          </button>

          <div className="mt-2 overflow-hidden rounded-xl border border-white/8 bg-black/65 p-2">
            <div className="grid w-full grid-cols-5 gap-1.5">
              {TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[9px] font-medium transition-all',
                      isActive
                        ? 'bg-white text-black'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    )}
                    title={tab.label}
                    aria-label={tab.label}
                    aria-selected={isActive}
                    role="tab"
                  >
                    <Icon size={16} />
                    <span className="max-w-full whitespace-normal text-center leading-[1.05]">
                      {tab.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {!isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'absolute bottom-4 z-[60] flex min-h-[44px] min-w-[44px] items-center justify-center rounded-r-xl border border-l-0 border-white/20 bg-black/80 p-2 text-white shadow-xl transition-all duration-300 hover:bg-white hover:text-black',
            isOpen ? 'left-80' : 'left-0'
          )}
          title={isOpen ? 'Recolher menu' : 'Personalizar'}
          aria-label={
            isOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'
          }
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      )}
    </>
  )
}
