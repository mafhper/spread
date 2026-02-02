export const LOCALSTORAGE_KEY = 'spread_pending_url'

export function getPendingUrl(): string | null {
  try {
    return localStorage.getItem(LOCALSTORAGE_KEY)
  } catch (e) {
    console.error('[persistence] getPendingUrl error', e)
    return null
  }
}

export function setPendingUrl(url: string): void {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, url)
  } catch (e) {
    console.error('[persistence] setPendingUrl error', e)
  }
}

export function removePendingUrl(): void {
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY)
  } catch (e) {
    console.error('[persistence] removePendingUrl error', e)
  }
}

// Async wrapper useful for tests that prefer awaiting persistence operations.
export function setPendingUrlAsync(url: string): Promise<void> {
  return new Promise(resolve => {
    try {
      // Use microtask to ensure write happens before resolve
      Promise.resolve().then(() => {
        setPendingUrl(url)
        resolve()
      })
    } catch (e) {
      console.error('[persistence] setPendingUrlAsync error', e)
      resolve()
    }
  })
}

export function removePendingUrlAsync(): Promise<void> {
  return new Promise(resolve => {
    try {
      Promise.resolve().then(() => {
        removePendingUrl()
        resolve()
      })
    } catch (e) {
      console.error('[persistence] removePendingUrlAsync error', e)
      resolve()
    }
  })
}
