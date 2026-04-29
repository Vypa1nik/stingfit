import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

function readText(path: string) {
  return readFileSync(path, 'utf8')
}

describe('StingFit iconset assets', () => {
  test('uses an explicit high-voltage StingFit SVG icon source for browser and PWA metadata', () => {
    expect(existsSync('public/stingfit-icon.svg')).toBe(true)
    const icon = readText('public/stingfit-icon.svg')
    const favicon = readText('public/favicon.svg')
    const html = readText('index.html')
    const manifest = JSON.parse(readText('public/manifest.webmanifest')) as { icons: Array<{ src: string; type?: string; purpose?: string }> }
    const serviceWorker = readText('public/sw.js')

    expect(icon).toContain('StingFit high-voltage wasp mark')
    expect(icon).toContain('#FFFF00')
    expect(icon).toContain('#000000')
    expect(favicon).toBe(icon)
    expect(html).toContain('href="/stingfit-icon.svg"')
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: '/stingfit-icon.svg', type: 'image/svg+xml', purpose: 'any maskable' }),
      expect.objectContaining({ src: '/icon-192.png', purpose: 'any maskable' }),
      expect.objectContaining({ src: '/icon-512.png', purpose: 'any maskable' }),
    ]))
    expect(serviceWorker).toContain('/stingfit-icon.svg')
  })

  test('does not ship unused legacy social icon sprites in public assets', () => {
    expect(existsSync('public/icons.svg')).toBe(false)
  })
})
