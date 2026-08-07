import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Vendor a minimal layers-ui extract: design tokens + dark scheme + .c-pointer.
 * Drops @font-face, waves, utility classes, and unused component CSS (~14KB → ~1KB).
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules/layers-ui/layers.min.css');
const out = join(root, 'src/styles/vendor/layers-ui.min.css');

mkdirSync(dirname(out), { recursive: true });
const css = readFileSync(src, 'utf8').replace(/@font-face\{[^}]+\}/g, '');

const rootBlock = css.match(/:root\{[^}]+\}/)?.[0] ?? '';
const darkBlock = css.match(/\.color-scheme-dark\{[^}]+\}/)?.[0] ?? '';
const pointerBlock = css.match(/\.c-pointer\{[^}]+\}/)?.[0] ?? '';

if (!rootBlock || !darkBlock) {
  throw new Error('layers-ui vendor: failed to extract :root / .color-scheme-dark');
}

const slim = `/* layers-ui tokens (slim extract) */${rootBlock}${darkBlock}${pointerBlock}\n`;
writeFileSync(out, slim);
console.log(`Wrote ${out} (${css.length} → ${slim.length} bytes)`);
