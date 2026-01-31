/**
 * Serviço de Sugestões de Mensagens por Plataforma
 *
 * Gera mensagens formatadas para redes sociais baseadas nos metadados
 * do link processado, com variações por plataforma detectada.
 */

import type { MessageSuggestion, PlatformType } from '../types/messages'
import type { LinkMetadata } from './metadata'
import type { FramePreset } from '../types/frame'

/**
 * Interface simplificada para geração de mensagens
 * (não requer image e favicon)
 */
interface MessageGenerationInput {
  title: string
  description: string
  author: string
  domain: string
  template: 'default' | 'music' | 'news'
  url?: string
  image?: string | null
  favicon?: string | null
}

/**
 * Detecta a plataforma baseada no domínio e template
 */
export function detectPlatform(
  domain: string,
  template: 'default' | 'music' | 'news'
): PlatformType {
  const domainLower = domain.toLowerCase()

  // YouTube Music
  if (domainLower.includes('music.youtube')) return 'youtube-music'

  // YouTube
  if (
    domainLower.includes('youtube.com') ||
    domainLower.includes('youtu.be') ||
    domainLower.includes('youtube-nocookie')
  ) {
    return template === 'music' ? 'youtube-music' : 'youtube'
  }

  // Twitter/X
  if (
    domainLower.includes('twitter.com') ||
    domainLower.includes('x.com') ||
    domainLower === 'twitter' ||
    domainLower === 'x'
  ) {
    return 'twitter'
  }

  // Instagram
  if (domainLower.includes('instagram.com') || domainLower === 'instagram') {
    return 'instagram'
  }

  // Spotify
  if (
    domainLower.includes('spotify.com') ||
    domainLower.includes('open.spotify.com') ||
    domainLower === 'spotify'
  ) {
    return 'spotify'
  }

  // SoundCloud
  if (domainLower.includes('soundcloud.com') || domainLower === 'soundcloud') {
    return 'soundcloud'
  }

  // Bandcamp
  if (domainLower.includes('bandcamp.com') || domainLower === 'bandcamp') {
    return 'bandcamp'
  }

  // Apple Music
  if (
    domainLower.includes('music.apple.com') ||
    (domainLower.includes('apple.com') && template === 'music')
  ) {
    return 'apple-music'
  }

  // Deezer
  if (domainLower.includes('deezer.com') || domainLower === 'deezer') {
    return 'deezer'
  }

  // Tidal
  if (domainLower.includes('tidal.com') || domainLower === 'tidal') {
    return 'tidal'
  }

  // Genérico
  return 'generic'
}

/**
 * Obtém o label amigável da plataforma
 */
function getPlatformLabel(platform: PlatformType): string {
  const labels: Record<PlatformType, string> = {
    'youtube-music': 'YouTube Music',
    youtube: 'YouTube',
    twitter: 'Twitter/X',
    instagram: 'Instagram',
    spotify: 'Spotify',
    soundcloud: 'SoundCloud',
    bandcamp: 'Bandcamp',
    'apple-music': 'Apple Music',
    deezer: 'Deezer',
    tidal: 'Tidal',
    generic: 'Link',
  }
  // eslint-disable-next-line security/detect-object-injection
  return labels[platform]
}

/**
 * Obtém o nome do ícone para a plataforma
 */
function getPlatformIcon(platform: PlatformType): string {
  const icons: Record<PlatformType, string> = {
    'youtube-music': 'FaMusic',
    youtube: 'FaYoutube',
    twitter: 'FaTwitter',
    instagram: 'FaInstagram',
    spotify: 'FaSpotify',
    soundcloud: 'FaSoundcloud',
    bandcamp: 'FaBandcamp',
    'apple-music': 'FaApple',
    deezer: 'FaSpotify', // Font Awesome não tem Deezer
    tidal: 'FaSpotify', // Font Awesome não tem Tidal
    generic: 'FaGlobe',
  }
  // eslint-disable-next-line security/detect-object-injection
  return icons[platform]
}

/**
 * Trunca texto se necessário
 */
function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Extrai ano do título se presente (ex: "(Ao Vivo) 2018")
 */
function extractYear(title: string): string | undefined {
  const yearMatch = title.match(/\b(19|20)\d{2}\b/)
  return yearMatch ? yearMatch[0] : undefined
}

