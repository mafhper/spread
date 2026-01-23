import { useState, useEffect } from 'react'
import { useCardStore } from '../store/cardStore'

export interface HistoryItem {
  id: string
  url: string
  title: string
  timestamp: number
  previewImage?: string // Base64 thumbnail
  // Store the full state to restore
  fullState: Record<string, unknown>
}

const STORAGE_KEY = 'spread_history_v1'

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const { setFullState } = useCardStore()

  useEffect(() => {
    // Load initial history
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {
        console.error('Failed to parse history')
      }
    }
  }, [])

  const saveToHistory = (currentState: Record<string, unknown>) => {
    // Create a lean version of state to save
    const leanState = { ...currentState }

    // Don't save large base64 strings in history if possible, or limit them
    // For now, we'll keep the image but limit the array size strictly

    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      url: currentState.url as string,
      title: currentState.title as string,
      timestamp: Date.now(),
      // Save the main image or custom background as preview
      previewImage: (currentState.previewImage ||
        currentState.image ||
        currentState.customBgImage ||
        currentState.favicon) as string | undefined,
      fullState: leanState,
    }

    setHistory(prev => {
      // Limit to 10 items to prevent QuotaExceeded
      const updated = [newItem, ...prev].slice(0, 10)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        console.error('Local storage full, clearing old history')
        // If still full, clear all
        return [newItem]
      }
      return updated
    })
  }

  const loadFromHistory = (item: HistoryItem) => {
    if (item.fullState) {
      setFullState({ ...item.fullState, isWelcomeState: false })
    }
  }

  const deleteFromHistory = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(i => i.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return {
    history,
    saveToHistory,
    loadFromHistory,
    deleteFromHistory,
  }
}
