import { defineConfig } from 'vite'
import { URL, fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import checker from "vite-plugin-checker";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import * as path from 'path'
import typescript2 from 'rollup-plugin-typescript2';
import visualizer from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode })=>({
  plugins: [
    vue(),
    checker({
      vueTsc: true,
    }),
    dts({
      insertTypesEntry: true,
    }),
    cssInjectedByJsPlugin(),
    typescript2({
      check: false,
      include: ["src/components/**/*.vue"],
      tsconfigOverride: {
        compilerOptions: {
          outDir: "dist",
          sourceMap: true,
          declaration: true,
          declarationMap: true,
        },
      },
      exclude: ["vite.config.ts"]
    })
  ],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('src', import.meta.url)),
      public: fileURLToPath(new URL('public', import.meta.url)),
    },
  },
  build: {
    cssCodeSplit: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: "src/vue-hover-effect.ts",
      name: 'vue-hover-effect',
      formats: ["es", "cjs", "umd"],
      fileName: format => `vue-hover-effect.${format}.js`
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      plugins: [
        // Only include the visualizer plugin when running in 'analyze' mode
        mode === 'analyze' && visualizer({
          filename: './stats.html',
          open: true,
        }),
      ].filter(Boolean),
      // make sure to externalize deps that should not be bundled
      // into your library
      input: {
        main: path.resolve(__dirname, "src/components/index.ts")
      },
      external: ['vue', 'three', 'gsap'],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'main.css') return 'vue-hover-effect.css';
          return assetInfo.name;
        },
        exports: "named",
        globals: {
          vue: 'Vue',
          three: 'THREE',
          gsap: 'gsap',
        },
      },
    },
  },
}))
// define: { 'process.env.NODE_ENV': '"production"' },
