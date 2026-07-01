import { readFile } from 'node:fs/promises'
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

  await page.screenshot({
    path: `output/playwright/landing-${testInfo.project.name}.png`,
    fullPage: true,
  })

  await page.getByRole('link', { name: 'Abrir editor' }).click()
  await expect(page).toHaveURL(/\/spread\/editor\/$/)
  await expect(page.getByRole('main')).toHaveClass(/studio-shell/)
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
    await expect(page.getByRole('button', { name: 'Conteúdo' })).toBeVisible()
    await page.getByRole('button', { name: 'Conteúdo' }).click()
    await expect(page.getByText('Fonte e direção visual')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText('Fonte e direção visual')).toBeHidden()
  } else {
    await expect(page.getByText('Fonte e direção visual')).toBeVisible()
    await expect(page.getByText('Ajustes do elemento')).toBeVisible()
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
    await page.getByRole('button', { name: 'Conteúdo' }).click()
  }
  await page.getByRole('tab', { name: 'Presets' }).click()
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
  const [artboardBox, brandBox] = await Promise.all([
    artboard.boundingBox(),
    brand.boundingBox(),
  ])
  expect(artboardBox).not.toBeNull()
  expect(brandBox).not.toBeNull()
  expect(brandBox!.x).toBeGreaterThanOrEqual(artboardBox!.x)
  expect(brandBox!.y).toBeGreaterThanOrEqual(artboardBox!.y)
  expect(brandBox!.x + brandBox!.width).toBeLessThanOrEqual(
    artboardBox!.x + artboardBox!.width
  )

  const expected = await artboard.evaluate((element: HTMLElement) => ({
    width: element.offsetWidth * 2,
    height: element.offsetHeight * 2,
  }))
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar' }).click()
  const download = await downloadPromise
  const path = await download.path()
  expect(path).not.toBeNull()
  const png = await readFile(path!)

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

  await page.getByRole('tab', { name: 'Presets' }).click()
  await page.getByPlaceholder('Nome do estilo').fill('Meu estilo')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(
    page.getByRole('button', { name: 'Meu estilo', exact: true })
  ).toBeVisible()

  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.getByLabel('Título')).toHaveValue('Rascunho persistido')
  await page.getByRole('tab', { name: 'Presets' }).click()
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
