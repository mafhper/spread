/**
 * Mock Factory for useCardStore
 *
 * Garante NUNCA propriedades undefined para evitar falhas em testes
 * Regra de ouro: Nenhuma propriedade pode ser undefined. NUNCA.
 */

import { vi } from 'vitest'
import type { CardState } from '../../../src/store/cardStore'

/**
 * Cria um mock completo do store sem propriedades undefined
 */
export const createMockCardStore = (
  overrides: Partial<CardState> = {}
): CardState => {
  // Estado base completo
  const baseState: CardState = {
    // Metadata
    url: '',
    title: '',
    description: '',
    author: '',
    image: null,
    favicon: null,
    domain: '',
    template: 'default',
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
      headerPosition: 'right',
    },

    // Canvas Size completo
    canvasSize: {
      width: 1080,
      height: 1080,
      preset: 'auto',
      roundness: 0,
    },

    // Position
    cardPosition: {
      x: 0,
      y: 0,
    },

    // Flags
    isSidebarOpen: false,

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
  }

  // Merge com overrides - DEEP MERGE para objetos aninhados
  const mergedState: CardState = {
    ...baseState,
    ...overrides,
    // Merge específico para objetos complexos
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
  }

  // VERIFICAÇÃO CRÍTICA: Nenhum undefined permitido
  Object.entries(mergedState).forEach(([key, value]) => {
    if (value === undefined) {
      throw new Error(
        `🚨 createMockCardStore: Propriedade '${key}' está undefined! ` +
          `Use createMockCardStore() completamente. ` +
          `Verifique se a propriedade existe no estado base.`
      )
    }
  })

  // Verificação adicional para objetos aninhados
  ;(['layout', 'colors', 'canvasSize', 'cardPosition'] as const).forEach(
    objKey => {
      // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-explicit-any
      const obj = (mergedState as any)[objKey]
      Object.entries(obj).forEach(([subKey, subValue]) => {
        if (subValue === undefined) {
          throw new Error(
            `🚨 createMockCardStore: Propriedade aninhada '${objKey}.${subKey}' está undefined!`
          )
        }
      })
    }
  )

  return mergedState
}

/**
 * Mocks específicos para estados comuns
 */
export const mockStates = {
  welcome: createMockCardStore({ isWelcomeState: true }),
  editor: createMockCardStore({ isWelcomeState: false }),
  loading: createMockCardStore({ isExporting: true }),
  error: createMockCardStore({
    url: 'https://invalid-url',
    isWelcomeState: false,
  }),
  withImage: createMockCardStore({
    image: 'https://example.com/image.jpg',
    isWelcomeState: false,
  }),
}
