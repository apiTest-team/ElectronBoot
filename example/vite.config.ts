import { defineConfig } from 'vite'
import typeScript from "@rollup/plugin-typescript";
import swc from "rollup-plugin-swc"
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [swc({
    jsc: {
      parser: {
        syntax: "typescript",
        // tsx: true, // If you use react
        dynamicImport: true,
        decorators: true,
      },
      target: "es2021",
      transform: {
        decoratorMetadata: true,
      },
    },
  })],
  esbuild:false
})
