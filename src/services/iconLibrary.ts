/**
 * Servico de Biblioteca de Icones para Servicos
 *
 * Mapeia dominios para icones SVG inline otimizados
 * Substitui react-icons/fa6 (1.8MB) por SVGs especificos (~5KB)
 */

import type { FC, CSSProperties } from 'react'
import {
  YoutubeIcon,
  YoutubeMusicIcon,
  TwitterIcon,
  InstagramIcon,
  SpotifyIcon,
  SoundcloudIcon,
  BandcampIcon,
  AppleIcon,
  GithubIcon,
  LinkedinIcon,
  FacebookIcon,
  TiktokIcon,
  GlobeIcon,
  MusicIcon,
} from '../components/icons'

/**
 * Props padrao para componentes de icone
 */
export interface IconProps {
  className?: string
  size?: number
  color?: string
  style?: CSSProperties
}

type IconComponent = FC<IconProps>

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
export const SERVICE_ICONS: Record<string, IconComponent> = {
  // YouTube
  youtube: YoutubeIcon,
  'youtube.com': YoutubeIcon,
  'youtu.be': YoutubeIcon,
  'youtube-nocookie.com': YoutubeIcon,
  'music.youtube.com': YoutubeMusicIcon,

  // Twitter/X
  twitter: TwitterIcon,
  'twitter.com': TwitterIcon,
  'x.com': TwitterIcon,
  x: TwitterIcon,
  'y2u.be': YoutubeIcon,

  // Instagram
  instagram: InstagramIcon,
  'instagram.com': InstagramIcon,

  // Spotify
  spotify: SpotifyIcon,
  'spotify.com': SpotifyIcon,
  'open.spotify.com': SpotifyIcon,

  // SoundCloud
  soundcloud: SoundcloudIcon,
  'soundcloud.com': SoundcloudIcon,

  // Bandcamp
  bandcamp: BandcampIcon,
  'bandcamp.com': BandcampIcon,

  // Apple
  apple: AppleIcon,
  'apple.com': AppleIcon,
  'music.apple.com': AppleIcon,

  // Deezer (usa Spotify como aproximacao)
  deezer: SpotifyIcon,
  'deezer.com': SpotifyIcon,

  // Tidal (usa Spotify como aproximacao)
  tidal: SpotifyIcon,
  'tidal.com': SpotifyIcon,

  // GitHub
  github: GithubIcon,
  'github.com': GithubIcon,
  'github.io': GithubIcon,

  // LinkedIn
  linkedin: LinkedinIcon,
  'linkedin.com': LinkedinIcon,

  // Facebook
  facebook: FacebookIcon,
  'facebook.com': FacebookIcon,
  'fb.com': FacebookIcon,

  // TikTok
  tiktok: TiktokIcon,
  'tiktok.com': TiktokIcon,
}

// Icone padrao para servicos nao mapeados
export const DEFAULT_ICON = GlobeIcon
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
    if (normalizedDomain.includes(key) || key.includes(normalizedDomain)) {
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
    Icon: MusicIcon,
    color: '#1DB954',
    hasIcon: true,
  }
}
