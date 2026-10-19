/**
 * Screenshot harness.
 *
 *   npm run shots        → builds the site and shoots every page and viewport
 *
 * Output lands in reference-shots/. Commit a set before a risky change and
 * re-shoot afterwards to see what moved — the 3D grids are easy to break in
 * ways unit tests cannot see.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const TYPES = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.eot': 'application/vnd.ms-fontobject'
};

/**
 * A static host, near enough: directory URLs get index.html, and an extensionless
 * path falls back to `<path>.html` the way adapter-static's output expects.
 */
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
				// try the next candidate
			}
		}
		res.writeHead(404).end('not found');
	});
	return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

/** The viewports and pages the parity checklist cares about. */
const VIEWPORTS = [
	{ name: 'desktop', width: 1920, height: 1080 },
	{ name: 'laptop', width: 1280, height: 800 },
	{ name: 'mobile', width: 480, height: 800 }
];

const TARGET = { dir: 'build', scroll: '', static: 'static-grid' };

/** Freeze everything non-deterministic so two runs are comparable. */
const FREEZE = `
	/* Kill the randomised reveal durations and the spinner so shots are stable. */
	*, *::before, *::after {
		animation-duration: 0s !important;
		animation-delay: 0s !important;
		transition-duration: 0s !important;
		transition-delay: 0s !important;
	}
`;

async function shoot() {
	const target = TARGET;
	if (!existsSync(target.dir)) throw new Error(`${target.dir}/ does not exist — run npm run build`);

	const server = await serve(target.dir);
	const base = `http://localhost:${server.address().port}`;
	const outDir = 'reference-shots';
	await mkdir(outDir, { recursive: true });

	const browser = await chromium.launch();
	const results = [];

	for (const vp of VIEWPORTS) {
		const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
		await page.addStyleTag({ content: FREEZE });

		for (const [label, path] of [
			['scroll', target.scroll],
			['static', target.static]
		]) {
			await page.goto(`${base}/${path}`, { waitUntil: 'load' });
			// Wait for the grid to report itself packed, however the build signals it.
			await page
				.waitForFunction(
					() =>
						document.body.classList.contains('grid-loaded') ||
						document.querySelector('.grid--loaded, [class*="is-loaded"]') !== null,
					{ timeout: 15000 }
				)
				.catch(() => {});
			await page.waitForTimeout(1200);

			const file = join(outDir, `${label}-${vp.name}.png`);
			await page.screenshot({ path: file });
			results.push(file);

			// Scrolled state, for the reveal effect and the pseudo-scroller height.
			await page.evaluate(() => window.scrollTo(0, 1200));
			await page.waitForTimeout(900);
			const scrolled = join(outDir, `${label}-${vp.name}-scrolled.png`);
			await page.screenshot({ path: scrolled });
			results.push(scrolled);

			// Page height is what the pseudo-scroller controls — record it.
			const height = await page.evaluate(() => document.documentElement.scrollHeight);
			results.push(`  ${label}-${vp.name} scrollHeight=${height}`);
		}
		await page.close();
	}

	await browser.close();
	server.close();
	console.log(results.join('\n'));
}

await shoot();
