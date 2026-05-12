import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

import { APP_NAME, APP_VERSION } from '@/lib/constants'

function readText(path: string) {
  return readFileSync(path, 'utf8')
}

describe('StingFit V1 release identity', () => {
  test('uses StingFit browser metadata and High-Voltage Wasp colors', () => {
    const html = readText('index.html')

    expect(html).toContain('<title>StingFit</title>')
    expect(html).toContain('local-first fitness training')
    expect(html).toContain('content="#FFFF00"')
    expect(html).toContain('content="#000000"')
    expect(html).not.toContain('LocalFlow is a private, offline-first productivity workspace')
  })

  test('uses StingFit PWA manifest identity', () => {
    const manifest = JSON.parse(readText('public/manifest.webmanifest')) as {
      name: string
      short_name: string
      description: string
      start_url: string
      background_color: string
      theme_color: string
    }

    expect(manifest.name).toBe('StingFit')
    expect(manifest.short_name).toBe('StingFit')
    expect(manifest.description).toContain('local-first fitness')
    expect(manifest.start_url).toBe('./#/training')
    expect(manifest.background_color).toBe('#000000')
    expect(manifest.theme_color).toBe('#FFFF00')
  })

  test('uses a high-voltage yellow favicon instead of the old purple mark', () => {
    const favicon = readText('public/favicon.svg')

    expect(favicon).toContain('#FFFF00')
    expect(favicon).toContain('#000000')
    expect(favicon).not.toContain('#863bff')
    expect(favicon).not.toContain('#7e14ff')
  })

  test('reports StingFit V1 versions across release files', () => {
    const packageJson = JSON.parse(readText('package.json')) as { name: string; version: string }
    const packageLock = JSON.parse(readText('package-lock.json')) as { name: string; version: string; packages: Record<string, { name?: string; version?: string }> }
    const tauriConfig = JSON.parse(readText('src-tauri/tauri.conf.json')) as {
      productName: string
      version: string
      identifier: string
      app: { windows: Array<{ title: string }> }
    }
    const cargoToml = readText('src-tauri/Cargo.toml')

    expect(APP_NAME).toBe('StingFit')
    expect(APP_VERSION).toBe('1.0.0')
    expect(packageJson.name).toBe('stingfit')
    expect(packageLock.name).toBe('stingfit')
    expect(packageLock.packages['']?.name).toBe('stingfit')
    expect(packageJson.version).toBe('1.0.0')
    expect(packageLock.version).toBe('1.0.0')
    expect(packageLock.packages['']?.version).toBe('1.0.0')
    expect(tauriConfig.productName).toBe('StingFit')
    expect(tauriConfig.version).toBe('1.0.0')
    expect(tauriConfig.identifier).toBe('com.stingfit.app')
    expect(tauriConfig.app.windows[0]?.title).toBe('StingFit')
    expect(cargoToml).toContain('description = "StingFit desktop wrapper"')
  })

  test('runtime support files use StingFit identifiers instead of LocalFlow leftovers', () => {
    const runtimeFiles = [
      'public/sw.js',
      'src/hooks/useTheme.ts',
      'src-tauri/Cargo.toml',
      'src-tauri/src/main.rs',
      'tools/start-public-preview.ps1',
      'tools/stop-public-preview.ps1',
      'tools/generate-preview-qr.mjs',
      '.vscode/tasks.json',
    ]

    for (const file of runtimeFiles) {
      const source = readText(file)
      expect(source, file).not.toContain('LocalFlow')
      expect(source, file).not.toContain('localflow')
    }

    expect(readText('package.json')).toContain('.tmp-stingfit-public-url.txt')
    expect(readText('package.json')).not.toContain('.tmp-localflow-public-url.txt')
  })

  test('README presents StingFit V1 instead of the old productivity workspace', () => {
    const readme = readText('README.md')

    expect(readme.startsWith('# StingFit')).toBe(true)
    expect(readme).toContain('V1')
    expect(readme).toContain('Start → Log → Finish → Learn')
    expect(readme).toContain('No login, no cloud sync, no telemetry')
    expect(readme).not.toContain('LocalFlow is a private, offline-first productivity workspace')
  })
})
