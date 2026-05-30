import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'

const workspaceRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  server: {
    fs: {
      allow: [workspaceRoot],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    fileParallelism: false,
    setupFiles: ['./tests/setup.ts'],
  },
})