/**
 * Limpa o título removendo sufixos comuns
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\s*\(Official\s*(Video|Audio|Music\s*Video)\)/gi, '')
    .replace(/\s*\(Ao\s*Vivo\)/gi, '')
    .replace(/\s*\(Live\)/gi, '')
    .replace(/\s*\(Lyric\s*Video\)/gi, '')
    .replace(/\s*\(Visualizer\)/gi, '')
    .trim()
}

/**
 * Formata mensagem no estilo "música" com detalhes do artista/álbum
 */
function formatMusicMessage(
  platform: PlatformType,
  title: string,
  author: string,
  url: string,
  tone: 'casual' | 'neutral' | 'excited'
): string {
  const year = extractYear(title)
  const cleanTitleText = cleanTitle(title)

  // Intros por tom
  const intros: Record<PlatformType, Record<string, string>> = {
    'youtube-music': {
      casual: 'Se liga nesse som:',
      neutral: 'Descubra essa música:',
      excited: 'Não perca esse som incrível!',
    },
    youtube: {
      casual: 'Se liga nesse som:',
      neutral: 'Confira essa música:',
      excited: 'Essa música é demais!',
    },
    spotify: {
      casual: 'Se liga nessa música:',
      neutral: 'Ouça agora:',
      excited: 'Playlist perfeita com essa música!',
    },
    soundcloud: {
      casual: 'Se liga nesse som:',
      neutral: 'Descubra esse track:',
      excited: 'Som fresco do SoundCloud!',
    },
    bandcamp: {
      casual: 'Se liga nesse som:',
      neutral: 'Apoie esse artista:',
      excited: 'Descoberta incrível no Bandcamp!',
    },
    'apple-music': {
      casual: 'Se liga nessa música:',
      neutral: 'Disponível no Apple Music:',
      excited: 'Hit exclusivo no Apple Music!',
    },
    deezer: {
      casual: 'Se liga nesse som:',
      neutral: 'Ouça no Deezer:',
      excited: 'Descoberta musical!',
    },
    tidal: {
      casual: 'Se liga nesse som:',
      neutral: 'Alta qualidade no Tidal:',
      excited: 'Experiência sonora premium!',
    },
    twitter: {
      casual: 'Se liga nesse som:',
      neutral: 'Música recomendada:',
      excited: 'Vibe perfeita!',
    },
    instagram: {
      casual: 'Trilha sonora do dia:',
      neutral: 'Música para compartilhar:',
      excited: 'Essa está na minha playlist!',
    },
    generic: {
      casual: 'Se liga nesse som:',
      neutral: 'Recomendação musical:',
      excited: 'Não deixe de ouvir!',
    },
  }

  // eslint-disable-next-line security/detect-object-injection
  const platformIntros = intros[platform]
  // eslint-disable-next-line security/detect-object-injection
  const intro = platformIntros?.[tone] || intros.generic[tone]

  // Formato: Artista • Música (Ano) ou Artista • Música
  let details = author ? `${author} • ${cleanTitleText}` : cleanTitleText
  if (year && !details.includes(year)) {
    details += ` • ${year}`
  }

  return `${intro}\n// ${cleanTitleText}\n// ${details}\n#Spread ${url}`
}

/**
 * Formata mensagem para vídeo (YouTube)
 */
function formatVideoMessage(
  title: string,
  author: string,
  url: string,
  tone: 'casual' | 'neutral' | 'excited'
): string {
  const cleanTitleText = cleanTitle(title)

  const intros = {
    casual: 'Olha só esse vídeo:',
    neutral: 'Confira esse conteúdo:',
    excited: 'Vídeo incrível que você precisa ver!',
  }

  // eslint-disable-next-line security/detect-object-injection
  const intro = intros[tone]
  const channel = author ? `// ${author}` : ''

  return `${intro}\n// ${cleanTitleText}\n${channel}\n#Spread ${url}`.trim()
}

/**
 * Formata mensagem para Twitter/X
 */
function formatTwitterMessage(
  title: string,
  description: string,
  url: string,
  tone: 'casual' | 'neutral' | 'excited'
): string {
  const intros = {
    casual: 'Veja isso:',
    neutral: 'Compartilhando:',
    excited: 'Você precisa ver isso!',
  }

  // eslint-disable-next-line security/detect-object-injection
  const intro = intros[tone]
  const content = title || truncateText(description, 80)

  return `${intro}\n// ${content}\n#Spread ${url}`
}

/**
 * Formata mensagem para Instagram
 */
