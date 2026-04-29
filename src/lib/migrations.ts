interface SqlExecResult {
  columns: string[]
  values: unknown[][]
}

interface SqlRunner {
  run: (sql: string) => unknown
  exec?: (sql: string) => SqlExecResult[]
}

const appSchema = [
  `CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
] as const

const fitnessSchema = [
  `CREATE TABLE IF NOT EXISTS fitness_exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    muscle_group TEXT DEFAULT NULL,
    default_rest_seconds INTEGER NOT NULL DEFAULT 120,
    is_custom INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT DEFAULT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS fitness_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    goal TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'personal' CHECK(kind IN ('starter','personal')),
    source_template_id TEXT DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','active','archived')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (source_template_id) REFERENCES fitness_plans(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS fitness_plan_weeks (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (plan_id) REFERENCES fitness_plans(id) ON DELETE CASCADE,
    UNIQUE(plan_id, week_number)
  )`,
  `CREATE TABLE IF NOT EXISTS fitness_plan_days (
    id TEXT PRIMARY KEY,
    week_id TEXT NOT NULL,
    day_index INTEGER NOT NULL CHECK(day_index BETWEEN 0 AND 6),
    label TEXT NOT NULL,
    is_rest_day INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (week_id) REFERENCES fitness_plan_weeks(id) ON DELETE CASCADE,
    UNIQUE(week_id, day_index)
  )`,
  `CREATE TABLE IF NOT EXISTS fitness_plan_workouts (
    id TEXT PRIMARY KEY,
    plan_day_id TEXT NOT NULL,
    name TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (plan_day_id) REFERENCES fitness_plan_days(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS fitness_plan_exercises (
    id TEXT PRIMARY KEY,
    plan_workout_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    target_sets INTEGER NOT NULL DEFAULT 3,
    min_reps INTEGER NOT NULL DEFAULT 8,
    max_reps INTEGER NOT NULL DEFAULT 12,
    target_rir INTEGER DEFAULT NULL,
    rest_seconds INTEGER NOT NULL DEFAULT 120,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (plan_workout_id) REFERENCES fitness_plan_workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES fitness_exercises(id) ON DELETE RESTRICT
  )`,
  `CREATE TABLE IF NOT EXISTS fitness_sessions (
    id TEXT PRIMARY KEY,
    plan_id TEXT DEFAULT NULL,
    plan_workout_id TEXT DEFAULT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','active','completed','abandoned')),
    started_at TEXT DEFAULT NULL,
    completed_at TEXT DEFAULT NULL,
    notes TEXT NOT NULL DEFAULT '',
    session_rpe INTEGER DEFAULT NULL,
    energy_level INTEGER DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (plan_id) REFERENCES fitness_plans(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_workout_id) REFERENCES fitness_plan_workouts(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS fitness_session_exercises (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    name_snapshot TEXT NOT NULL,
    category_snapshot TEXT DEFAULT NULL,
    muscle_group_snapshot TEXT DEFAULT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','done','skipped')),
    target_sets INTEGER NOT NULL DEFAULT 3,
    min_reps INTEGER NOT NULL DEFAULT 8,
    max_reps INTEGER NOT NULL DEFAULT 12,
    target_rir INTEGER DEFAULT NULL,
    rest_seconds INTEGER NOT NULL DEFAULT 120,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES fitness_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES fitness_exercises(id) ON DELETE RESTRICT
  )`,
  `CREATE TABLE IF NOT EXISTS fitness_sets (
    id TEXT PRIMARY KEY,
    session_exercise_id TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    weight_kg REAL NOT NULL DEFAULT 0,
    weight_entry_mode TEXT NOT NULL DEFAULT 'total' CHECK(weight_entry_mode IN ('total','per_side')),
    left_weight_kg REAL DEFAULT NULL,
    right_weight_kg REAL DEFAULT NULL,
    reps INTEGER NOT NULL DEFAULT 0,
    rir INTEGER DEFAULT NULL,
    set_type TEXT NOT NULL DEFAULT 'working' CHECK(set_type IN ('working','warmup','dropset','myo','failure')),
    status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','completed','skipped')),
    completed_at TEXT DEFAULT NULL,
    corrected_at TEXT DEFAULT NULL,
    correction_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_exercise_id) REFERENCES fitness_session_exercises(id) ON DELETE CASCADE,
    UNIQUE(session_exercise_id, set_number)
  )`,
  `CREATE TABLE IF NOT EXISTS fitness_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_fitness_exercises_name ON fitness_exercises(name) WHERE deleted_at IS NULL`,
  `CREATE INDEX IF NOT EXISTS idx_fitness_plans_kind_status ON fitness_plans(kind, status) WHERE deleted_at IS NULL`,
  `CREATE INDEX IF NOT EXISTS idx_fitness_plan_weeks_plan ON fitness_plan_weeks(plan_id, week_number)`,
  `CREATE INDEX IF NOT EXISTS idx_fitness_plan_days_week ON fitness_plan_days(week_id, day_index)`,
  `CREATE INDEX IF NOT EXISTS idx_fitness_plan_workouts_day ON fitness_plan_workouts(plan_day_id, sort_order)`,
  `CREATE INDEX IF NOT EXISTS idx_fitness_plan_exercises_workout ON fitness_plan_exercises(plan_workout_id, sort_order)`,
  `CREATE INDEX IF NOT EXISTS idx_fitness_sessions_status ON fitness_sessions(status, started_at)`,
  `CREATE INDEX IF NOT EXISTS idx_fitness_session_exercises_session ON fitness_session_exercises(session_id, sort_order)`,
  `CREATE INDEX IF NOT EXISTS idx_fitness_sets_session_exercise ON fitness_sets(session_exercise_id, set_number)`,
] as const

export const MIGRATIONS = [
  { id: 'v001', statements: appSchema },
  { id: 'v002', statements: fitnessSchema },
] as const

function getTableColumns(database: SqlRunner, tableName: string) {
  if (!database.exec) {
    return []
  }

  const results = database.exec(`PRAGMA table_info(${tableName})`)
  const schema = results[0]
  if (!schema) {
    return []
  }

  const nameIndex = schema.columns.indexOf('name')
  if (nameIndex < 0) {
    return []
  }

  return schema.values.map((row) => String(row[nameIndex] ?? ''))
}

function ensureFitnessSetMetadataSchema(database: SqlRunner) {
  const setColumns = getTableColumns(database, 'fitness_sets')

  if (!setColumns.includes('set_type')) {
    database.run(`ALTER TABLE fitness_sets ADD COLUMN set_type TEXT NOT NULL DEFAULT 'working' CHECK(set_type IN ('working','warmup','dropset','myo','failure'))`)
  }

  if (!setColumns.includes('weight_entry_mode')) {
    database.run(`ALTER TABLE fitness_sets ADD COLUMN weight_entry_mode TEXT NOT NULL DEFAULT 'total' CHECK(weight_entry_mode IN ('total','per_side'))`)
  }

  if (!setColumns.includes('left_weight_kg')) {
    database.run(`ALTER TABLE fitness_sets ADD COLUMN left_weight_kg REAL DEFAULT NULL`)
  }

  if (!setColumns.includes('right_weight_kg')) {
    database.run(`ALTER TABLE fitness_sets ADD COLUMN right_weight_kg REAL DEFAULT NULL`)
  }

  if (!setColumns.includes('corrected_at')) {
    database.run(`ALTER TABLE fitness_sets ADD COLUMN corrected_at TEXT DEFAULT NULL`)
  }

  if (!setColumns.includes('correction_count')) {
    database.run(`ALTER TABLE fitness_sets ADD COLUMN correction_count INTEGER NOT NULL DEFAULT 0`)
  }
}

function ensureFitnessExerciseMuscleGroupSchema(database: SqlRunner) {
  const exerciseColumns = getTableColumns(database, 'fitness_exercises')

  if (!exerciseColumns.includes('muscle_group')) {
    database.run(`ALTER TABLE fitness_exercises ADD COLUMN muscle_group TEXT DEFAULT NULL`)
  }
}

function ensureFitnessSessionExerciseSnapshotSchema(database: SqlRunner) {
  const exerciseColumns = getTableColumns(database, 'fitness_session_exercises')

  if (!exerciseColumns.includes('category_snapshot')) {
    database.run(`ALTER TABLE fitness_session_exercises ADD COLUMN category_snapshot TEXT DEFAULT NULL`)
    database.run(`UPDATE fitness_session_exercises
      SET category_snapshot = (
        SELECT category
        FROM fitness_exercises
        WHERE fitness_exercises.id = fitness_session_exercises.exercise_id
      )
      WHERE category_snapshot IS NULL`)
  }

  if (!exerciseColumns.includes('muscle_group_snapshot')) {
    database.run(`ALTER TABLE fitness_session_exercises ADD COLUMN muscle_group_snapshot TEXT DEFAULT NULL`)
    database.run(`UPDATE fitness_session_exercises
      SET muscle_group_snapshot = (
        SELECT muscle_group
        FROM fitness_exercises
        WHERE fitness_exercises.id = fitness_session_exercises.exercise_id
      )
      WHERE muscle_group_snapshot IS NULL`)
  }
}

function ensureFitnessSessionReviewSchema(database: SqlRunner) {
  const sessionColumns = getTableColumns(database, 'fitness_sessions')

  if (!sessionColumns.includes('session_rpe')) {
    database.run(`ALTER TABLE fitness_sessions ADD COLUMN session_rpe INTEGER DEFAULT NULL`)
  }

  if (!sessionColumns.includes('energy_level')) {
    database.run(`ALTER TABLE fitness_sessions ADD COLUMN energy_level INTEGER DEFAULT NULL`)
  }
}

export async function runMigrations(database: SqlRunner) {
  for (const migration of MIGRATIONS) {
    for (const statement of migration.statements) {
      database.run(statement)
    }
  }

  ensureFitnessSetMetadataSchema(database)
  ensureFitnessExerciseMuscleGroupSchema(database)
  ensureFitnessSessionExerciseSnapshotSchema(database)
  ensureFitnessSessionReviewSchema(database)
}
