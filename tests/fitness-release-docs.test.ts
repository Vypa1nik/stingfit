import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

function readText(path: string) {
  return readFileSync(path, 'utf8')
}

describe('StingFit V1 release documentation', () => {
  test('documents the V1 release and manual QA checklist', () => {
    const changelog = readText('CHANGELOG.md')
    const checklistPath = 'reports/stingfit-v1-release-checklist.md'

    expect(changelog).toContain('## Unreleased')
    expect(changelog).toContain('PWA install metadata, offline fallback, and install guidance')
    expect(changelog).toContain('mobile swipe gestures')
    expect(changelog).toContain('simple start builder')
    expect(changelog).toContain('backup nudge after every 30 completed workouts')
    expect(changelog).toContain('telemetry-free privacy/network audit')
    expect(changelog).toContain('## 1.0.0 - 2026-04-25')
    expect(changelog).toContain('StingFit V1')
    expect(changelog).not.toContain('LocalFlow')
    expect(existsSync(checklistPath)).toBe(true)
    expect(existsSync('reports/stingfit-mobile-pwa-smoke.md')).toBe(true)

    const checklist = readText(checklistPath)
    expect(checklist).toContain('V1 status')
    expect(checklist).toContain('Manual mobile smoke checklist')
    expect(checklist).toContain('3 dni / týždeň')
    expect(checklist).toContain('PWA/offline install checklist')
    expect(checklist).toContain('Screenshot guidance')
    expect(checklist).toContain('Known limitations')
    expect(checklist).toContain('No login, no cloud sync, no telemetry')
    expect(checklist).toContain('reports/stingfit-privacy-network-audit.md')
    expect(checklist).not.toContain('Legacy notes/tasks/projects')
    expect(checklist).toContain('npm run test:run')
    expect(checklist).toContain('npm run build')
    expect(checklist).toContain('npm run lint')

    const readme = readText('README.md')
    expect(readme).toContain('Installable PWA shell with offline fallback')
    expect(readme).toContain('Strong CSV import')
    expect(readme).toContain('backup nudge after every 30 completed workouts')
    expect(readme).toContain('reports/stingfit-privacy-network-audit.md')

    const mobileSmoke = readText('reports/stingfit-mobile-pwa-smoke.md')
    expect(mobileSmoke).toContain('automated local HTTP smoke passed')
    expect(mobileSmoke).toContain('physical phone pass pending')
    expect(mobileSmoke).toContain('npm run mobile:pwa:start')
  })
})
