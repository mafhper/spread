import { expect, test } from '@playwright/test'

test('landing presents the product and opens the editor', async ({
  page,
}, testInfo) => {
  await page.goto('./')
  await page.waitForLoadState('domcontentloaded')

  await expect(
    page.getByRole('heading', {
      name: 'Cole um link. Ajuste o visual. Exporte.',
    })
  ).toBeVisible()
  await expect(page.getByTestId('composition-artboard')).toHaveCount(1)
  await expect(
    page.getByRole('button', { name: 'Psiu Liniker' })
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#previewCard h2')).toHaveText('Psiu', {
    timeout: 10_000,
  })

  await page
    .getByRole('button', { name: 'Cold Little Heart Michael Kiwanuka' })
    .click()
  await expect(page.locator('#previewCard h2')).toHaveText('Cold Little Heart')
  await expect(
    page.getByTestId('composition-artboard').getByText('Michael Kiwanuka')
  ).toBeVisible()

  await page.screenshot({
    path: `output/playwright/landing-${testInfo.project.name}.png`,
    fullPage: true,
  })

  await page.getByRole('link', { name: 'Abrir editor' }).click()
  await expect(page).toHaveURL(/\/spread\/editor\/$/)
  await expect(page.getByRole('main')).toHaveClass(/studio-shell/)
})

test('landing examples preserve persisted editor preferences', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  const savedColors = {
    bg1: '#112233',
    bg2: '#445566',
    text: '#fefefe',
  }
  await page.addInitScript(colors => {
    localStorage.setItem(
      'spread-preferences-v4',
      JSON.stringify({ state: { colors }, version: 0 })
    )
  }, savedColors)

  await page.goto('./')
  await expect(page.locator('#previewCard h2')).toHaveText('Psiu', {
    timeout: 10_000,
  })
  await page
    .getByRole('button', { name: 'Cold Little Heart Michael Kiwanuka' })
    .click()
  await expect(page.locator('#previewCard h2')).toHaveText('Cold Little Heart')

  const persistedColors = await page.evaluate(() => {
    const persisted = JSON.parse(
      localStorage.getItem('spread-preferences-v4') || '{}'
    )
    return persisted.state?.colors
  })
  expect(persistedColors).toEqual(savedColors)
})

test('editor renders one canonical artboard and responsive controls', async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = []
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('editor/')
  await page.waitForLoadState('networkidle')
  const artboard = page.getByTestId('composition-artboard')
  await expect(artboard).toHaveCount(1)
  await expect
    .poll(async () => {
      const [artboardBox, stageBox] = await Promise.all([
        artboard.boundingBox(),
        page.locator('.studio-stage').boundingBox(),
      ])
      if (!artboardBox || !stageBox) return false
      return (
        artboardBox.x >= stageBox.x - 1 &&
        artboardBox.y >= stageBox.y - 1 &&
        artboardBox.x + artboardBox.width <= stageBox.x + stageBox.width + 1 &&
        artboardBox.y + artboardBox.height <= stageBox.y + stageBox.height + 1
      )
    })
    .toBe(true)

  if (testInfo.project.name === 'mobile') {
    await expect(page.getByRole('button', { name: 'Ajustes' })).toBeVisible()
    await page.getByRole('button', { name: 'Ajustes' }).click()
    await expect(
      page.getByText('Conteúdo, enquadramento e aparência')
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(
      page.getByText('Conteúdo, enquadramento e aparência')
    ).toBeHidden()
  } else {
    await expect(
      page.getByText('Conteúdo, enquadramento e aparência')
    ).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Composição' })).toBeVisible()
  }

  await page.screenshot({
    path: `output/playwright/editor-${testInfo.project.name}.png`,
    fullPage: true,
  })

  expect(consoleErrors).toEqual([])
})

