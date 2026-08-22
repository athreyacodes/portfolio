import { copyFile, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browser = resolve(root, 'dist/portfolio/browser');
const preview = process.env.PREVIEW === '1';

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

/**
 * Firebase preview channels share this build. Mark them noindex so they cannot
 * compete with https://athreya.codes/.
 */
if (preview) {
  await writeFile(resolve(browser, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

  for (const file of await htmlFiles(browser)) {
    const html = await readFile(file, 'utf8');
    const noindex = '<meta name="robots" content="noindex, nofollow">';
    const patched = html.includes('name="robots"')
      ? html.replace(/<meta name="robots" content="[^"]*">/, noindex)
      : html.replace('</head>', `  ${noindex}\n</head>`);
    await writeFile(file, patched);
  }

  console.log('postbuild: preview build is noindex');
}

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await htmlFiles(path)));
    } else if (entry.name.endsWith('.html')) {
      files.push(path);
    }
  }

  return files;
}
