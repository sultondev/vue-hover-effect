import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from "vite-plugin-dts";
import fs from 'node:fs'
import path from 'node:path'

function copyDisplacements() {
  return {
    name: 'copy-displacements',
    apply: 'build' as const,
    closeBundle() {
      const src = path.resolve(__dirname, 'public/lib-images/displacements')
      const dest = path.resolve(__dirname, 'dist/lib-images/displacements')
      fs.mkdirSync(dest, { recursive: true })
      for (const file of fs.readdirSync(src)) {
        fs.copyFileSync(path.join(src, file), path.join(dest, file))
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  publicDir: command === 'serve' ? 'public' : false,
  plugins: [
    vue(),
    dts({
      entryRoot: "src",
      outDir: "dist/types",
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.app.json'
    }),
    copyDisplacements(),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "VueHoverEffect",
      fileName: (format) => `vue-hover-effect.${format}.js`,
    },
    rollupOptions: {
      external: ["vue", "three", "gsap"],
      output: {
        globals: {
          vue: "Vue",
          three: "THREE",
          gsap: "gsap",
        },
      },
      input: {
        main: 'src/index.ts',
      },
    },
  }
}))
