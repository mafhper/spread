import { isDevMode } from './env'

export function log(
  componentId: string,
  message: string,
  ...payload: unknown[]
) {
  if (!isDevMode()) return
  console.log(`[${componentId}-DEBUG] ${message}`, ...payload)
}
