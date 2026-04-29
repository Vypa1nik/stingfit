import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, test } from 'vitest'

const bannedRuntimePatterns = [
  /navigator\.sendBeacon/,
  /XMLHttpRequest/,
  /new\s+WebSocket/,
  /new\s+EventSource/,
  /\bgtag\b/,
  /google-analytics/,
  /posthog/i,
  /sentry/i,
  /plausible/i,
  /amplitude/i,
  /mixpanel/i,
  /segment/i,
  /datadog/i,
  /newrelic/i,
  /\brollbar\b/i,
]

const bannedDependencyNames = [
  'posthog',
  'posthog-js',
  '@sentry/react',
  '@sentry/browser',
  'plausible-tracker',
  'amplitude-js',
  '@amplitude/analytics-browser',
  'mixpanel-browser',
  '@segment/analytics-next',
  '@datadog/browser-rum',
  'newrelic',
  'rollbar',
]

function walkFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const fullPath = join(root, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      return walkFiles(fullPath)
    }
    return [fullPath]
  })
}

function readText(path: string) {
  return readFileSync(path, 'utf8')
}

describe('StingFit telemetry-free privacy and network audit', () => {
  test('does not include analytics or telemetry dependencies', () => {
    const pkg = JSON.parse(readText('package.json')) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
    const dependencyNames = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})])

    for (const dependencyName of bannedDependencyNames) {
      expect(dependencyNames.has(dependencyName)).toBe(false)
    }
  })

  test('does not use outbound telemetry APIs in app/runtime assets', () => {
    const auditedFiles = [
      ...walkFiles('src').filter((path) => /\.(ts|tsx|js|jsx)$/.test(path)),
      'index.html',
      'public/manifest.webmanifest',
      'public/offline.html',
    ]

    for (const filePath of auditedFiles) {
      const source = readText(filePath)
      for (const pattern of bannedRuntimePatterns) {
        expect(source, `${relative(process.cwd(), filePath)} contains ${pattern}`).not.toMatch(pattern)
      }
      expect(source, `${relative(process.cwd(), filePath)} must not call fetch()`).not.toMatch(/\bfetch\s*\(/)
    }
  })

  test('service worker fetch usage stays same-origin cache-only', () => {
    const serviceWorker = readText('public/sw.js')

    expect(serviceWorker).toContain('const isSameOrigin = requestUrl.origin === self.location.origin')
    expect(serviceWorker).toContain("if (!isSameOrigin) {\n    return\n  }")
    expect(serviceWorker).toContain('cache.match(OFFLINE_FALLBACK)')
    expect(serviceWorker).not.toMatch(/navigator\.sendBeacon|XMLHttpRequest|WebSocket|analytics|telemetry/i)
  })

  test('documents the completed no-telemetry audit for release handoff', () => {
    const reportPath = 'reports/stingfit-privacy-network-audit.md'

    expect(existsSync(reportPath)).toBe(true)
    const report = readText(reportPath)
    expect(report).toContain('StingFit privacy/network audit')
    expect(report).toContain('No login, no cloud sync, no telemetry, no analytics')
    expect(report).toContain('Service worker fetch is limited to same-origin cache/runtime requests')
    expect(report).toContain('npm run test:run -- tests/fitness-privacy-network-audit.test.ts')
  })
})
