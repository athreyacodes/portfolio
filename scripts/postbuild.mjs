import { copyFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browser = resolve(root, 'dist/portfolio/browser');

/**
 * Angular prerenders the 404 route to `404/index.html`, but Firebase Hosting
 * only serves a custom error page from `404.html` at the output root. Copying
 * it keeps one source of truth for the page while satisfying both.
 */
await copyFile(resolve(browser, '404/index.html'), resolve(browser, '404.html'));
console.log('postbuild: 404/index.html -> 404.html');

/**
 * Every route is prerendered and there is no SPA rewrite, so the client-render
 * fallback is unreachable. Dropping it avoids shipping an empty page that could
 * be indexed as a duplicate of the home route.
 */
await rm(resolve(browser, 'index.csr.html'), { force: true });
console.log('postbuild: removed index.csr.html');
