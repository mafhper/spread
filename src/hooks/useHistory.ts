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
    // 🔥 NEW: Extremely aggressive pruning for storage
    const pruneValue = (val: unknown) =>
      typeof val === 'string' && val.length > 50000 ? null : val

    const leanState: Record<string, unknown> = { ...currentState }
    // Remove individual large assets from the nested state to save space
    if (leanState.image) leanState.image = pruneValue(leanState.image)
    if (leanState.customBgImage)
      leanState.customBgImage = pruneValue(leanState.customBgImage)
    if (leanState.favicon) leanState.favicon = pruneValue(leanState.favicon)
    // Avoid double-saving the preview image inside fullState
    delete leanState.previewImage

    const newItem: HistoryItem = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString(),
      url: currentState.url as string,
      title: currentState.title as string,
      timestamp: Date.now(),
      // The previewImage (low-res thumbnail) is our primary visual in history
      previewImage: currentState.previewImage as string | undefined,
      fullState: leanState,
    }

    setHistory(prev => {
      // Limit to 4 items - each could still be ~1MB if not pruned enough
      const updated = [newItem, ...prev].slice(0, 4)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      } catch (e) {
        console.error('Local storage full, saving only the latest item', e)
        const singleItem = [newItem]
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(singleItem))
          return singleItem
        } catch (err) {
          console.error(
            'Critical: Cannot save even a single history item.',
            err
          )
          return prev
        }
      }
    })
  }

  const loadFromHistory = (item: HistoryItem) => {
    if (item.fullState) {
      // If we pruned high-res images to save space, fallback to the thumbnail we kept
      const stateToRestore = { ...item.fullState }
      if (!stateToRestore.image && item.previewImage) {
        stateToRestore.image = item.previewImage
      }

      setFullState({ ...stateToRestore, isWelcomeState: false })
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
