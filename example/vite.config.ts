import vue from "@vitejs/plugin-vue";
import { rmSync } from "fs";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import vueSetupExtend from "vite-plugin-vue-setup-extend-plus";

import swc from "rollup-plugin-swc";

rmSync("dist", { recursive: true, force: true }); // v14.14.0

const IsWeb = process.env.BUILD_TARGET === "web";

const pathResolve = (dir: string): any => {
  return resolve(__dirname, ".", dir);
};
// 渲染项目路径
const root = pathResolve("src/renderer");
const alias: Record<string, string> = {
  "/@root": root,
  "/@store": pathResolve("src/renderer/store/modules")
};

// https://vitejs.dev/config/
export default defineConfig({
  root,
  resolve: {
    alias
  },
  build: {
    outDir: IsWeb ? resolve("dist/web") : resolve("dist/electron/renderer"),
    emptyOutDir: true,
    target: "esnext",
    minify: "esbuild"
  },
  base: "./",
  plugins: [
    vue({}),
    electron({
      main: {
        entry: "src/main/index.ts",
        vite: {
          build: {
            target:"es2018",
            sourcemap: false,
            outDir: "dist/electron/main"
          },
          esbuild: false,
          plugins:[
            swc({
              jsc: {
                minify: {},
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
            }),
          ]
        }
      },
      preload: {
        input: {
          // You can configure multiple preload here
          preload: "src/main/preload.ts"
        },
        vite: {
          build: {
            // For debug
            sourcemap: "inline",
            outDir: "dist/electron/main"
          },
          plugins:[

          ],
        }
      },
      renderer:{},
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    vueSetupExtend()
  ],
  publicDir: resolve("static")
});
