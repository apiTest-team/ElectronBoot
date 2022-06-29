import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: '../../dist/@electron-boot/core/esm5/index.js',
  output: [
    {
      name: 'ClassTransformer',
      format: 'umd',
      file: '../../dist/@electron-boot/core/bundles/index.umd.js',
      sourcemap: true,
    },
    {
      name: 'ClassTransformer',
      format: 'umd',
      file: '../../dist/@electron-boot/core/bundles/index.umd.min.js',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [commonjs(), nodeResolve()],
};