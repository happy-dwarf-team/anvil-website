// Checks the internal links of the built site: every href and src that points into the
// site must reach a file in dist/, and every #fragment must match an id on that page.
// External links are not checked. Run after `npm run build`: npm run check:links
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const distDir = decodeURIComponent(dist.pathname).replace(/^\/([A-Za-z]:)/, '$1');
// Same default as astro.config.mjs; the deploy workflow sets SITE_BASE for builds under
// /anvil-website/.
const base = (process.env.SITE_BASE ?? '/').replace(/\/?$/, '/');
const origin = 'https://site.invalid';

function htmlFiles(dir) {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return htmlFiles(path);
		return name.endsWith('.html') ? [path] : [];
	});
}

// dist/docs/install/index.html → /docs/install/ (with base)
function pageUrl(file) {
	const path = relative(distDir, file).split(sep).join('/');
	return new URL(base + path.replace(/(^|\/)index\.html$/, '$1'), origin);
}

// /docs/install/ → dist/docs/install/index.html, or null outside the site
function targetFile(url) {
	if (url.origin !== origin || !url.pathname.startsWith(base)) return null;
	const path = decodeURIComponent(url.pathname.slice(base.length));
	const file = join(distDir, path);
	if (path === '' || path.endsWith('/')) return join(file, 'index.html');
	if (existsSync(file) && statSync(file).isDirectory()) return join(file, 'index.html');
	return file;
}

const pages = htmlFiles(distDir);
if (pages.length === 0) {
	console.error('No HTML pages in dist/; run `npm run build` first.');
	process.exit(1);
}
const ids = new Map();
function idsOf(file) {
	if (!ids.has(file)) {
		const html = readFileSync(file, 'utf8');
		ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
	}
	return ids.get(file);
}

const problems = [];
for (const page of pages) {
	const html = readFileSync(page, 'utf8');
	const from = pageUrl(page);
	for (const [, attr, value] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
		if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) continue; // external, mailto:, data:, …
		const link = value.replaceAll('&amp;', '&');
		const url = new URL(link, from);
		const file = targetFile(url);
		const where = `${relative(distDir, page)}: ${attr}="${value}"`;
		if (!file) {
			problems.push(`${where} points outside the site base ${base}`);
			continue;
		}
		if (!existsSync(file)) {
			problems.push(`${where} → missing ${relative(distDir, file)}`);
			continue;
		}
		const fragment = decodeURIComponent(url.hash.slice(1));
		if (fragment && file.endsWith('.html') && !idsOf(file).has(fragment)) {
			problems.push(`${where} → no id "${fragment}" on that page`);
		}
	}
}

if (problems.length) {
	console.error(`Broken internal links (${problems.length}):\n${problems.join('\n')}`);
	process.exit(1);
}
console.log(`Internal links OK: ${pages.length} pages checked.`);
