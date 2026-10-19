/**
 * Accessibility audit.
 *
 *   npm run a11y
 *
 * Serves the production build and runs axe-core over every page at desktop and
 * mobile widths, against WCAG 2.2 A and AA. Exits non-zero on any violation, so
 * it can gate a commit or CI run.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';
// axe-core is CommonJS; its `source` is the whole library as an injectable string.
import axe from 'axe-core';

const axeSource = axe.source;

const TYPES = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.ico': 'image/x-icon',
	'.txt': 'text/plain'
};

function serve(rootDir) {
	const server = createServer(async (req, res) => {
		const path = decodeURIComponent(req.url.split('?')[0]);
		const candidates = path.endsWith('/')
			? [join(rootDir, path, 'index.html')]
			: [join(rootDir, path), join(rootDir, `${path}.html`), join(rootDir, path, 'index.html')];
		for (const file of candidates) {
			try {
				const body = await readFile(file);
				res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
				res.end(body);
				return;
			} catch {
				// next candidate
			}
		}
		res.writeHead(404).end('not found');
	});
	return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

const PAGES = [
	{ name: 'scrollable', path: '/' },
	{ name: 'static grid', path: '/static-grid' }
];

const VIEWPORTS = [
	{ name: 'desktop', width: 1440, height: 900 },
	{ name: 'mobile', width: 390, height: 844 }
];

/** WCAG 2.2 A and AA, plus axe's own best-practice checks. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

if (!existsSync('build')) {
	console.error('build/ does not exist — run npm run build');
	process.exit(1);
}

const server = await serve('build');
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch();

let total = 0;
const seen = new Map();

for (const page of PAGES) {
	for (const vp of VIEWPORTS) {
		const tab = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
		await tab.goto(base + page.path, { waitUntil: 'load' });
		// Let the grids finish loading — tiles only exist once masonry has run.
		await tab.waitForTimeout(3500);
		await tab.addScriptTag({ content: axeSource });

		const { violations, incomplete } = await tab.evaluate(
			async (tags) => await window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
			TAGS
		);

		const label = `${page.name} @ ${vp.name}`;
		if (violations.length === 0) {
			console.log(`✓ ${label}`);
		} else {
			console.log(`\n✗ ${label}`);
			for (const v of violations) {
				total += v.nodes.length;
				seen.set(v.id, (seen.get(v.id) ?? 0) + v.nodes.length);
				console.log(`  [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length})`);
				for (const node of v.nodes.slice(0, 2)) {
					console.log(`      ${node.html.replace(/\s+/g, ' ').slice(0, 150)}`);
					const msg = (node.failureSummary ?? '').split('\n').filter(Boolean)[1];
					if (msg) console.log(`      → ${msg.trim().slice(0, 150)}`);
				}
				if (v.nodes.length > 2) console.log(`      …and ${v.nodes.length - 2} more`);
			}
		}
		// Checks axe could not decide for itself — usually overlapping or
		// transformed backgrounds. Reported, but not counted as failures.
		if (incomplete.length && process.env.A11Y_VERBOSE) {
			for (const v of incomplete) {
				console.log(`  ? ${v.id} — needs review (${v.nodes.length})`);
				for (const node of v.nodes.slice(0, 2))
					console.log(`      ${node.html.replace(/\s+/g, ' ').slice(0, 130)}`);
			}
		}

		await tab.close();
	}
}

await browser.close();
server.close();

if (total === 0) {
	console.log('\nNo accessibility violations.');
} else {
	console.log(`\n${total} violation instances across ${seen.size} rules:`);
	for (const [id, n] of [...seen].sort((a, b) => b[1] - a[1]))
		console.log(`  ${String(n).padStart(4)}  ${id}`);
	process.exitCode = 1;
}
