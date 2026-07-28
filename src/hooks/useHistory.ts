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
const CAPTURE_IMAGE_MAX_CHARS = 1_000_000

const snapshotPageCapture = (value: unknown) => {
  if (!value || typeof value !== 'object') return null
  const capture = value as Record<string, unknown>
  const image = capture.image

  if (
    typeof image !== 'string' ||
    image.length === 0 ||
    image.length > CAPTURE_IMAGE_MAX_CHARS
  ) {
    return null
  }

  return {
    ...capture,
    image,
  }
}

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
    // 🔥 ULTRA AGGRESSIVE: GitHub Pages projects share a 5MB limit per origin.
    const prune = (val: unknown) =>
      typeof val === 'string' && val.length > 30000 ? null : val

    // Strictly pick ONLY data fields to avoid saving functions or circular objects
    const leanState = {
      url: currentState.url,
      title: currentState.title,
      description: currentState.description,
      author: currentState.author,
      domain: currentState.domain,
      template: currentState.template,
      colors: currentState.colors,
      gradientStyle: currentState.gradientStyle,
      pattern: currentState.pattern,
      patternOpacity: currentState.patternOpacity,
      patternScale: currentState.patternScale,
      layout: currentState.layout,
      canvasSize: currentState.canvasSize,
      cardPosition: currentState.cardPosition,
      fontFamily: currentState.fontFamily,
      titleSize: currentState.titleSize,
      subtitleSize: currentState.subtitleSize,
      textAlign: currentState.textAlign,
      // Aggressive pruning for large base64
      image: prune(currentState.image),
      coverImage: prune(currentState.coverImage),
      pageCapture: snapshotPageCapture(currentState.pageCapture),
      customBgImage: prune(currentState.customBgImage),
      favicon: prune(currentState.favicon),
      outputMode: currentState.outputMode,
      pageFrame: currentState.pageFrame,
      mediaSource: currentState.mediaSource,
      captureViewport: currentState.captureViewport,
      captureArea: currentState.captureArea,
    }

    const newItem: HistoryItem = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString(),
      url: currentState.url as string,
      title: currentState.title as string,
      timestamp: Date.now(),
      // Prune preview image too if it somehow exceeds 30KB
      previewImage: prune(currentState.previewImage) as string | undefined,
      fullState: leanState as HistoryItem['fullState'],
    }

    setHistory(prev => {
      // Limit to 3 items to be extremely safe on shared origins
      const updated = [newItem, ...prev].slice(0, 3)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      } catch (e) {
        console.warn('Storage failed, saving only latest item', e)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem]))
          return [newItem]
        } catch {
          console.error(
            'Critical quota error: Local storage full across domain.'
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
      const pageCapture = stateToRestore.pageCapture
      if (
        pageCapture &&
        (typeof pageCapture !== 'object' ||
          typeof (pageCapture as Record<string, unknown>).image !== 'string' ||
          !(pageCapture as Record<string, unknown>).image)
      ) {
        stateToRestore.pageCapture = null
      }
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
