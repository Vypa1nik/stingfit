import { webcrypto } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, parse } from 'node:path'

import 'fake-indexeddb/auto'

import { beforeEach } from 'vitest'

const sourceWasmPath = join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
let fallbackWasmPath = sourceWasmPath

if (process.platform === 'win32') {
  const rootDrive = parse(process.cwd()).root
  fallbackWasmPath = join(rootDrive, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')

  if (!existsSync(fallbackWasmPath)) {
    mkdirSync(dirname(fallbackWasmPath), { recursive: true })
    copyFileSync(sourceWasmPath, fallbackWasmPath)
  }
}

globalThis.__STINGFIT_SQL_WASM_PATH__ = fallbackWasmPath
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
  })
}

beforeEach(() => {
  window.localStorage.clear()
})
