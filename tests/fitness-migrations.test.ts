import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { initDatabase, query, resetDatabaseState } from '@/lib/database'

const FITNESS_TABLES = [
  'fitness_exercises',
  'fitness_plans',
  'fitness_plan_weeks',
  'fitness_plan_days',
  'fitness_plan_workouts',
  'fitness_plan_exercises',
  'fitness_sessions',
  'fitness_session_exercises',
  'fitness_sets',
  'fitness_settings',
] as const

describe('fitness migrations', () => {
  beforeEach(async () => {
    await resetDatabaseState()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('creates all fitness tables through the normal database init path', async () => {
    await initDatabase()

    const rows = await query<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'fitness_%' ORDER BY name ASC`,
    )

    expect(rows.map((row) => row.name)).toEqual([...FITNESS_TABLES].sort())
  })

  test('tracks explicit muscle groups on exercise library records', async () => {
    await initDatabase()

    const rows = await query<{ name: string }>(`PRAGMA table_info(fitness_exercises)`)
    const columns = rows.map((row) => row.name)

    expect(columns).toContain('muscle_group')
  })

  test('tracks plan and session exercise superset metadata', async () => {
    await initDatabase()

    const planRows = await query<{ name: string }>(`PRAGMA table_info(fitness_plan_exercises)`)
    const sessionRows = await query<{ name: string }>(`PRAGMA table_info(fitness_session_exercises)`)

    expect(planRows.map((row) => row.name)).toContain('superset_group')
    expect(sessionRows.map((row) => row.name)).toContain('superset_group')
  })

  test('tracks session exercise category snapshots for muscle-group stats', async () => {
    await initDatabase()

    const rows = await query<{ name: string }>(`PRAGMA table_info(fitness_session_exercises)`)
    const columns = rows.map((row) => row.name)

    expect(columns).toContain('category_snapshot')
    expect(columns).toContain('muscle_group_snapshot')
  })

  test('tracks set metadata for warmup/working separation and per-side weight entry', async () => {
    await initDatabase()

    const rows = await query<{ name: string }>(`PRAGMA table_info(fitness_sets)`)
    const columns = rows.map((row) => row.name)

    expect(columns).toContain('set_type')
    expect(columns).toContain('weight_entry_mode')
    expect(columns).toContain('left_weight_kg')
    expect(columns).toContain('right_weight_kg')
    expect(columns).toContain('corrected_at')
    expect(columns).toContain('correction_count')
  })
})
