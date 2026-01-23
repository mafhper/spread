import React, { useState, useEffect } from 'react'
import {
  Maximize,
  Type,
  Layout,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Palette,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useCardStore } from '../../store/cardStore'
import { CardTabs } from './tabs/CardTabs'
import { MediaTabs } from './tabs/MediaTabs'
import { CanvasControls } from './tabs/CanvasControls'
import { TypographyTabs } from './tabs/TypographyTabs'
import { ColorTabs } from './tabs/ColorTabs'

type TabType = 'card' | 'colors' | 'media' | 'canvas' | 'text'

const TABS = [
  { id: 'card' as const, label: 'Card', icon: Layout },
  { id: 'colors' as const, label: 'Cores', icon: Palette },
  { id: 'media' as const, label: 'Mídia', icon: ImageIcon },
  { id: 'text' as const, label: 'Texto', icon: Type },
  { id: 'canvas' as const, label: 'Canvas', icon: Maximize },
]

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, updateField } = useCardStore()
  const [activeTab, setActiveTab] = useState<TabType>('card')
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sync local state with global store for desktop sidebar
  const isOpen = isSidebarOpen
  const setIsOpen = (val: boolean) => updateField('isSidebarOpen', val)

  // Auto-close on mobile only
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [isMobile])

  const renderTabContent = () => {
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
    }
  }

  // Mobile: Floating toggle button
  if (isMobile && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Menu size={24} />
      </button>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          role="presentation"
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          onKeyDown={e => e.key === 'Escape' && setIsOpen(false)}
        />
      )}

      {/* Desktop Layout - Sidebar + Toggle */}
      <div
        className={clsx(
          'h-full bg-black/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 shadow-2xl z-50',
          isMobile ? 'fixed left-0 top-0 w-80' : 'relative flex-shrink-0',
          !isMobile && (isOpen ? 'w-80' : 'w-0 overflow-hidden opacity-0')
        )}
      >
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {/* Tab Icons - Horizontal on top */}
        <div className="flex-shrink-0 flex items-center gap-1 p-3 border-b border-white/10 bg-black/50">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-1 py-3 rounded-xl flex items-center justify-center transition-all',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white/50 hover:bg-white/10 hover:text-white'
                )}
                title={tab.label}
              >
                <Icon size={18} />
              </button>
            )
          })}
        </div>

        {/* Tab Header */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            {React.createElement(TABS.find(t => t.id === activeTab)!.icon, {
              size: 16,
            })}
            {TABS.find(t => t.id === activeTab)?.label}
          </h3>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {renderTabContent()}
        </div>
      </div>

      {/* Desktop Toggle Button - Bottom aligned */}
      {!isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'absolute bottom-4 z-[60] p-2 rounded-r-xl bg-black/80 border border-l-0 border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 shadow-xl',
            isOpen ? 'left-80' : 'left-0'
          )}
          title={isOpen ? 'Recolher menu' : 'Personalizar'}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      )}
    </>
  )
}
