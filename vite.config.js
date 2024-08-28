import { defineConfig } from 'vite';
import { URL, fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import checker from "vite-plugin-checker";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import typescript2 from 'rollup-plugin-typescript2';
// https://vitejs.dev/config/
export default defineConfig({
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
            fileName: function (format) { return "vue-hover-effect-library-ts.".concat(format, ".js"); }
        },
        // rollupOptions: {
        //   // make sure to externalize deps that should not be bundled
        //   // into your library
        //   input: {
        //     main: path.resolve(__dirname, "src/components/")
        //   },
        //   external: ['vue'],
        //   output: {
        //     assetFileNames: (assetInfo) => {
        //       if (assetInfo.name === 'main.css') return 'vue-hover-effect-library.css';
        //       return assetInfo.name;
        //     },
        //     exports: "named",
        //     globals: {
        //       vue: 'Vue',
        //     },
        //   },
        // },
    },
});
// define: { 'process.env.NODE_ENV': '"production"' },
