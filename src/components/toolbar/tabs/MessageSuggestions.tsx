import React, { useState, useEffect } from 'react'
import { Check, Copy, MessageSquare } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import { generateMessageSuggestions } from '../../../services/messageSuggestions'
import { getServiceIcon } from '../../../services/iconLibrary'
import type { MessageSuggestion } from '../../../types/messages'

// Labels dos tons
const TONE_LABELS: Record<string, string> = {
  casual: 'Casual',
  neutral: 'Neutro',
  excited: 'Animado',
}

// Cores por tom
const TONE_COLORS: Record<string, string> = {
  casual: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  excited: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export const MessageSuggestions: React.FC = () => {
  const { url, title, description, author, domain, template, isWelcomeState } =
    useCardStore()
  const [suggestions, setSuggestions] = useState<MessageSuggestion[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Gera sugestoes quando os metadados mudam
  useEffect(() => {
    if (isWelcomeState || !url) {
      setSuggestions([])
      return
    }

    const metadata = {
      title,
      description,
      author,
      domain,
      template,
      url,
    }

    const newSuggestions = generateMessageSuggestions(metadata)
    setSuggestions(newSuggestions)
  }, [url, title, description, author, domain, template, isWelcomeState])

  // Copia o texto para a área de transferência
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)

      // Remove o feedback após 2 segundos
      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Se não há link processado, mostra estado vazio
  if (isWelcomeState || !url || suggestions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-white/40">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            Cole um link para gerar sugestões de mensagens
          </p>
          <p className="text-xs mt-1 text-white/30">
            As sugestões aparecerão aqui automaticamente
          </p>
        </div>
      </div>
    )
  }

  // Obtém o ícone e cor do serviço
  const { Icon: PlatformIcon, color: platformColor } = getServiceIcon(domain)

  return (
    <div className="space-y-4">
      {/* Header com informação da plataforma detectada */}
      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${platformColor}20`,
            color: platformColor,
          }}
        >
          <PlatformIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/50">Plataforma detectada</p>
          <p className="text-sm font-medium text-white truncate">
            {suggestions[0]?.label || 'Link Genérico'}
          </p>
        </div>
      </div>

      {/* Lista de sugestões */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
          Sugestões de Mensagens
        </h4>

        {suggestions.map(suggestion => (
          <div
            key={suggestion.id}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-200"
          >
            {/* Badge do tom */}
            <div className="absolute top-2 right-2 z-10">
              <span
                className={`px-2 py-0.5 text-[9px] font-medium rounded-full border ${TONE_COLORS[suggestion.tone]}`}
              >
                {TONE_LABELS[suggestion.tone]}
              </span>
            </div>

            {/* Preview da mensagem */}
            <div className="p-3 pt-7">
              <pre className="text-xs text-white/80 font-mono whitespace-pre-wrap break-words leading-relaxed">
                {suggestion.text}
              </pre>
            </div>

            {/* Botão de copiar */}
            <div className="px-3 pb-3">
              <button
                onClick={() => handleCopy(suggestion.text, suggestion.id)}
                className={`w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-medium transition-all duration-200 ${
                  copiedId === suggestion.id
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10 hover:border-white/30'
                }`}
              >
                {copiedId === suggestion.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar mensagem</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dica de uso */}
      <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
        <p className="text-[10px] text-blue-400/80 leading-relaxed">
          💡 <strong>Dica:</strong> As mensagens são formatadas automaticamente
          com base no tipo de conteúdo detectado. Escolha o tom que melhor se
          adapta ao seu estilo de compartilhamento.
        </p>
      </div>

      {/* Formatos suportados */}
      <div className="pt-2 border-t border-white/5">
        <p className="text-[10px] text-white/30 mb-2">
          Plataformas suportadas:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            'YouTube',
            'Spotify',
            'Twitter/X',
            'Instagram',
            'SoundCloud',
            'Bandcamp',
            'Apple Music',
          ].map(platform => (
            <span
              key={platform}
              className="px-2 py-0.5 text-[9px] bg-white/5 text-white/40 rounded"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
