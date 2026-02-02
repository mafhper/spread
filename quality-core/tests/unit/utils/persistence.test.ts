// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getPendingUrl,
  setPendingUrl,
  removePendingUrl,
  setPendingUrlAsync,
  removePendingUrlAsync,
} from '../../../../src/utils/persistence'

describe('persistence utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('set/get/remove pending url (sync)', () => {
    expect(getPendingUrl()).toBeNull()
    setPendingUrl('https://example.com')
    expect(getPendingUrl()).toBe('https://example.com')
    removePendingUrl()
    expect(getPendingUrl()).toBeNull()
  })

  it('set/remove pending url async', async () => {
    expect(getPendingUrl()).toBeNull()
    await setPendingUrlAsync('https://async.com')
    expect(getPendingUrl()).toBe('https://async.com')
    await removePendingUrlAsync()
    expect(getPendingUrl()).toBeNull()
  })

  it('handles empty string URL', () => {
    setPendingUrl('')
    expect(getPendingUrl()).toBe('')
    removePendingUrl()
    expect(getPendingUrl()).toBeNull()
  })

  it('overwrites existing URL with new URL', () => {
    setPendingUrl('https://first.com')
    expect(getPendingUrl()).toBe('https://first.com')
    setPendingUrl('https://second.com')
    expect(getPendingUrl()).toBe('https://second.com')
    removePendingUrl()
  })

  it('handles special characters in URL', () => {
    const specialUrl = 'https://example.com?query=test&foo=bar#anchor'
    setPendingUrl(specialUrl)
    expect(getPendingUrl()).toBe(specialUrl)
    removePendingUrl()
  })

  it('async set/remove with multiple sequential calls', async () => {
    await setPendingUrlAsync('https://first.com')
    expect(getPendingUrl()).toBe('https://first.com')
    await setPendingUrlAsync('https://second.com')
    expect(getPendingUrl()).toBe('https://second.com')
    await removePendingUrlAsync()
    expect(getPendingUrl()).toBeNull()
  })

  it('remove when URL does not exist', () => {
    expect(getPendingUrl()).toBeNull()
    removePendingUrl()
    expect(getPendingUrl()).toBeNull()
  })

  it('async remove when URL does not exist', async () => {
    expect(getPendingUrl()).toBeNull()
    await removePendingUrlAsync()
    expect(getPendingUrl()).toBeNull()
  })
})
