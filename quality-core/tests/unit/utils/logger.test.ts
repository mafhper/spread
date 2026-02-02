import { describe, it, expect, vi, beforeEach } from 'vitest'
import { log } from '@/utils/logger'
import { isDevMode } from '@/utils/env'

vi.mock('@/utils/env', () => ({
  isDevMode: vi.fn(),
}))

describe('logger utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should log message in dev mode', () => {
    vi.mocked(isDevMode).mockReturnValue(true)

    log('TEST', 'Hello world', { data: 123 })

    expect(console.log).toHaveBeenCalledWith('[TEST-DEBUG] Hello world', {
      data: 123,
    })
  })

  it('should NOT log message in production mode', () => {
    vi.mocked(isDevMode).mockReturnValue(false)

    log('TEST', 'Hello world')

    expect(console.log).not.toHaveBeenCalled()
  })
})
