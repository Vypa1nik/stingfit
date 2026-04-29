import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

function readText(path: string) {
  return readFileSync(path, 'utf8')
}

describe('StingFit V1 release shell copy', () => {
  test('visible shell files use StingFit copy instead of old product copy', () => {
    const files = [
      'src/App.tsx',
      'src/main.tsx',
      'src/router.tsx',
      'src/components/ui/ShortcutsCheatsheet.tsx',
      'src/components/ui/AppErrorBoundary.tsx',
    ]

    for (const file of files) {
      expect(readText(file), file).not.toContain('LocalFlow')
    }

    expect(readText('src/main.tsx')).toContain('__STINGFIT_DEBUG__')
    expect(readText('src/main.tsx')).not.toContain('__LOCALFLOW_DEBUG__')
    expect(readText('src/App.tsx')).toContain('Načítavam StingFit')
    expect(readText('src/App.tsx')).toContain('Otvoriť tréningový export')
    expect(readText('src/App.tsx')).toContain('Otvoriť Nastavenia na export tréningového JSON.')
    expect(readText('src/router.tsx')).toContain('Pripravujem ďalšiu tréningovú obrazovku StingFit')
    expect(readText('src/components/ui/ShortcutsCheatsheet.tsx')).toContain('najkratších ciest v StingFit')
    expect(readText('src/components/ui/AppErrorBoundary.tsx')).toContain('Zvyšok StingFit je stále dostupný')
  })
})
