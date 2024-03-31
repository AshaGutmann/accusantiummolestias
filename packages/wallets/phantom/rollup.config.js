import * as process from 'node:process';
import fs from 'node:fs';
import ts from 'typescript';
import { defineConfig } from 'rollup';
import del from 'rollup-plugin-delete';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { babel } from '@rollup/plugin-babel';
import svgr from '@svgr/rollup';

const extensions = ['.js', '.jsx', '.ts', '.tsx', '.svg'];
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const { dependencies, peerDependencies } = packageJson;
const commonExternal = [
  'react/jsx-runtime',
  // Do not include in the bundle subpath exports like:
  /^@reef-knot\/.*/, // e.g. @reef-knot/<package>/<exports-field-entry>
  /^reef-knot\/.*/, // e.g. reef-knot/wallets-icons/react
];
const external = [
  ...commonExternal,
  ...Object.keys({ ...dependencies, ...peerDependencies }),
  /node_modules/
];
const isDevMode = process.env.dev === 'on';

export default defineConfig({
  input: './src/index',
  output: {
    format: 'es',
    dir: 'dist',
    preserveModules: true,
    preserveModulesRoot: 'src',
    generatedCode: 'es2015'
  },
  plugins: [
    isDevMode ? null : del({ targets: 'dist/*', runOnce: true }),
    resolve({ extensions, preferBuiltins: true }),
    svgr({
      typescript: true,
      prettier: false,
      memo: true,
      svgo: false,
    }),
    typescript({
      typescript: ts,
      tsconfig: 'tsconfig.json',
      check: false,
    }),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
      extensions,
    }),
  ],
  external,
});
