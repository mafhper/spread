import { describe, expect, it } from 'vitest'

import {
  applyPresetToDocument,
  cardStatePatchFromDocument,
  createPresetFromDocument,
  documentFromCardState,
  migrateDocumentV1,
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

    expect(document.schema).toBe('spread-document@2')
    expect(document.content.url).toBe('https://example.com/story')
    expect(document.content.mediaSource).toBe('page')
    expect(document.outputMode).toBe('social-card')
    expect(document.canvas.cardPosition).toEqual({ x: 25, y: -10 })
    expect(document).not.toHaveProperty('isSidebarOpen')
    expect(document).not.toHaveProperty('isExporting')
    expect(() => JSON.stringify(document)).not.toThrow()
  })

  it('migrates V1 page documents into social cards without losing the capture', () => {
    const current = documentFromCardState(createMockCardStore())
    const document = {
      ...current,
      schema: 'spread-document@1' as const,
      content: {
        url: current.content.url,
        title: current.content.title,
        description: current.content.description,
        author: current.content.author,
        image: 'data:image/png;base64,legacy',
        favicon: current.content.favicon,
        domain: current.content.domain,
        template: current.content.template,
        mediaSource: 'page' as const,
        capture: { viewport: 'mobile' as const, area: 'fullPage' as const },
      },
    }
    const migrated = migrateDocumentV1(document)

    expect(cardStatePatchFromDocument(migrated)).toMatchObject({
      outputMode: 'social-card',
      mediaSource: 'page',
      captureViewport: 'mobile',
      captureArea: 'fullPage',
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
    expect(applied.schema).toBe('spread-document@2')
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
