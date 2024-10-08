import { defineConfig } from 'vite'
import {URL, fileURLToPath} from 'node:url'
import vue from '@vitejs/plugin-vue'
import checker from "vite-plugin-checker";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import {resolve} from 'path'
import visualizer from "rollup-plugin-visualizer";
// import typescript2 from 'rollup-plugin-typescript2';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode })=>({
  plugins: [
    vue(),
    checker({
      vueTsc: true,
    }),
    cssInjectedByJsPlugin(),
    // typescript2({
    //   check: false,
    //   include: ["src/components/**/*.vue"],
    //   tsconfigOverride: {
    //     compilerOptions: {
    //       outDir: "dist-types",
    //       sourceMap: true,
    //       declaration: true,
    //       declarationMap: true,
    //     },
    //   },
    //   exclude: ["vite.config.ts"]
    // })
  ],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('src', import.meta.url)),
      public: fileURLToPath(new URL('public', import.meta.url)),
      formats: ["umd", "umd"]
    },
  },
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    // cssCodeSplit: true,
    lib: {
      entry: resolve(__dirname, "src/lib-main.ts"),
      name: 'VueHoverEffect',
      fileName: 'vue-hover-effect'
    },
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //   },
    // },
    rollupOptions: {
      plugins: [
        // Only include the visualizer plugin when running in 'analyze' mode
        mode === 'analyze' && visualizer({
          filename: './stats.html',
          open: true,
        }),
      ].filter(Boolean),
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
}))
