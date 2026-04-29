import { existsSync, readdirSync, readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

function readText(path: string) {
  return readFileSync(path, 'utf8')
}

describe('StingFit PWA install and offline assets', () => {
  test('manifest exposes install metadata, shortcuts, and screenshots for the fitness app', () => {
    const manifest = JSON.parse(readText('public/manifest.webmanifest')) as {
      name: string
      display: string
      orientation?: string
      categories?: string[]
      shortcuts?: Array<{ name: string; url: string }>
      screenshots?: Array<{ src: string; sizes: string; type: string; form_factor?: string }>
      icons: Array<{ src: string; purpose?: string }>
    }

    expect(manifest.name).toBe('StingFit')
    expect(manifest.display).toBe('standalone')
    expect(manifest.orientation).toBe('portrait')
    expect(manifest.categories).toEqual(expect.arrayContaining(['fitness', 'health', 'sports']))
    expect(manifest.shortcuts).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Tréning', url: '/#/training' }),
      expect.objectContaining({ name: 'Rýchly tréning', url: '/#/quick' }),
      expect.objectContaining({ name: 'História', url: '/#/history' }),
    ]))
    expect(manifest.screenshots).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: '/screenshots/stingfit-training.svg', type: 'image/svg+xml', form_factor: 'narrow' }),
      expect.objectContaining({ src: '/screenshots/stingfit-stats.svg', type: 'image/svg+xml', form_factor: 'wide' }),
    ]))
    expect(manifest.icons.some((icon) => icon.purpose?.includes('maskable'))).toBe(true)
  })

  test('html and service worker provide mobile install metadata and offline fallback', () => {
    const html = readText('index.html')
    const serviceWorker = readText('public/sw.js')

    expect(html).toContain('apple-mobile-web-app-capable')
    expect(html).toContain('apple-mobile-web-app-title')
    expect(html).toContain('apple-mobile-web-app-status-bar-style')
    expect(existsSync('public/offline.html')).toBe(true)
    expect(serviceWorker).toContain('/offline.html')
    expect(serviceWorker).toContain('cache.match(OFFLINE_FALLBACK)')
  })

  test('public PWA assets do not keep old LocalFlow preview names', () => {
    const publicFiles = readdirSync('public')

    expect(publicFiles.some((file) => file.toLocaleLowerCase('en-US').includes('localflow'))).toBe(false)
  })

  test('offline fallback is product-facing and privacy-safe', () => {
    const offline = readText('public/offline.html')

    expect(offline).toContain('StingFit funguje aj offline')
    expect(offline).toContain('Tréningové dáta zostávajú v zariadení')
    expect(offline).toContain('/#/training')
    expect(offline).not.toContain('LocalFlow')
  })
})
