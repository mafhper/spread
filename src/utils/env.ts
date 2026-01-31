export const isDevMode = (): boolean => {
  if (
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev')
  ) {
    return true
  }
  if (typeof window !== 'undefined') {
    try {
      const host = window.location.hostname
      return host === 'localhost' || host === '127.0.0.1'
    } catch {
      // ignore
    }
  }
  return false
}
