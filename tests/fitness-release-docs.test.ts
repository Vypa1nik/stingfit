import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

function readText(path: string) {
  return readFileSync(path, 'utf8')
}

describe('StingFit V1 release documentation', () => {
  test('documents the V1 release and manual QA checklist', () => {
    const changelog = readText('CHANGELOG.md')
    const checklistPath = 'reports/stingfit-v1-release-checklist.md'

    expect(changelog).toContain('## 1.0.0 - 2026-04-25')
    expect(changelog).toContain('StingFit V1')
    expect(existsSync(checklistPath)).toBe(true)

    const checklist = readText(checklistPath)
    expect(checklist).toContain('V1 status')
    expect(checklist).toContain('Manual mobile smoke checklist')
    expect(checklist).toContain('Known limitations')
    expect(checklist).toContain('No login, no cloud sync, no telemetry')
    expect(checklist).toContain('npm run test:run')
    expect(checklist).toContain('npm run build')
    expect(checklist).toContain('npm run lint')
  })
})
