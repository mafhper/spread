import {
  createPresetFromDocument,
  type SpreadDocumentV1,
  type SpreadPresetV1,
} from '../composition/document'

interface PresetDefinition {
  id: string
  name: string
  color1: string
  color2: string
  textColor: string
  gradient: string
  opacity: number
  radius: number
  pattern?: SpreadDocumentV1['background']['pattern']
}

const DEFINITIONS: PresetDefinition[] = [
  {
    id: 'clean-dark',
    name: 'Clean Dark',
    color1: '#090a0b',
    color2: '#202328',
    textColor: '#f4f5f7',
    gradient: '135deg',
    opacity: 0.72,
    radius: 16,
  },
  {
    id: 'studio-light',
    name: 'Studio Light',
    color1: '#f4f5f7',
    color2: '#cdd2da',
    textColor: '#101113',
    gradient: '135deg',
    opacity: 0.86,
    radius: 12,
  },
  {
    id: 'editorial',
    name: 'Editorial',
    color1: '#15120f',
    color2: '#76614a',
    textColor: '#fff8eb',
    gradient: '180deg',
    opacity: 0.9,
    radius: 8,
    pattern: 'noise',
  },
  {
    id: 'music-neon',
    name: 'Music Neon',
    color1: '#160b2e',
    color2: '#8b5cf6',
    textColor: '#ffffff',
    gradient: '135deg',
    opacity: 0.64,
    radius: 16,
    pattern: 'dots',
  },
  {
    id: 'soft-gradient',
    name: 'Soft Gradient',
    color1: '#233249',
    color2: '#8da4c4',
    textColor: '#f8fafc',
    gradient: 'circle at top left',
    opacity: 0.58,
    radius: 16,
  },
  {
    id: 'poster',
    name: 'Poster',
    color1: '#111111',
    color2: '#b7f34a',
    textColor: '#ffffff',
    gradient: '155deg',
    opacity: 0.88,
    radius: 0,
    pattern: 'grid',
  },
]

export function createBuiltinPresets(
  baseDocument: SpreadDocumentV1
): SpreadPresetV1[] {
  return DEFINITIONS.map((definition, index) => {
    const document = structuredClone(baseDocument)
    document.background.color1 = definition.color1
    document.background.color2 = definition.color2
    document.background.gradientStyle = definition.gradient
    document.background.pattern = definition.pattern || 'none'
    document.typography.textColor = definition.textColor
    document.card.opacity = definition.opacity
    document.card.innerRadius = definition.radius

    return createPresetFromDocument(document, definition.name, index + 1, {
      id: definition.id,
      source: 'builtin',
    })
  })
}
