import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      vue(),
      dts({
        // output dir for dts files
        entryRoot: "src",
        outDir: "dist/types",
        insertTypesEntry: true,
        tsconfigPath: './tsconfig.app.json'
      })
  ],
  build: {
    lib: {
      // Your main entry
      entry: "src/index.ts",
      name: "VueHoverEffect",
      fileName: (format) => `vue-hover-effect.${format}.js`,
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      external: ["vue", "three", "gsap"],
      output: {
        // Provide global variables to use in UMD builds for these externals
        globals: {
          vue: "Vue",
          three: "THREE",
          gsap: "gsap",
        },
      },
      input: {
        main: 'src/index.ts', // Explicitly define entry
      },
    },
  }
})
