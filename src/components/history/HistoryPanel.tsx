import * as React from 'react'
import { X, Trash2, Clock, RotateCcw, ExternalLink } from 'lucide-react'
import { useHistory, type HistoryItem } from '../../hooks/useHistory'
import { useCardStore } from '../../store/cardStore'

export const HistoryPanel: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const { history, loadFromHistory, deleteFromHistory } = useHistory()
  const setFullState = useCardStore(s => s.setFullState)

  const handleRestore = (item: HistoryItem) => {
    loadFromHistory(item)
    setFullState({ isWelcomeState: false })
    onClose()
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Excluir este card do histórico?')) {
      deleteFromHistory(id)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-sm w-full h-full border-none cursor-default"
        onClick={onClose}
        aria-label="Fechar histórico"
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-black/90 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Histórico</h2>
              <p className="text-xs text-white/50">
                {history.length} cards salvos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
            aria-label="Fechar painel de histórico"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <Clock className="mx-auto mb-4 opacity-30" size={48} />
              <p className="text-sm">Nenhum card salvo ainda.</p>
              <p className="text-xs mt-2 text-white/30">
                Cards aparecerão aqui após você baixar uma imagem.
              </p>
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className="group relative w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all cursor-pointer min-h-[44px]"
                onClick={() => handleRestore(item)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleRestore(item)
                  }
                }}
                aria-label={`Carregar card: ${item.title || 'Sem título'}`}
              >
                {/* Thumbnail Preview */}
                {item.previewImage && (
                  <div className="aspect-video bg-black/50 overflow-hidden">
                    <img
                      src={item.previewImage}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="p-4">
                  <h3
                    className="font-semibold text-sm truncate mb-1 group-hover:text-white transition-colors"
                    title={item.title}
                  >
                    {item.title || 'Sem título'}
                  </h3>
                  <p className="text-xs text-white/40 truncate flex items-center gap-1">
                    <ExternalLink size={10} />
                    {item.url}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-white/30">
                      {new Date(item.timestamp).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleRestore(item)
                        }}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
                        title="Restaurar"
                        aria-label={`Restaurar ${item.title}`}
                      >
                        <RotateCcw size={12} />
                      </button>
                      <button
                        onClick={e => handleDelete(e, item.id)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        title="Excluir"
                        aria-label={`Excluir ${item.title}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
