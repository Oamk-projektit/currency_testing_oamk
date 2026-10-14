import { defineConfig } from 'vitest/config'

// Own config so Vitest does not pick up the frontend's vite.config.ts from the parent folder
export default defineConfig({
  test: {},
})