test('built-in preset changes style without replacing content', async ({
  page,
}, testInfo) => {
  await page.goto('editor/')
  await page.waitForLoadState('networkidle')
  const title = page.locator('#previewCard h2').first()
  const originalTitle = await title.textContent()

  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Ajustes' }).click()
  }
  await page.getByRole('tab', { name: 'Aparência' }).click()
  await page.getByRole('button', { name: 'Clean Dark' }).click()

  await expect(title).toHaveText(originalTitle || '')
  await expect(page.getByText('Clean Dark aplicado.')).toBeAttached()
})

test('PNG export uses the visible artboard dimensions without clipping the header', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.goto('editor/')
  await page.waitForLoadState('networkidle')

  const artboard = page.getByTestId('composition-artboard')
  const brand = artboard.getByText('Spread', { exact: true })
  const brandLogo = artboard.getByTestId('card-brand-logo')
  const brandTitle = artboard.getByTestId('card-brand-title')
  const [artboardBox, cardBox, brandBox, brandLogoBox, brandTitleBox] =
    await Promise.all([
      artboard.boundingBox(),
      page.locator('#previewCard').boundingBox(),
      brand.boundingBox(),
      brandLogo.boundingBox(),
      brandTitle.boundingBox(),
    ])
  expect(artboardBox).not.toBeNull()
  expect(cardBox).not.toBeNull()
  expect(brandBox).not.toBeNull()
  expect(brandLogoBox).not.toBeNull()
  expect(brandTitleBox).not.toBeNull()
  expect(brandBox!.x).toBeGreaterThanOrEqual(artboardBox!.x)
  expect(brandBox!.y).toBeGreaterThanOrEqual(artboardBox!.y)
  expect(brandBox!.x + brandBox!.width).toBeLessThanOrEqual(
    artboardBox!.x + artboardBox!.width
  )
  expect(brandLogoBox!.x + brandLogoBox!.width).toBeLessThanOrEqual(
    brandTitleBox!.x
  )
  expect(
    Math.abs(
      cardBox!.x +
        cardBox!.width / 2 -
        (artboardBox!.x + artboardBox!.width / 2)
    )
  ).toBeLessThanOrEqual(1)

  await page.getByRole('tab', { name: 'Composição' }).click()
  for (const preset of ['Auto', 'Post', 'Story', 'Twitter']) {
    await page.getByRole('button', { name: `Tamanho ${preset}` }).click()
    await expect
      .poll(async () => {
        const [canvas, card] = await Promise.all([
          artboard.boundingBox(),
          page.locator('#previewCard').boundingBox(),
        ])
        if (!canvas || !card) return Number.POSITIVE_INFINITY
        return Math.abs(card.x + card.width / 2 - (canvas.x + canvas.width / 2))
      })
      .toBeLessThanOrEqual(1)
  }

  const exportSafeStyles = await artboard
    .getByTestId('card-brand-header')
    .locator('div')
    .evaluate(element => {
      const styles = getComputedStyle(element)
      return {
        backdropFilter: styles.backdropFilter,
        transform: styles.transform,
      }
    })
  expect(exportSafeStyles.backdropFilter).toBe('none')
  expect(exportSafeStyles.transform).toBe('none')

  const expected = await artboard.evaluate((element: HTMLElement) => ({
    width: element.offsetWidth * 2,
    height: element.offsetHeight * 2,
  }))
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar' }).click()
  const download = await downloadPromise
  const stream = await download.createReadStream()
  expect(stream).not.toBeNull()
  const chunks: Buffer[] = []
  for await (const chunk of stream!) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  const png = Buffer.concat(chunks)

  expect(png.subarray(1, 4).toString('ascii')).toBe('PNG')
  expect(png.readUInt32BE(16)).toBe(expected.width)
  expect(png.readUInt32BE(20)).toBe(expected.height)
})