function formatInstagramMessage(
  title: string,
  description: string,
  url: string,
  tone: 'casual' | 'neutral' | 'excited'
): string {
  const intros = {
    casual: 'Olha só:',
    neutral: 'Compartilhando:',
    excited: 'Que descoberta incrível!',
  }

  // eslint-disable-next-line security/detect-object-injection
  const intro = intros[tone]
  const content = title || truncateText(description, 80)

  return `${intro}\n// ${content}\n#Spread ${url}`
}

/**
 * Formata mensagem genérica
 */
function formatGenericMessage(
  title: string,
  description: string,
  url: string,
  tone: 'casual' | 'neutral' | 'excited'
): string {
  const intros = {
    casual: 'Confira:',
    neutral: 'Recomendação:',
    excited: 'Vale muito a pena conferir!',
  }

  // eslint-disable-next-line security/detect-object-injection
  const intro = intros[tone]
  const content = title || truncateText(description, 80)
  const subtitle =
    description && description !== title
      ? `// ${truncateText(description, 60)}`
      : ''

  return `${intro}\n// ${content}\n${subtitle}\n#Spread ${url}`.trim()
}

/**
 * Gera sugestões de mensagens baseadas nos metadados
 */
export function generateMessageSuggestions(
  metadata: MessageGenerationInput
): MessageSuggestion[] {
  const { title, description, author, domain, template } = metadata
  const url = metadata.url || ''

  // Detecta a plataforma
  const platform = detectPlatform(domain, template)
  const label = getPlatformLabel(platform)
  const icon = getPlatformIcon(platform)

  const suggestions: MessageSuggestion[] = []
  const tones: Array<'casual' | 'neutral' | 'excited'> = [
    'casual',
    'neutral',
    'excited',
  ]

  // Gera uma sugestão para cada tom (limitado a 2-3 variações)
  tones.forEach(tone => {
    let text = ''

    switch (platform) {
      case 'youtube-music':
      case 'spotify':
      case 'soundcloud':
      case 'bandcamp':
      case 'apple-music':
      case 'deezer':
      case 'tidal':
        text = formatMusicMessage(platform, title, author, url, tone)
        break

      case 'youtube':
        text = formatVideoMessage(title, author, url, tone)
        break

      case 'twitter':
        text = formatTwitterMessage(title, description, url, tone)
        break

      case 'instagram':
        text = formatInstagramMessage(title, description, url, tone)
        break

      case 'generic':
      default:
        text = formatGenericMessage(title, description, url, tone)
        break
    }

    suggestions.push({
      id: `${platform}-${tone}`,
      platform,
      label,
      text,
      icon,
      tone,
    })
  })

  return suggestions
}

/**
 * Exporta a mensagem formatada para uso externo
 */
export function formatMessageForExport(
  metadata: MessageGenerationInput,
  options?: {
    tone?: 'casual' | 'neutral' | 'excited'
    includeHashtag?: boolean
    customIntro?: string
  }
): string {
  const suggestions = generateMessageSuggestions(metadata)
  const tone = options?.tone || 'casual'

  const suggestion = suggestions.find(s => s.tone === tone)
  if (!suggestion) return suggestions[0]?.text || ''

  let text = suggestion.text

  // Remove hashtag se solicitado
  if (options?.includeHashtag === false) {
    text = text.replace(/\n#Spread.*$/, '')
  }

  // Usa intro customizada se fornecida
  if (options?.customIntro) {
    const lines = text.split('\n')
    lines[0] = options.customIntro
    text = lines.join('\n')
  }

  return text
}

/**
 * Obtém sugestões de frames adequadas para a plataforma detectada
 *
 * @param platform - Tipo da plataforma detectada
 * @returns Array de presets de frames recomendados
 */
export function getFrameSuggestions(platform: PlatformType): FramePreset[] {
  const suggestions: Record<PlatformType, FramePreset[]> = {
    youtube: ['poster', 'frame-elegant'],
    'youtube-music': ['vinyl', 'cd-case', 'cassette'],
    twitter: ['poster', 'frame-elegant'],
    instagram: ['poster', 'frame-elegant'],
    spotify: ['vinyl', 'cd-case', 'cassette'],
    soundcloud: ['vinyl', 'cd-case', 'cassette'],
    bandcamp: ['vinyl', 'cd-case', 'cassette'],
    'apple-music': ['vinyl', 'cd-case', 'cassette'],
    deezer: ['vinyl', 'cd-case', 'cassette'],
    tidal: ['vinyl', 'cd-case', 'cassette'],
    generic: ['poster', 'frame-elegant'],
  }

  // eslint-disable-next-line security/detect-object-injection
  return suggestions[platform] || suggestions.generic
}

export { type LinkMetadata }
