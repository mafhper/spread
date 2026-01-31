/**
 * Card Store - Estado Global do Editor Spread
 *
 * Gerencia o estado persistente do card com suporte a:
 * - Persistencia seletiva (apenas preferencias de design)
 * - Reset adequado para formato "Auto"
 * - Versionamento para invalidar cache antigo
 * - Frame Mode: presets visuais para cards personalizados
 *
 * @version 3.2.0 - Sistema SVG unificado
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// import type { FrameState, TemplateId } from '../types/frame'
// import { DEFAULT_FRAME_STATE } from '../types/frame'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FrameState = any
type TemplateId = string

const DEFAULT_FRAME_STATE = {
  enabled: false,
  templateId: 'none',
  primaryColor: '#6366f1',
  secondaryColor: '#a855f7',
  textStyle: 'modern',
  showText: true,
} as any // eslint-disable-line @typescript-eslint/no-explicit-any

export interface CardState {
  // Metadata
  url: string
  title: string
  description: string
  author: string
  image: string | null
  favicon: string | null
  domain: string
  template: 'default' | 'music' | 'news'
  isWelcomeState: boolean

  // Customization - Colors
  colors: {
    bg1: string
    bg2: string
    text: string
  }
  gradientStyle: string
  pattern: 'none' | 'dots' | 'grid' | 'noise' | 'lines' | 'diagonal' | 'mesh'
  patternOpacity: number
  patternScale: number
  customBgImage: string | null
  extractedColors: { bg1: string; bg2: string } | null

  // Customization - Layout
  layout: {
    aspectRatio: string
    imagePosition: string
    imageFit: 'cover' | 'contain'
    imageScale: number
    outerRadius: number
    innerRadius: number
    padding: number
    paddingAuto: boolean
    opacity: number
    shadowOffsetX: number
    shadowOffsetY: number
    shadowBlur: number
    shadowSpread: number
    shadowColor: string
    shadowOpacity: number
    backdropBlur: number
    cardScale: number
    // Auto sizing flag for card: when true, the card scales to fit the canvas
    // or to the current viewport when the canvas is auto.
    cardAuto: boolean
    imageOffsetX: number
    imageOffsetY: number
    cardAspectRatio: string
    showHeader: boolean
    headerPosition: 'left' | 'right'
    measuredCardHeight?: number
  }

  // Canvas Size
  canvasSize: {
    width: number
    height: number
    preset: string
    roundness: number
  }
  // Viewport available area for the editor (width/height in px)
  viewport: {
    width: number
    height: number
  }
  cardPosition: {
    x: number
    y: number
  }
  isSidebarOpen: boolean

  // Customization - Typography
  fontFamily: string
  titleSize: number
  subtitleSize: number
  textAlign: 'left' | 'center' | 'right'

  activeTab: 'card' | 'photo' | 'canvas' | 'text' | 'frame'
  isExporting: boolean
  exportScale?: number
  uiScale?: number
  calculateExportScale?: (preset: string) => number
  isHydrated: boolean

  // Frame Mode
  frame: FrameState

  // Actions
  setHydrated: (state: boolean) => void
  updateField: (field: string, value: unknown) => void
  updateNestedField: <T extends keyof CardState>(
    section: T,
    field: string,
    value: unknown
  ) => void
  updateLayout: (field: string, value: unknown) => void
  reset: () => void
  setFullState: (state: Partial<CardState>) => void
  setActiveTab: (tab: 'card' | 'photo' | 'canvas' | 'text') => void
  resetContent: () => void
  resetCard: () => void
  resetPhoto: () => void
  resetColors: () => void
  resetBackground: () => void
  resetTypography: () => void
  resetCanvas: () => void
  updateFrame: (field: string, value: unknown) => void
  resetFrame: () => void
  resetToDefaults: () => void

  // Frame template action
  setTemplate: (templateId: TemplateId) => void
}

const DEFAULT_STATE = {
  url: '',
  title: 'Spread - Crie Visualizacoes de Links que Impressionam',
  description:
    'Gere cards lindos para suas redes sociais a partir de qualquer link. Cole a URL e veja a magica acontecer.',
  author: 'Spread App',
  image:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
  favicon:
    'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/zap.svg',
  domain: 'spread.app',
  template: 'default' as const,
  isWelcomeState: true,

  colors: {
    bg1: '#0f172a',
    bg2: '#c084fc',
    text: '#ffffff',
  },
  gradientStyle: '135deg',
  pattern: 'none' as const,
  patternOpacity: 0.1,
  patternScale: 1,
  customBgImage: null,
  extractedColors: null,

  layout: {
    aspectRatio: 'aspect-auto',
    imagePosition: 'object-center',
    imageFit: 'cover' as const,
    imageScale: 1,
    outerRadius: 0,
    innerRadius: 12,
    padding: 6,
    paddingAuto: true,
    opacity: 0.5,
    shadowOffsetX: 0,
    shadowOffsetY: 25,
    shadowBlur: 50,
    shadowSpread: -12,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    backdropBlur: 0,
    cardScale: 1,
    // When true, card size automatically adapts to the selected canvas size and padding
    // Override manual Card Scale in the rendering pipeline
    cardAuto: false,
    imageOffsetX: 0,
    imageOffsetY: 0,
    cardAspectRatio: 'aspect-auto',
    showHeader: true,
    headerPosition: 'right' as const,
    measuredCardHeight: 360,
  },
  viewport: {
    width: 0,
    height: 0,
  },

  canvasSize: {
    width: 1200,
    height: 630,
    preset: 'auto',
    roundness: 0,
  },
  cardPosition: {
    x: 0,
    y: 0,
  },
  isSidebarOpen: false,

  fontFamily: 'Inter',
  titleSize: 100,
  subtitleSize: 100,
  textAlign: 'left' as const,
  activeTab: 'canvas' as const,
  isExporting: false,
  isHydrated: false,

  // Frame Mode
  frame: DEFAULT_FRAME_STATE,
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setHydrated: state => set({ isHydrated: state }),

      updateField: (field, value) =>
        set(state => ({ ...state, [field]: value })),

      updateNestedField: <T extends keyof CardState>(
        section: T,
        field: string,
        value: unknown
      ) => {
        set(state => {
          // Safe access to section - validate it exists in state
          if (!Object.prototype.hasOwnProperty.call(state, section)) {
            return state
          }
          // Safe: section is validated above with hasOwnProperty check
          // eslint-disable-next-line security/detect-object-injection
          const sectionData = state[section] as Record<string, unknown>

          // Avoid redundant updates
          // eslint-disable-next-line security/detect-object-injection
          if (JSON.stringify(sectionData[field]) === JSON.stringify(value)) {
            return state
          }

          console.log(`[Store] Updating ${String(section)}.${field}:`, value)
          return {
            ...state,
            [section]: {
              ...sectionData,
              [field]: value,
            },
          }
        })
      },

      updateLayout: (field, value) => {
        console.log(`[Store] Updating layout.${field}:`, value)
        set(state => ({
          ...state,
          layout: { ...state.layout, [field]: value },
        }))
      },

      updateFrame: (field: string, value: unknown) => {
        console.log(`[Store] Updating frame.${field}:`, value)
        set(state => ({
          ...state,
          frame: { ...state.frame, [field]: value },
        }))
      },

      /**
       * HIERARQUIA DE TAMANHOS E ESCALAS (Spread Engine)
       * ---
       * 1. Canvas (canvasSize): O container final da imagem.
       * 2. Card (layout.cardScale): Escala manual do card (usuario).
       * 3. Viewport (autoScale): Escala automatica para caber na tela (nao persistida).
       * 4. Export (exportScale): Multiplicador final no momento do download.
       *
       * TOTAL_SCALE = cardScale * exportScale (* autoScale se em modo Auto)
       */
      calculateExportScale: () => {
        const es = get().exportScale ?? 1
        const cs = get().layout.cardScale ?? 1
        return es * cs
      },

      resetContent: () =>
        set({
          url: '',
          title: DEFAULT_STATE.title,
          description: DEFAULT_STATE.description,
          author: DEFAULT_STATE.author,
          image: DEFAULT_STATE.image,
          favicon: DEFAULT_STATE.favicon,
          domain: DEFAULT_STATE.domain,
          isWelcomeState: true,
          template: 'default',
          activeTab: 'canvas',
          frame: DEFAULT_FRAME_STATE, // Reset frame on new content
        }),

      resetToDefaults: () =>
        set(state => ({
          ...state,
          // Reset card geometry to auto
          layout: {
            ...state.layout,
            cardAuto: true,
            paddingAuto: true,
            cardScale: 1,
            imageScale: 1,
            imageOffsetX: 0,
            imageOffsetY: 0,
            cardAspectRatio: 'aspect-auto',
            aspectRatio: 'aspect-auto',
            showHeader: true,
            headerPosition: 'right',
          },
          // Reset canvas to auto
          canvasSize: {
            ...state.canvasSize,
            preset: 'auto',
          },
          // Reset frame mode
          frame: DEFAULT_FRAME_STATE,
          // Reset typography scales
          titleSize: 100,
          subtitleSize: 100,
          textAlign: 'left',
        })),

      setActiveTab: tab => set({ activeTab: tab }),
      setFullState: stateUpdate =>
        set(state => ({
          ...state,
          ...stateUpdate,
          // Deep merge specifically for layout and colors if they exist in stateUpdate
          layout: stateUpdate.layout
            ? { ...state.layout, ...stateUpdate.layout }
            : state.layout,
          colors: stateUpdate.colors
            ? { ...state.colors, ...stateUpdate.colors }
            : state.colors,
        })),

      reset: () =>
        set(state => ({
          ...DEFAULT_STATE,
          isHydrated: state.isHydrated,
          activeTab: state.activeTab,
          isWelcomeState: state.isWelcomeState,
          isSidebarOpen: state.isSidebarOpen,
          // Mantem apenas metadados se houver (para nao limpar o link)
          url: state.url,
          title: state.title,
          description: state.description,
          author: state.author,
          image: state.image,
          favicon: state.favicon,
          domain: state.domain,
        })),

      resetCanvas: () =>
        set(state => ({
          ...state,
          canvasSize: DEFAULT_STATE.canvasSize,
          cardPosition: DEFAULT_STATE.cardPosition,
        })),

      resetColors: () =>
        set(state => ({
          ...state,
          colors: state.extractedColors
            ? {
                ...state.colors,
                bg1: state.extractedColors.bg1,
                bg2: state.extractedColors.bg2,
              }
            : DEFAULT_STATE.colors,
        })),

      resetBackground: () =>
        set(state => ({
          ...state,
          gradientStyle: DEFAULT_STATE.gradientStyle,
          pattern: DEFAULT_STATE.pattern,
          patternOpacity: DEFAULT_STATE.patternOpacity,
          patternScale: DEFAULT_STATE.patternScale,
          customBgImage: DEFAULT_STATE.customBgImage,
        })),

      resetTypography: () =>
        set(state => ({
          ...state,
          fontFamily: DEFAULT_STATE.fontFamily,
          titleSize: DEFAULT_STATE.titleSize,
          subtitleSize: DEFAULT_STATE.subtitleSize,
          textAlign: DEFAULT_STATE.textAlign,
        })),

      resetCard: () =>
        set(state => ({
          ...state,
          layout: {
            ...state.layout,
            innerRadius: DEFAULT_STATE.layout.innerRadius,
            padding: DEFAULT_STATE.layout.padding,
            opacity: DEFAULT_STATE.layout.opacity,
            shadowOffsetX: DEFAULT_STATE.layout.shadowOffsetX,
            shadowOffsetY: DEFAULT_STATE.layout.shadowOffsetY,
            shadowBlur: DEFAULT_STATE.layout.shadowBlur,
            shadowSpread: DEFAULT_STATE.layout.shadowSpread,
            shadowColor: DEFAULT_STATE.layout.shadowColor,
            shadowOpacity: DEFAULT_STATE.layout.shadowOpacity,
            backdropBlur: DEFAULT_STATE.layout.backdropBlur,
            cardScale: DEFAULT_STATE.layout.cardScale,
            cardAspectRatio: DEFAULT_STATE.layout.cardAspectRatio,
            showHeader: DEFAULT_STATE.layout.showHeader,
            headerPosition: DEFAULT_STATE.layout.headerPosition,
          },
        })),

      resetPhoto: () =>
        set(state => ({
          ...state,
          layout: {
            ...state.layout,
            aspectRatio: DEFAULT_STATE.layout.aspectRatio,
            imagePosition: DEFAULT_STATE.layout.imagePosition,
            imageFit: DEFAULT_STATE.layout.imageFit,
            imageScale: DEFAULT_STATE.layout.imageScale,
            imageOffsetX: DEFAULT_STATE.layout.imageOffsetX,
            imageOffsetY: DEFAULT_STATE.layout.imageOffsetY,
          },
        })),

      resetFrame: () =>
        set(state => ({
          ...state,
          frame: DEFAULT_FRAME_STATE,
        })),

      // Frame template action
      setTemplate: (templateId: TemplateId) => {
        console.log(`[Store] Setting template: ${templateId}`)
        set(state => ({
          ...state,
          frame: { ...state.frame, templateId },
        }))
      },
    }),
    {
      name: 'spread-preferences-v4', // VERSAO ATUALIZADA - Sistema SVG unificado
      partialize: state => ({
        // Persiste APENAS preferencias de design, NAO conteudo ou modo de frame
        colors: state.colors,
        gradientStyle: state.gradientStyle,
        pattern: state.pattern,
        patternOpacity: state.patternOpacity,
        patternScale: state.patternScale,
        fontFamily: state.fontFamily,
        titleSize: state.titleSize,
        subtitleSize: state.subtitleSize,
        textAlign: state.textAlign,
        layout: state.layout,
        viewport: state.viewport,
        canvasSize: state.canvasSize,
        cardPosition: state.cardPosition,
        exportScale: state.exportScale,
        uiScale: state.uiScale,
        // Frame: persist ONLY style preferences, NOT enabled state or templateId
        frame: state.frame
          ? {
              primaryColor: state.frame.primaryColor,
              secondaryColor: state.frame.secondaryColor,
              textStyle: state.frame.textStyle,
            }
          : {
              primaryColor: '#6366f1',
              secondaryColor: '#a855f7',
              textStyle: 'modern',
            },
        // isExporting is EXCLUDED from persistence
      }),
      merge: (persistedStateValue: unknown, currentState) => {
        const persistedState = persistedStateValue as Partial<CardState> | null

        // Remove campos de conteudo do merge
        const {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          url,
          title,
          description,
          author,
          image,
          favicon,
          domain,
          template,
          isWelcomeState,
          activeTab,
          /* eslint-enable @typescript-eslint/no-unused-vars */
          ...sanitizedPersistedState
        } = (persistedState || {}) as Record<string, unknown>

        // Merge seguro
        return {
          ...currentState,
          ...sanitizedPersistedState,
        }
      },
    }
  )
)
