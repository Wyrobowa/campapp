import * as esbuild from 'esbuild';
import { readFile } from 'fs/promises';

const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf-8'));

// Mark all declared dependencies as external EXCEPT @campapp/shared (bundled inline)
const external = Object.keys({ ...pkg.dependencies }).filter(
  (dep) => dep !== '@campapp/shared'
);

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: 'dist/index.js',
  format: 'esm',
  external,
});
