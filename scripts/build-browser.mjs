import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

await build({
  entryPoints: [path.join(packageRoot, 'free-field/composible/scopedStyles.js')],
  outfile: path.join(packageRoot, 'free-field/composible/scopedStyles.browser.mjs'),
  bundle: true,
  platform: 'browser',
  format: 'esm',
  minify: true,
  sourcemap: false,
});