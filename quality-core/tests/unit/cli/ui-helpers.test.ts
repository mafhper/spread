import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest'
import * as UI from '../../../cli/ui-helpers.cjs'

describe('UI Helpers - printSummary', () => {
  let consoleSpy: MockInstance

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should print a basic summary with title and duration', () => {
    UI.printSummary({
      title: 'TEST TITLE',
      duration: 1.23,
    })

    const calls = consoleSpy.mock.calls.flat().join('\n')
    expect(calls).toContain('📊 RESUMO DA EXECUÇÃO - TEST TITLE')
    expect(calls).toContain('⏱️  Tempo de execução: 1.23s')
  })

  it('should print pass status', () => {
    UI.printSummary({
      title: 'TEST',
      status: 'pass',
    })

    const calls = consoleSpy.mock.calls.flat().join('\n')
    expect(calls).toContain('✅ Status: PASSOU')
  })

  it('should print fail status', () => {
    UI.printSummary({
      title: 'TEST',
      status: 'fail',
    })

    const calls = consoleSpy.mock.calls.flat().join('\n')
    expect(calls).toContain('❌ Status: FALHOU')
  })

  it('should print metrics', () => {
    UI.printSummary({
      title: 'TEST',
      metrics: ['Metric 1: 100', 'Metric 2: 200'],
    })

    const calls = consoleSpy.mock.calls.flat().join('\n')
    expect(calls).toContain('Metric 1: 100')
    expect(calls).toContain('Metric 2: 200')
  })

  it('should print errors', () => {
    UI.printSummary({
      title: 'TEST',
      errors: ['Error 1', 'Error 2'],
    })

    const calls = consoleSpy.mock.calls.flat().join('\n')
    expect(calls).toContain('❌ Erros (2):')
    expect(calls).toContain('- Error 1')
    expect(calls).toContain('- Error 2')
  })

  it('should print warnings', () => {
    UI.printSummary({
      title: 'TEST',
      warnings: ['Warn 1'],
    })

    const calls = consoleSpy.mock.calls.flat().join('\n')
    expect(calls).toContain('⚠️  Avisos (1):')
    expect(calls).toContain('- Warn 1')
  })

  it('should print report directory', () => {
    UI.printSummary({
      title: 'TEST',
      reportDir: '/path/to/reports',
    })

    const calls = consoleSpy.mock.calls.flat().join('\n')
    expect(calls).toContain('📁 Relatórios: /path/to/reports')
  })
})
