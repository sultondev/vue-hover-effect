import { defineConfig } from 'vite'
import { URL, fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    checker({
      vueTsc: true,
    }),
  ],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('src', import.meta.url)),
      public: fileURLToPath(new URL('public', import.meta.url)),
    },
  },
})
// define: { 'process.env.NODE_ENV': '"production"' },
// build: {
//   lib: {
//     entry: path.resolve(__dirname, './src/vue-hover-effect.ts'),
//     name: 'vue-hover-effect',
//   },
// },
