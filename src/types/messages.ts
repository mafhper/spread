/**
 * Tipos para Sugestões de Mensagens por Plataforma
 */

/**
 * Tipo de plataforma detectada
 */
export type PlatformType =
  | 'youtube-music'
  | 'youtube'
  | 'twitter'
  | 'instagram'
  | 'spotify'
  | 'soundcloud'
  | 'bandcamp'
  | 'apple-music'
  | 'deezer'
  | 'tidal'
  | 'generic'

/**
 * Sugestão de mensagem individual
 */
export interface MessageSuggestion {
  /** Identificador único da sugestão */
  id: string
  /** Tipo da plataforma */
  platform: PlatformType
  /** Label amigável da plataforma */
  label: string
  /** Texto da mensagem formatada */
  text: string
  /** Nome do ícone do react-icons */
  icon: string
  /** Variação de tom (casual, formal, entusiasmado) */
  tone: 'casual' | 'neutral' | 'excited'
}

/**
 * Configuração de formatação para uma plataforma
 */
export interface PlatformConfig {
  /** Tipo da plataforma */
  type: PlatformType
  /** Label amigável */
  label: string
  /** Domínios associados */
  domains: string[]
  /** Templates de mensagem */
  templates: MessageTemplate[]
}

/**
 * Template de mensagem
 */
export interface MessageTemplate {
  /** ID do template */
  id: string
  /** Tom da mensagem */
  tone: 'casual' | 'neutral' | 'excited'
  /** Texto introdutório */
  intro: string
  /** Formato do conteúdo */
  format: 'title-author' | 'title-only' | 'title-description' | 'music'
}

/**
 * Metadados do link para geração de mensagens
 */
export interface MessageMetadata {
  /** Título do conteúdo */
  title: string
  /** Descrição breve */
  description: string
  /** Autor/Artista */
  author: string
  /** Domínio da URL */
  domain: string
  /** Template detectado */
  template: 'default' | 'music' | 'news'
  /** URL completa */
  url: string
  /** Ano (para músicas) */
  year?: string
  /** Álbum (para músicas) */
  album?: string
}