test('draft and user presets survive reload', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.goto('editor/')
  await page.waitForLoadState('networkidle')

  const title = page.getByLabel('Título')
  await title.fill('Rascunho persistido')
  await page.waitForTimeout(650)

  await page.getByRole('tab', { name: 'Aparência' }).click()
  await page.getByPlaceholder('Nome do estilo').fill('Meu estilo')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(
    page.getByRole('button', { name: 'Meu estilo', exact: true })
  ).toBeVisible()

  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.getByLabel('Título')).toHaveValue('Rascunho persistido')
  await page.getByRole('tab', { name: 'Aparência' }).click()
  await expect(
    page.getByRole('button', { name: 'Meu estilo', exact: true })
  ).toBeVisible()

  await page.getByRole('button', { name: 'Excluir Meu estilo' }).click()
  await expect(
    page.getByRole('button', { name: 'Meu estilo', exact: true })
  ).toHaveCount(0)
})

test('local link fixtures cover metadata variants and preserve the document on failure', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  const fixtures = [
    { url: 'https://example.com/a', title: 'Fixture A' },
    { url: 'https://example.com/b', title: 'Fixture B', image: null },
    {
      url: 'https://open.spotify.com/track/c',
      title: 'Artist C - Track C',
      expected: 'Track C',
      author: 'Artist C',
    },
    { url: 'https://bbc.com/news/d', title: 'Fixture D' },
    {
      url: 'https://example.com/e',
      title:
        'Fixture E with a deliberately long title that wraps across multiple lines without clipping',
    },
    {
      url: 'https://example.com/f',
      title: 'Fixture F',
      description: 'Long description '.repeat(16),
    },
    {
      url: 'https://github.com/mafhper/spread',
      title: 'mafhper/spread: visual link composer',
      author: 'mafhper',
    },
  ]

  await page.route('https://api.microlink.io/**', async route => {
    const target = new URL(route.request().url()).searchParams.get('url') || ''
    if (target.includes('failure.test')) {
      await route.fulfill({ json: { status: 'error' } })
      return
    }
    const fixture = fixtures.find(item => item.url === target)
    await route.fulfill({
      json: {
        status: 'success',
        data: {
          title: fixture?.title || 'Fixture',
          description: fixture?.description || 'Fixture description',
          author: fixture?.author || '',
          image:
            fixture?.image === null
              ? null
              : {
                  url: 'http://127.0.0.1:4321/spread/assets/social-preview.png',
                },
          logo: { url: 'http://127.0.0.1:4321/spread/logo.svg' },
        },
      },
    })
  })

  await page.goto('editor/')
  await page.waitForLoadState('networkidle')
  const source = page.getByLabel('URL do link')
  const title = page.getByLabel('Título')

  for (const fixture of fixtures) {
    await source.fill(fixture.url)
    await page.getByRole('button', { name: 'Carregar link' }).click()
    await expect(title).toHaveValue(fixture.expected || fixture.title)
    await expect(page.getByTestId('composition-artboard')).toHaveCount(1)
  }

  const preservedTitle = await title.inputValue()
  await source.fill('https://failure.test/page')
  await page.getByRole('button', { name: 'Carregar link' }).click()
  await expect(page.getByText('Não foi possível ler este link.')).toBeVisible()
  await expect(title).toHaveValue(preservedTitle)
})

