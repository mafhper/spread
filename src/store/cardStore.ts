/**
 * Card Store - Estado Global do Editor Spread
 * 
 * Gerencia o estado persistente do card com suporte a:
 * - Persistência seletiva (apenas preferências de design)
 * - Reset adequado para formato "Auto"
 * - Versionamento para invalidar cache antigo
 * 
 * @version 3.0.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CardState {
  // Metadata
  url: string;
  title: string;
  description: string;
  author: string;
  image: string | null;
  favicon: string | null;
  domain: string;
  template: 'default' | 'music' | 'news';
  isWelcomeState: boolean;
  
  // Customization - Colors
  colors: {
    bg1: string;
    bg2: string;
    text: string;
  };
  gradientStyle: string;
  pattern: 'none' | 'dots' | 'grid' | 'noise' | 'lines' | 'diagonal' | 'mesh';
  patternOpacity: number;
  patternScale: number;
  customBgImage: string | null;
  extractedColors: { bg1: string; bg2: string } | null;
  
  // Customization - Layout
  layout: {
    aspectRatio: string;
    imagePosition: string;
    imageFit: 'cover' | 'contain';
    imageScale: number;
    outerRadius: number;
    innerRadius: number;
    padding: number;
    opacity: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
    shadowSpread: number;
    shadowColor: string;
    shadowOpacity: number;
    backdropBlur: number;
    cardScale: number;
    imageOffsetX: number;
    imageOffsetY: number;
    cardAspectRatio: string;
    showHeader: boolean;
    headerPosition: 'left' | 'right';
  };
  
  // Canvas Size
  canvasSize: {
    width: number;
    height: number;
    preset: string;
    roundness: number;
  };
  cardPosition: {
    x: number;
    y: number;
  };
  isSidebarOpen: boolean;
  
  // Customization - Typography
  fontFamily: string;
  titleSize: number;
  subtitleSize: number;
  textAlign: 'left' | 'center' | 'right';
  
  activeTab: 'card' | 'photo' | 'canvas' | 'text';
  isExporting: boolean;
  
  // Actions
  updateField: (field: string, value: unknown) => void;
  updateNestedField: <T extends keyof CardState>(section: T, field: string, value: unknown) => void;
  updateLayout: (field: string, value: unknown) => void;
  reset: () => void;
  setFullState: (state: Partial<CardState>) => void;
  setActiveTab: (tab: 'card' | 'photo' | 'canvas' | 'text') => void;
  resetContent: () => void;
  resetCard: () => void;
  resetPhoto: () => void;
  resetColors: () => void;
  resetBackground: () => void;
  resetTypography: () => void;
  resetCanvas: () => void;
}

const DEFAULT_STATE = {
  url: '',
  title: 'Spread - Crie Visualizações de Links que Impressionam',
  description: 'Gere cards lindos para suas redes sociais a partir de qualquer link. Cole a URL e veja a mágica acontecer.',
  author: 'Spread App',
  image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
  favicon: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/zap.svg',
  domain: 'spread.app',
  template: 'default' as const,
  isWelcomeState: true,
  
  colors: {
    bg1: '#0f172a',
    bg2: '#c084fc',
    text: '#ffffff'
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
    opacity: 0.5,
    shadowOffsetX: 0,
    shadowOffsetY: 25,
    shadowBlur: 50,
    shadowSpread: -12,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    backdropBlur: 0,
    cardScale: 1,
    imageOffsetX: 0,
    imageOffsetY: 0,
    cardAspectRatio: 'aspect-auto',
    showHeader: true,
    headerPosition: 'right' as const
  },
  
  canvasSize: {
    width: 1200,
    height: 630,
    preset: 'auto',
    roundness: 0
  },
  cardPosition: {
    x: 0,
    y: 0
  },
  isSidebarOpen: false,
  
  fontFamily: 'Inter',
  titleSize: 100,
  subtitleSize: 100,
  textAlign: 'left' as const,
  activeTab: 'card' as const,
  isExporting: false
};

export const useCardStore = create<CardState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      
      updateField: (field, value) => set((state) => ({ ...state, [field]: value })),
      
      updateNestedField: (section, field, value) => {
        console.log(`[Store] Updating ${section}.${field}:`, value);
        set((state) => ({
          ...state,
          [section]: {
            ...(state[section as keyof CardState] as object),
            [field]: value
          }
        }));
      },

      updateLayout: (field, value) => {
        console.log(`[Store] Updating layout.${field}:`, value);
        set((state) => ({
          ...state,
          layout: { ...state.layout, [field]: value }
        }));
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      resetContent: () => set({
        url: '',
        title: DEFAULT_STATE.title,
        description: DEFAULT_STATE.description,
        author: DEFAULT_STATE.author,
        image: DEFAULT_STATE.image,
        favicon: DEFAULT_STATE.favicon,
        domain: DEFAULT_STATE.domain,
        isWelcomeState: true,
        template: 'default',
        activeTab: 'card'
      }),

      setFullState: (stateUpdate) => set((state) => ({ 
        ...state, 
        ...stateUpdate,
        // Deep merge specifically for layout and colors if they exist in stateUpdate
        layout: stateUpdate.layout ? { ...state.layout, ...stateUpdate.layout } : state.layout,
        colors: stateUpdate.colors ? { ...state.colors, ...stateUpdate.colors } : state.colors,
      })),
      
      reset: () => set({
        ...DEFAULT_STATE,
        colors: {
          bg1: '#2e1065',
          bg2: '#be185d',
          text: '#ffffff'
        }
      }),

      resetCanvas: () => set((state) => ({
        ...state,
        canvasSize: DEFAULT_STATE.canvasSize,
        cardPosition: DEFAULT_STATE.cardPosition
      })),

      resetColors: () => set((state) => ({
        ...state,
        colors: state.extractedColors 
          ? { ...state.colors, bg1: state.extractedColors.bg1, bg2: state.extractedColors.bg2 }
          : DEFAULT_STATE.colors
      })),

      resetBackground: () => set((state) => ({
        ...state,
        gradientStyle: DEFAULT_STATE.gradientStyle,
        pattern: DEFAULT_STATE.pattern,
        patternOpacity: DEFAULT_STATE.patternOpacity,
        patternScale: DEFAULT_STATE.patternScale,
        customBgImage: DEFAULT_STATE.customBgImage
      })),

      resetTypography: () => set((state) => ({
        ...state,
        fontFamily: DEFAULT_STATE.fontFamily,
        titleSize: DEFAULT_STATE.titleSize,
        subtitleSize: DEFAULT_STATE.subtitleSize,
        textAlign: DEFAULT_STATE.textAlign
      })),

      resetCard: () => set((state) => ({
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
          headerPosition: DEFAULT_STATE.layout.headerPosition
        }
      })),

      resetPhoto: () => set((state) => ({
        ...state,
        layout: {
          ...state.layout,
          aspectRatio: DEFAULT_STATE.layout.aspectRatio,
          imagePosition: DEFAULT_STATE.layout.imagePosition,
          imageFit: DEFAULT_STATE.layout.imageFit,
          imageScale: DEFAULT_STATE.layout.imageScale,
          imageOffsetX: DEFAULT_STATE.layout.imageOffsetX,
          imageOffsetY: DEFAULT_STATE.layout.imageOffsetY
        }
      }))
    }),
    {
      name: 'spread-preferences-v3', // 🔥 VERSÃO ATUALIZADA - Invalida cache antigo
      partialize: (state) => ({
        // Persiste APENAS preferências de design, NÃO conteúdo
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
        canvasSize: state.canvasSize,
        cardPosition: state.cardPosition
        // isExporting is EXCLUDED from persistence
      }),
      merge: (persistedStateValue: unknown, currentState) => {
        const persistedState = persistedStateValue as Partial<CardState> | null;
        
        // Remove campos de conteúdo do merge
        const { 
          /* eslint-disable @typescript-eslint/no-unused-vars */
          url, title, description, author, image, favicon, domain, template, isWelcomeState, activeTab,
          /* eslint-enable @typescript-eslint/no-unused-vars */
          ...sanitizedPersistedState 
        } = (persistedState || {}) as Record<string, unknown>;

        return {
          ...currentState,
          ...sanitizedPersistedState,
          
          // 🔥 ENFORCE: Sempre inicializa no estado de boas-vindas
          isWelcomeState: true,
          activeTab: 'card',
          
          // 🔥 RELAXED: Não reseta mais obrigatoriamente para permitir que o usuário salve estes estados
          // pattern: 'none', 
          // customBgImage: null,
          cardPosition: { x: 0, y: 0 },
          
          layout: {
            ...currentState.layout,
            ...(sanitizedPersistedState?.layout as object || {}),
            // 🔥 REMOVED: aspect-auto enforced here was breaking selection
            imageOffsetX: 0,
            imageOffsetY: 0
          },
          canvasSize: {
            ...currentState.canvasSize,
            ...(sanitizedPersistedState?.canvasSize as object || {}),
            // 🔥 RELAXED: Somente força auto se não houver um preset válido já salvo (opcional)
            // Ou melhor: Mantém o que o usuário tinha, mas garante que o 'auto' funcione.
            preset: (sanitizedPersistedState?.canvasSize as { preset?: string })?.preset || 'auto'
          },
          colors: {
            ...currentState.colors,
            ...(sanitizedPersistedState?.colors as object || {})
          },
          // Sanitiza gradientStyle inválido
          gradientStyle: (typeof sanitizedPersistedState.gradientStyle !== 'string' || sanitizedPersistedState.gradientStyle === 'mesh' || !sanitizedPersistedState.gradientStyle) 
            ? '135deg' 
            : sanitizedPersistedState.gradientStyle
        } as CardState;
      }
    }
  )
);
