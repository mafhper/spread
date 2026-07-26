/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mock completo do useCardStore para testes unitarios
 *
 * Garante NUNCA propriedades undefined para evitar falhas em testes
 * Regra de ouro: Nenhuma propriedade pode ser undefined. NUNCA.
 * @version 3.0.0 - Sistema com setState
 */

import { vi } from 'vitest'
import type { CardState } from '@/store/cardStore'

/**
 * Estado base completo do mock
 */
const createBaseState = (): CardState => ({
  // Metadata
  url: '',
  title: '',
  description: '',
  author: '',
  image: null,
  favicon: null,
  domain: '',
  template: 'default',
  mediaSource: 'metadata',
  captureViewport: 'desktop',
  captureArea: 'viewport',
  isWelcomeState: false,

  // Colors
  colors: {
    bg1: '#0f172a',
    bg2: '#c084fc',
    text: '#ffffff',
  },
  gradientStyle: '135deg',
  pattern: 'none',
  patternOpacity: 0.1,
  patternScale: 1,
  customBgImage: null,
  extractedColors: null,

  // Layout COMPLETO para evitar undefineds
  layout: {
    aspectRatio: 'aspect-auto',
    imagePosition: 'object-center',
    imageFit: 'cover',
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
    cardAuto: false,
    imageOffsetX: 0,
    imageOffsetY: 0,
    cardAspectRatio: 'aspect-auto',
    showHeader: true,
    headerMode: 'both',
    headerPosition: 'right',
    measuredCardHeight: 360,
  },

  // Canvas Size completo
  canvasSize: {
    width: 1080,
    height: 1080,
    preset: 'auto',
    roundness: 0,
  },

  // Viewport
  viewport: {
    width: 1920,
    height: 1080,
  },

  // Position
  cardPosition: {
    x: 0,
    y: 0,
  },

  // Flags
  isSidebarOpen: false,

  // Frame Mode - Sistema SVG unificado
  frame: {
    enabled: false,
    preset: 'none',
    primaryColor: '#1a1a1a',
    secondaryColor: '#d4af37',
    showText: true,
    textPosition: 'below',
    textStyle: {
      position: 'below',
      color: '#ffffff',
      fontSize: 16,
      showIcon: true,
    },
    templateId: 'default',
  },

  // Typography
  fontFamily: 'Inter',
  titleSize: 100,
  subtitleSize: 100,
  textAlign: 'left',

  // Active tab
  activeTab: 'card',
  isExporting: false,
  isHydrated: true,

  // Actions (mock functions)
  setHydrated: vi.fn(),
  updateField: vi.fn(),
  updateNestedField: vi.fn(),
  updateLayout: vi.fn(),
  reset: vi.fn(),
  setFullState: vi.fn(),
  setActiveTab: vi.fn(),
  resetContent: vi.fn(),
  resetCard: vi.fn(),
  resetPhoto: vi.fn(),
  resetColors: vi.fn(),
  resetBackground: vi.fn(),
  resetTypography: vi.fn(),
  resetCanvas: vi.fn(),
  updateFrame: vi.fn(),
  resetFrame: vi.fn(),
  resetToDefaults: vi.fn(),

  // Frame template action
  setTemplate: vi.fn(),
})

/**
 * Cria um mock completo do store sem propriedades undefined
 */
export const createMockCardStore = (
  overrides: Partial<CardState> = {}
): CardState => {
  const baseState = createBaseState()

  // Merge com overrides - DEEP MERGE para objetos aninhados
  const mergedState: CardState = {
    ...baseState,
    ...overrides,
    // Merge especifico para objetos complexos
    layout: overrides.layout
      ? { ...baseState.layout, ...overrides.layout }
      : baseState.layout,
    colors: overrides.colors
      ? { ...baseState.colors, ...overrides.colors }
      : baseState.colors,
    canvasSize: overrides.canvasSize
      ? { ...baseState.canvasSize, ...overrides.canvasSize }
      : baseState.canvasSize,
    cardPosition: overrides.cardPosition
      ? { ...baseState.cardPosition, ...overrides.cardPosition }
      : baseState.cardPosition,
    frame: overrides.frame
      ? { ...baseState.frame, ...overrides.frame }
      : baseState.frame,
  }

  return mergedState
}

// Estado global do mock para simular persistencia entre chamadas
let mockState: CardState = createBaseState()

/**

 * Mock do useCardStore que simula o comportamento do Zustand

 * Inclui metodos estaticos setState e getState

 */

export const useCardStore = vi.fn(
  (selector?: (state: CardState) => unknown) => {
    if (selector) {
      return selector(mockState)
    }

    return mockState
  }
) as unknown as {
  (selector?: (state: CardState) => unknown): any

  setState: (partial: Partial<CardState>) => void

  getState: () => CardState

  resetMock: () => void

  subscribe: () => () => void

  destroy: () => void
}

/**

 * Define o estado completo do mock (simula setState do Zustand)

 */

useCardStore.setState = vi.fn((partial: Partial<CardState>) => {
  mockState = {
    ...mockState,
    ...partial,
    layout: partial.layout
      ? { ...mockState.layout, ...partial.layout }
      : mockState.layout,
    colors: partial.colors
      ? { ...mockState.colors, ...partial.colors }
      : mockState.colors,
    canvasSize: partial.canvasSize
      ? { ...mockState.canvasSize, ...partial.canvasSize }
      : mockState.canvasSize,
    cardPosition: partial.cardPosition
      ? { ...mockState.cardPosition, ...partial.cardPosition }
      : mockState.cardPosition,
    frame: partial.frame
      ? { ...mockState.frame, ...partial.frame }
      : mockState.frame,
  }
})

/**
 * Retorna o estado completo atual (simula getState do Zustand)
 */
useCardStore.getState = vi.fn(() => mockState)

/**
 * Reseta o estado do mock para os valores padroes
 */
useCardStore.resetMock = () => {
  mockState = createBaseState()
}

/**
 * Subscreve a mudancas de estado (mock simples)
 */
useCardStore.subscribe = vi.fn(() => vi.fn()) // Retorna funcao de unsubscribe

/**
 * Destroi o store (mock vazio)
 */
useCardStore.destroy = vi.fn()
