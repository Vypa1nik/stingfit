import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

function readText(path: string) {
  return readFileSync(path, 'utf8')
}

describe('StingFit mobile PWA preview tooling', () => {
  test('exposes a local production-preview command for phone smoke testing', () => {
    const packageJson = JSON.parse(readText('package.json')) as { scripts: Record<string, string> }

    expect(packageJson.scripts['mobile:pwa:start']).toContain('tools/start-mobile-pwa-preview.ps1')
    expect(packageJson.scripts['mobile:pwa:stop']).toContain('tools/stop-mobile-pwa-preview.ps1')
    expect(packageJson.scripts['mobile:pwa:url']).toContain('.tmp-stingfit-mobile-preview-url.txt')
    expect(existsSync('tools/start-mobile-pwa-preview.ps1')).toBe(true)
    expect(existsSync('tools/stop-mobile-pwa-preview.ps1')).toBe(true)

    const startScript = readText('tools/start-mobile-pwa-preview.ps1')

    expect(startScript).toContain('npm.cmd')
    expect(startScript).toContain('npm.cmd run build')
    expect(startScript).toContain('run", "preview"')
    expect(startScript).toContain('--host')
    expect(startScript).toContain('0.0.0.0')
    expect(startScript).toContain('generate-preview-qr.mjs')
    expect(startScript).toContain('stingfit-mobile-preview-url.txt')
    expect(startScript).toContain('GatewayAddresses')
    expect(startScript).toContain('MOBILE_PWA_URL_CANDIDATES')
    expect(startScript).toContain('#/training')
    expect(startScript).not.toContain('cloudflared')
    expect(startScript).not.toContain('trycloudflare')
    expect(startScript).not.toContain('loca.lt')
  })

  test('release docs point mobile smoke testing at the production PWA preview', () => {
    const readme = readText('README.md')
    const checklist = readText('reports/stingfit-v1-release-checklist.md')
    const changelog = readText('CHANGELOG.md')

    expect(readme).toContain('npm run mobile:pwa:start')
    expect(readme).toContain('production PWA preview')
    expect(readme).toContain('no public tunnel')
    expect(checklist).toContain('npm run mobile:pwa:start')
    expect(checklist).toContain('production preview URL')
    expect(checklist).toContain('service worker')
    expect(changelog).toContain('local production PWA preview helper')
  })
})
