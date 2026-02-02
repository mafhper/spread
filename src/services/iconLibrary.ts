/**
 * Servico de Biblioteca de Icones para Servicos
 *
 * Mapeia dominios para icones SVG inline otimizados
 * Substitui react-icons/fa6 (1.8MB) por SVGs especificos (~5KB)
 */

import * as React from 'react'
import {
  Youtube,
  Twitter,
  Instagram,
  Music,
  Disc,
  Github,
  Linkedin,
  Facebook,
  Globe,
  Share2,
} from 'lucide-react'

/**
 * Props padrao para componentes de icone
 */
export interface IconProps {
  className?: string
  size?: number
  color?: string
  style?: React.CSSProperties
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = React.ComponentType<any>

// Cores oficiais das marcas
export const SERVICE_COLORS: Record<string, string> = {
  youtube: '#FF0000',
  'youtube.com': '#FF0000',
  'youtu.be': '#FF0000',
  'youtube-nocookie.com': '#FF0000',
  'music.youtube.com': '#FF0000',
  twitter: '#000000',
  'twitter.com': '#000000',
  'x.com': '#000000',
  x: '#000000',
  instagram: '#E4405F',
  'instagram.com': '#E4405F',
  spotify: '#1DB954',
  'spotify.com': '#1DB954',
  'open.spotify.com': '#1DB954',
  soundcloud: '#FF5500',
  'soundcloud.com': '#FF5500',
  bandcamp: '#629AA9',
  'bandcamp.com': '#629AA9',
  apple: '#000000',
  'apple.com': '#000000',
  'music.apple.com': '#FA243C',
  deezer: '#FF0092',
  'deezer.com': '#FF0092',
  tidal: '#000000',
  'tidal.com': '#000000',
  github: '#181717',
  'github.com': '#181717',
  'github.io': '#181717',
  linkedin: '#0A66C2',
  'linkedin.com': '#0A66C2',
  facebook: '#1877F2',
  'facebook.com': '#1877F2',
  'fb.com': '#1877F2',
  tiktok: '#000000',
  'tiktok.com': '#000000',
}

// Mapeamento de dominios para icones
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SERVICE_ICONS: Record<string, any> = {
  // YouTube
  youtube: Youtube,
  'youtube.com': Youtube,
  'youtu.be': Youtube,
  'youtube-nocookie.com': Youtube,
  'music.youtube.com': Youtube,

  // Twitter/X
  twitter: Twitter,
  'twitter.com': Twitter,
  'x.com': Twitter,
  x: Twitter,
  'y2u.be': Youtube,

  // Instagram
  instagram: Instagram,
  'instagram.com': Instagram,

  // Spotify (using Disc/Music as fallback if icon missing)
  spotify: Music,
  'spotify.com': Music,
  'open.spotify.com': Music,

  // SoundCloud
  soundcloud: Disc,
  'soundcloud.com': Disc,

  // Bandcamp
  bandcamp: Disc,
  'bandcamp.com': Disc,

  // Apple
  apple: Disc, // Apple icon might not be in basic set
  'apple.com': Disc,
  'music.apple.com': Music,

  // Deezer
  deezer: Music,
  'deezer.com': Music,

  // Tidal
  tidal: Music,
  'tidal.com': Music,

  // GitHub
  github: Github,
  'github.com': Github,
  'github.io': Github,

  // LinkedIn
  linkedin: Linkedin,
  'linkedin.com': Linkedin,

  // Facebook
  facebook: Facebook,
  'facebook.com': Facebook,
  'fb.com': Facebook,

  // TikTok
  tiktok: Share2, // Generic share for tiktok if missing
  'tiktok.com': Share2,
}

// Icone padrao para servicos nao mapeados
export const DEFAULT_ICON = Globe
export const DEFAULT_COLOR = '#6B7280'

export interface ServiceIconResult {
  Icon: IconComponent
  color: string
  hasIcon: boolean
}

/**
 * Extrai o dominio base de uma URL ou string de dominio
 */
function extractDomain(domain: string): string {
  // Remove protocolo - regex validada para dominios
  // eslint-disable-next-line security/detect-unsafe-regex
  let cleaned = domain.replace(/^(https?:\/\/)?(www\.)?/i, '')

  // Remove path e query params
  cleaned = cleaned.split('/')[0]
  cleaned = cleaned.split('?')[0]
  cleaned = cleaned.split(':')[0]

  return cleaned.toLowerCase().trim()
}

/**
 * Obtem o icone e cor apropriados para um dominio
 *
 * @param domain - Dominio ou URL do servico
 * @returns Objeto com o componente Icon, cor da marca e flag indicando se ha icone especifico
 */
export function getServiceIcon(domain: string): ServiceIconResult {
  if (!domain) {
    return {
      Icon: DEFAULT_ICON,
      color: DEFAULT_COLOR,
      hasIcon: false,
    }
  }

  const normalizedDomain = extractDomain(domain)

  // Tenta encontrar match exato
  if (Object.hasOwn(SERVICE_ICONS, normalizedDomain)) {
    // eslint-disable-next-line security/detect-object-injection
    const Icon = SERVICE_ICONS[normalizedDomain]
    // eslint-disable-next-line security/detect-object-injection
    const color = SERVICE_COLORS[normalizedDomain] || DEFAULT_COLOR
    return {
      Icon,
      color,
      hasIcon: true,
    }
  }

  // Tenta encontrar match parcial (ex: subdominios)
  for (const [key, Icon] of Object.entries(SERVICE_ICONS)) {
    // Verifica se o dominio termina com a chave (ex: music.apple.com termina com apple.com ou music.apple.com)
    // Ou se a chave eh uma parte do dominio (ex: youtube em youtube.com)
    if (
      normalizedDomain === key ||
      normalizedDomain.endsWith('.' + key) ||
      (key.length > 3 && normalizedDomain.includes(key))
    ) {
      // eslint-disable-next-line security/detect-object-injection
      const color = SERVICE_COLORS[key] || DEFAULT_COLOR
      return {
        Icon,
        color,
        hasIcon: true,
      }
    }
  }

  // Fallback para icone padrao
  return {
    Icon: DEFAULT_ICON,
    color: DEFAULT_COLOR,
    hasIcon: false,
  }
}

/**
 * Hook para obter icone de musica generico
 * Util quando nao ha um servico especifico identificado
 */
export function getMusicIcon(): ServiceIconResult {
  return {
    Icon: Music,
    color: '#1DB954',
    hasIcon: true,
  }
}
