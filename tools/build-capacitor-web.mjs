import { spawnSync } from 'node:child_process'
import process from 'node:process'

const env = {
  ...process.env,
  VITE_BASE_PATH: '/',
}

function run(label, args) {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
    shell: false,
  })

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1
    throw new Error(`${label} failed with exit code ${process.exitCode}`)
  }
}

run('TypeScript build', ['node_modules/typescript/bin/tsc', '-b'])
run('Vite Capacitor build', ['node_modules/vite/bin/vite.js', 'build'])
