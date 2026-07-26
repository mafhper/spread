import { describe, expect, it } from 'vitest'

import {
  applyPresetToDocument,
  cardStatePatchFromDocument,
  createPresetFromDocument,
  documentFromCardState,
} from '@/features/composition/document'
import { createBuiltinPresets } from '@/features/studio/builtinPresets'
import { createMockCardStore } from '../../mocks/useCardStore'

describe('Spread document model', () => {
  it('creates a serializable versioned document without UI state', () => {
    const state = createMockCardStore({
      url: 'https://example.com/story',
      title: 'Story',
      mediaSource: 'page',
      captureViewport: 'mobile',
      captureArea: 'fullPage',
      cardPosition: { x: 25, y: -10 },
      isSidebarOpen: true,
      isExporting: true,
    })

    const document = documentFromCardState(state)

    expect(document.schema).toBe('spread-document@1')
    expect(document.content.url).toBe('https://example.com/story')
    expect(document.content.mediaSource).toBe('page')
    expect(document.content.capture).toEqual({
      viewport: 'mobile',
      area: 'fullPage',
    })
    expect(document.canvas.cardPosition).toEqual({ x: 160, y: -36 })
    expect(document).not.toHaveProperty('isSidebarOpen')
    expect(document).not.toHaveProperty('isExporting')
    expect(() => JSON.stringify(document)).not.toThrow()
  })

  it('opens older documents with safe page capture defaults', () => {
    const document = documentFromCardState(createMockCardStore())
    delete document.content.mediaSource
    delete document.content.capture

    expect(cardStatePatchFromDocument(document)).toMatchObject({
      mediaSource: 'metadata',
      captureViewport: 'desktop',
      captureArea: 'viewport',
    })
  })

  it('stores style only in presets and preserves content when applying one', () => {
    const source = documentFromCardState(
      createMockCardStore({ title: 'Source title', author: 'Source author' })
    )
    const target = documentFromCardState(
      createMockCardStore({
        title: 'Target title',
        author: 'Target author',
        colors: { bg1: '#101010', bg2: '#202020', text: '#fefefe' },
      })
    )
    const preset = createPresetFromDocument(source, 'My style', 123)
    const applied = applyPresetToDocument(target, preset)

    expect(preset).not.toHaveProperty('content')
    expect(applied.content).toEqual(target.content)
    expect(applied.background).toEqual(source.background)
    expect(applied.schema).toBe('spread-document@1')
  })

  it('provides the six approved built-in styles', () => {
    const document = documentFromCardState(createMockCardStore())

    expect(createBuiltinPresets(document).map(preset => preset.name)).toEqual([
      'Clean Dark',
      'Studio Light',
      'Editorial',
      'Music Neon',
      'Soft Gradient',
      'Poster',
    ])
  })
})
