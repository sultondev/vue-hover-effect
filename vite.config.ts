import { defineConfig } from 'vite'

import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/vue-hover-effect.ts'),
      name: 'vue-hover-effect',
    },
  },
})
