import { vi } from 'vitest'
import { createMockCardStore } from './useCardStore'
import { type CardState } from '../../../../src/store/cardStore'

// Mock do hook store
export const mockUseCardStore = (overrides: Partial<CardState> = {}) => {
  const state = createMockCardStore(overrides)
  return {
    ...state,
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
}
