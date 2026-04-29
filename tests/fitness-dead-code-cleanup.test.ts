import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

function readText(path: string) {
  return readFileSync(path, 'utf8')
}

function readJson<T>(path: string) {
  return JSON.parse(readText(path)) as T
}

describe('fitness dead-code cleanup', () => {
  test('database bootstrap does not load legacy notes tasks or projects stores', () => {
    const hookSource = readText('src/hooks/useDatabase.ts')

    expect(hookSource).not.toContain('@/features/notes')
    expect(hookSource).not.toContain('@/features/tasks')
    expect(hookSource).not.toContain('@/features/projects')
  })

  test('error-boundary backup exports fitness JSON instead of legacy encrypted workspace backups', () => {
    const appSource = readText('src/App.tsx')

    expect(appSource).toContain('@/features/fitness/fitnessRepository')
    expect(appSource).toContain('@/lib/download')
    expect(appSource).not.toContain('@/lib/backup')
  })

  test('legacy productivity source modules and heavy import dependencies are removed from the StingFit build', () => {
    const removedSourcePaths = [
      'src/features/notes',
      'src/features/tasks',
      'src/features/projects',
      'src/features/today',
      'src/features/views',
      'src/features/search',
      'src/features/capture',
      'src/features/templates',
      'src/features/settings',
      'src/lib/import.ts',
      'src/lib/importExternal.ts',
      'src/lib/importObsidian.ts',
      'src/lib/importAppleNotes.ts',
      'src/lib/importGoogleKeep.ts',
      'src/lib/ocr.ts',
      'src/lib/noteLocks.ts',
      'src/lib/captureParser.ts',
      'src/lib/smartViews.ts',
      'src/lib/reminders.ts',
      'src/lib/backup.ts',
      'src/lib/export.ts',
    ]

    expect(removedSourcePaths.filter((path) => existsSync(path))).toEqual([])

    const packageJson = readJson<{ dependencies?: Record<string, string>, devDependencies?: Record<string, string> }>('package.json')
    const allDependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
    expect(Object.keys(allDependencies)).not.toEqual(expect.arrayContaining([
      'argon2-browser',
      'chrono-node',
      'marked',
      'tesseract.js',
      'jszip',
    ]))
  })

  test('database schema is fitness-only and no longer creates notes tasks projects or OCR tables', () => {
    const migrationsSource = readText('src/lib/migrations.ts')
    const databaseSource = readText('src/lib/database.ts')

    expect(migrationsSource).toContain('fitness_exercises')
    expect(migrationsSource).not.toContain('CREATE TABLE IF NOT EXISTS notes')
    expect(migrationsSource).not.toContain('CREATE TABLE IF NOT EXISTS tasks')
    expect(migrationsSource).not.toContain('CREATE TABLE IF NOT EXISTS projects')
    expect(migrationsSource).not.toContain('CREATE TABLE IF NOT EXISTS attachments')
    expect(databaseSource).not.toContain('notesApi')
    expect(databaseSource).not.toContain('tasksApi')
    expect(databaseSource).not.toContain('projectsApi')
    expect(databaseSource).not.toContain('noteLocks')
  })

  test('fitness settings use a small download helper instead of legacy workspace export code', () => {
    const settingsSource = readText('src/features/fitness/FitnessSettingsPage.tsx')

    expect(settingsSource).toContain("@/lib/download")
    expect(settingsSource).not.toContain("@/lib/export")
  })
})
