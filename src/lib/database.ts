import { createStore, del, get, set } from 'idb-keyval'
import type { BindParams, Database as SqlDatabase, SqlJsStatic } from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

import { DATABASE_STORAGE_KEY } from '@/lib/constants'
import { runMigrations } from '@/lib/migrations'

declare global {
  var __STINGFIT_SQL_WASM_PATH__: string | undefined
}

const sqliteStore = createStore('stingfit-db', 'binary')
const FITNESS_TABLES_IN_DELETE_ORDER = [
  'fitness_sets',
  'fitness_session_exercises',
  'fitness_sessions',
  'fitness_plan_exercises',
  'fitness_plan_workouts',
  'fitness_plan_days',
  'fitness_plan_weeks',
  'fitness_plans',
  'fitness_exercises',
  'fitness_settings',
] as const

let sqlModule: SqlJsStatic | null = null
let database: SqlDatabase | null = null
let initPromise: Promise<SqlDatabase> | null = null

function getWasmLocateFile() {
  if (globalThis.__STINGFIT_SQL_WASM_PATH__) {
    return globalThis.__STINGFIT_SQL_WASM_PATH__
  }

  if (import.meta.env?.VITEST) {
    const path = new URL('../../node_modules/sql.js/dist/sql-wasm.wasm', import.meta.url).pathname
    return path.replace(/^\/([A-Za-z]:)/, '$1')
  }

  return sqlWasmUrl
}

function nowIso() {
  return new Date().toISOString()
}

function toUint8Array(value: ArrayBuffer | Uint8Array | undefined) {
  if (!value) {
    return undefined
  }

  return value instanceof Uint8Array ? value : new Uint8Array(value)
}

function queryRows<T>(db: SqlDatabase, sql: string, params: BindParams = []): T[] {
  const statement = db.prepare(sql, params)
  const rows: T[] = []

  try {
    while (statement.step()) {
      rows.push(statement.getAsObject() as unknown as T)
    }
  } finally {
    statement.free()
  }

  return rows
}

async function getSqlModule() {
  if (sqlModule) {
    return sqlModule
  }

  const runtime = import.meta.env?.VITEST
    ? await import('sql.js/dist/sql-wasm.js')
    : await import('sql.js/dist/sql-wasm-browser.js')

  sqlModule = await runtime.default({
    locateFile: () => getWasmLocateFile(),
  })

  return sqlModule
}

async function persistDatabase() {
  if (!database) {
    return
  }

  await set(DATABASE_STORAGE_KEY, database.export(), sqliteStore)
}

function seedBaseSettings(db: SqlDatabase) {
  const timestamp = nowIso()
  db.run(
    `INSERT OR IGNORE INTO app_settings(key, value, updated_at) VALUES
      ('onboarding_complete', 'false', ?),
      ('theme_mode', 'system', ?)`,
    [timestamp, timestamp],
  )
}

function clearFitnessTables(db: SqlDatabase) {
  for (const table of FITNESS_TABLES_IN_DELETE_ORDER) {
    db.run(`DELETE FROM ${table}`)
  }
}

async function withTransaction<T>(callback: (db: SqlDatabase) => T | Promise<T>) {
  const db = await initDatabase()
  db.run('BEGIN')
  try {
    const result = await callback(db)
    db.run('COMMIT')
    await persistDatabase()
    return result
  } catch (error) {
    db.run('ROLLBACK')
    throw error
  }
}

export async function initDatabase() {
  if (database) {
    return database
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    const SQL = await getSqlModule()
    const binary = toUint8Array(await get<Uint8Array | ArrayBuffer>(DATABASE_STORAGE_KEY, sqliteStore))
    const db = binary ? new SQL.Database(binary) : new SQL.Database()

    db.run('PRAGMA foreign_keys = ON')
    await runMigrations(db)
    seedBaseSettings(db)

    database = db
    await persistDatabase()
    return db
  })()

  return initPromise
}

export async function resetDatabaseState() {
  if (database) {
    database.close()
  }

  database = null
  initPromise = null
  await del(DATABASE_STORAGE_KEY, sqliteStore)
}

export async function query<T>(sql: string, params: BindParams = []) {
  const db = await initDatabase()
  return queryRows<T>(db, sql, params)
}

export async function execute(sql: string, params: BindParams = []) {
  const db = await initDatabase()
  db.run(sql, params)
  await persistDatabase()
}

export const settingsApi = {
  get: async (key: string) =>
    queryRows<{ value: string }>(await initDatabase(), `SELECT value FROM app_settings WHERE key = ?`, [key])[0]
      ?.value ?? null,
  set: async (key: string, value: string) =>
    withTransaction(async (db) => {
      db.run(
        `INSERT INTO app_settings(key, value, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        [key, value, nowIso()],
      )
    }),
}

interface SeedPerformanceDatasetResult {
  exercises: number
  sessions: number
  total: number
}

interface SeedPerformanceDatasetOptions {
  clearExisting?: boolean
}

export async function seedPerformanceDataset(
  totalItems = 0,
  options: SeedPerformanceDatasetOptions = {},
): Promise<SeedPerformanceDatasetResult> {
  const safeTotal = Number.isFinite(totalItems) ? Math.max(0, Math.floor(totalItems)) : 0

  if (options.clearExisting) {
    await clearAllData()
  } else {
    await initDatabase()
  }

  return {
    exercises: 0,
    sessions: 0,
    total: safeTotal,
  }
}

export async function exportDatabaseBinary() {
  const db = await initDatabase()
  return db.export()
}

export async function replaceDatabaseBinary(binary: Uint8Array | ArrayBuffer) {
  const SQL = await getSqlModule()
  const nextDb = new SQL.Database(toUint8Array(binary))
  nextDb.run('PRAGMA foreign_keys = ON')
  await runMigrations(nextDb)
  seedBaseSettings(nextDb)

  if (database) {
    database.close()
  }

  database = nextDb
  initPromise = Promise.resolve(nextDb)
  await persistDatabase()
}

export async function clearAllData() {
  const SQL = await getSqlModule()
  const nextDb = new SQL.Database()
  nextDb.run('PRAGMA foreign_keys = ON')
  await runMigrations(nextDb)
  seedBaseSettings(nextDb)
  clearFitnessTables(nextDb)

  if (database) {
    database.close()
  }

  database = nextDb
  initPromise = Promise.resolve(nextDb)
  await persistDatabase()
}
