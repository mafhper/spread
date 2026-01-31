/**
 * Assert utilities para garantir mocks completos
 * Evita falhas por propriedades undefined
 */

export const assertCompleteMock = (
  mock: Record<string, unknown>,
  componentName: string
) => {
  const undefinedProps = Object.entries(mock)
    .filter(([, value]) => value === undefined)
    .map(([key]) => key)

  if (undefinedProps.length > 0) {
    throw new Error(
      `🚨 ${componentName} mock has undefined props: ${undefinedProps.join(', ')}. ` +
        `Use createMockCardStore() from quality-core/tests/unit/mocks/useCardStore.ts`
    )
  }
}

/**
 * Verifica propriedades aninhadas especificas que costumam faltar
 */
export const assertNestedPropsComplete = (
  mock: Record<string, unknown>,
  componentName: string
) => {
  const requiredNested = ['layout', 'colors', 'canvasSize', 'cardPosition']

  requiredNested.forEach(nestedKey => {
    // eslint-disable-next-line security/detect-object-injection
    if (!mock[nestedKey]) {
      throw new Error(`🚨 ${componentName} missing nested prop: '${nestedKey}'`)
    }

    // eslint-disable-next-line security/detect-object-injection
    const nested = mock[nestedKey] as Record<string, unknown>
    const undefinedNested = Object.entries(nested)
      .filter(([, value]) => value === undefined)
      .map(([key]) => `${nestedKey}.${key}`)

    if (undefinedNested.length > 0) {
      throw new Error(
        `🚨 ${componentName} has undefined nested props: ${undefinedNested.join(', ')}`
      )
    }
  })
}