test('rendered page capture waits for the page and exposes visual framing controls', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  let captureRequest: URL | null = null

  await page.route('https://api.microlink.io/**', async route => {
    captureRequest = new URL(route.request().url())
    await route.fulfill({
      json: {
        status: 'success',
        data: {
          title: 'Dynamic page ready',
          description: 'Content loaded after the app became stable.',
          image: {
            url: 'http://127.0.0.1:4321/spread/assets/social-preview.png',
          },
          screenshot: {
            url: 'http://127.0.0.1:4321/spread/assets/social-preview.png',
          },
          logo: { url: 'http://127.0.0.1:4321/spread/logo.svg' },
        },
      },
    })
  })

  await page.goto('editor/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('main')).toHaveAttribute('data-ready', 'true', {
    timeout: 10_000,
  })
  await page
    .locator('#studio-source-url')
    .fill('https://example.com/dynamic-app')
  await page
    .getByRole('button', {
      name: 'Captura da página Exportação limpa da página',
    })
    .click()
  await page.getByRole('button', { name: 'Celular 390 × 844' }).click()
  await page
    .getByLabel('Área capturada')
    .selectOption({ label: 'Conteúdo principal' })
  await page.getByRole('button', { name: 'Capturar página' }).click()

  await expect(
    page.getByRole('img', { name: 'Página capturada' })
  ).toBeVisible()
  await expect(page.getByText('Conteúdo atualizado.')).toBeVisible()
  expect(captureRequest).not.toBeNull()
  expect(captureRequest!.searchParams.get('waitUntil')).toBe('networkidle0')
  expect(captureRequest!.searchParams.get('waitForTimeout')).toBe('1500')
  expect(captureRequest!.searchParams.get('viewport.width')).toBe('390')
  expect(captureRequest!.searchParams.get('viewport.height')).toBe('844')
  expect(captureRequest!.searchParams.get('screenshot.element')).toBe('main')

  await page.getByRole('tab', { name: 'Composição' }).click()
  await page.getByRole('button', { name: 'Superior direito' }).click()
  await expect(
    page.getByRole('button', { name: 'Superior direito' })
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('slider', { name: 'Zoom da captura' }).fill('1.5')
  await expect(
    page.getByTestId('composition-artboard').getByRole('img', {
      name: 'Página capturada',
    })
  ).toHaveAttribute('style', /width/)
})

test('background color editing after loading a link uses the in-app picker', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  const consoleErrors: string[] = []
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.addInitScript(() => {
    Object.defineProperty(window, 'EyeDropper', {
      configurable: true,
      value: class {
        async open() {
          return { sRGBHex: '#654321' }
        }
      },
    })
  })
  await page.route('https://api.microlink.io/**', async route => {
    await route.fulfill({
      json: {
        status: 'success',
        data: {
          title: 'Link carregado',
          description: 'Descrição do link carregado',
          author: '',
          image: null,
          logo: { url: 'http://127.0.0.1:4321/spread/logo.svg' },
        },
      },
    })
  })

  await page.goto('editor/')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('URL do link').fill('https://example.com/card')
  await page.getByRole('button', { name: 'Carregar link' }).click()
  await expect(page.getByLabel('Título')).toHaveValue('Link carregado')

  await page.getByRole('tab', { name: 'Aparência' }).click()
  const color1 = page.getByRole('textbox', { name: 'Cor 1', exact: true })
  const manualSummary = page.getByText(/^#[0-9A-F]{6} → #[0-9A-F]{6}$/).first()
  const summaryWidthBefore = await manualSummary.evaluate(element =>
    Math.round(element.getBoundingClientRect().width)
  )
  await expect(color1).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Abrir seletor Cor 1' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Seletor Cor 1' })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Selecionar Cor 1' })
    .click({ position: { x: 120, y: 48 } })
  await expect(color1).not.toHaveValue('#0f172a')
  await page.getByRole('button', { name: 'Capturar Cor 1 da tela' }).click()
  await expect(color1).toHaveValue('#654321')
  await expect
    .poll(async () =>
      page
        .getByText(/^#[0-9A-F]{6} → #[0-9A-F]{6}$/)
        .first()
        .evaluate(element => Math.round(element.getBoundingClientRect().width))
    )
    .toBe(summaryWidthBefore)
  await expect(page.getByTestId('composition-artboard')).toHaveAttribute(
    'style',
    /rgb\(101, 67, 33\)/
  )
  await color1.fill('#123456')
  await color1.press('Tab')
  await expect(color1).toHaveValue('#123456')
  await expect(page.getByTestId('composition-artboard')).toHaveAttribute(
    'style',
    /rgb\(18, 52, 86\)/
  )
  expect(consoleErrors).toEqual([])
})
