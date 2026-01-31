import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// Importa o módulo JSON reporter (CommonJS)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { save } = require('../../packages/reporters/json.cjs')

describe('JSON Reporter', () => {
  let tempDir: string

  beforeEach(() => {
    // Cria diretório temporário para testes
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-core-test-'))
  })

  afterEach(() => {
    // Limpa diretório temporário
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('should save JSON result to file', () => {
    const result = {
      status: 'pass',
      scores: {
        seo: 100,
        performance: 95,
      },
      violations: [],
    }

    const filename = 'test-result.json'
    const filepath = save(result, tempDir, filename)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(fs.existsSync(filepath)).toBe(true)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = fs.readFileSync(filepath, 'utf-8')
    const parsed = JSON.parse(content)

    expect(parsed).toEqual(result)
  })

  it('should create directory if it does not exist', () => {
    const result = { status: 'pass' }
    const nestedDir = path.join(tempDir, 'nested', 'reports')
    const filename = 'result.json'

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(fs.existsSync(nestedDir)).toBe(false)

    const filepath = save(result, nestedDir, filename)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(fs.existsSync(nestedDir)).toBe(true)
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(fs.existsSync(filepath)).toBe(true)
  })

  it('should return the full filepath', () => {
    const result = { status: 'pass' }
    const filename = 'my-report.json'

    const filepath = save(result, tempDir, filename)

    expect(filepath).toBe(path.join(tempDir, filename))
  })

  it('should format JSON with indentation', () => {
    const result = {
      status: 'pass',
      data: { nested: 'value' },
    }

    const filename = 'formatted.json'
    save(result, tempDir, filename)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = fs.readFileSync(path.join(tempDir, filename), 'utf-8')

    // Verifica se o JSON tem quebras de linha (formatado)
    expect(content).toContain('\n')
    expect(content).toContain('  ')
  })

  it('should handle complex nested objects', () => {
    const result = {
      status: 'fail',
      meta: {
        timestamp: Date.now(),
        preset: 'full',
        project: 'test',
      },
      scores: {
        seo: 85,
        performance: 90,
        accessibility: 100,
      },
      violations: [
        {
          area: 'seo',
          metric: 'title',
          value: 'missing',
          severity: 'error',
        },
      ],
      raw: {
        seo: { title: '', description: 'test' },
        performance: { lcp: 2000, cls: 0.05 },
      },
    }

    const filename = 'complex.json'
    const filepath = save(result, tempDir, filename)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = fs.readFileSync(filepath, 'utf-8')
    const parsed = JSON.parse(content)

    expect(parsed).toEqual(result)
  })

  it('should handle empty objects', () => {
    const result = {}

    const filename = 'empty.json'
    const filepath = save(result, tempDir, filename)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = fs.readFileSync(filepath, 'utf-8')
    const parsed = JSON.parse(content)

    expect(parsed).toEqual({})
  })

  it('should handle arrays', () => {
    const result = {
      items: [1, 2, 3],
      names: ['a', 'b', 'c'],
    }

    const filename = 'arrays.json'
    const filepath = save(result, tempDir, filename)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = fs.readFileSync(filepath, 'utf-8')
    const parsed = JSON.parse(content)

    expect(parsed.items).toHaveLength(3)
    expect(parsed.names).toContain('b')
  })

  it('should handle null values', () => {
    const result = {
      value: null,
      undefined: undefined,
    }

    const filename = 'nulls.json'
    const filepath = save(result, tempDir, filename)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = fs.readFileSync(filepath, 'utf-8')
    const parsed = JSON.parse(content)

    expect(parsed.value).toBeNull()
    // undefined não é serializado em JSON
    expect(parsed.undefined).toBeUndefined()
  })
})
