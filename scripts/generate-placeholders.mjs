/**
 * Generates the template's placeholder artwork.
 *
 * Everything under static/img is produced here, so the repo ships no third-party
 * imagery and the whole look can be restyled by editing PALETTE and re-running:
 *
 *   npm run placeholders
 *
 * Output is SVG: a few KB each, crisp at any scale, and trivially editable by
 * hand. Dimensions are fixed per group because the masonry layout depends on
 * them — change them and the grids reflow.
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'static/img');

/** Deterministic PRNG, so regenerating gives byte-identical files. */
function rng(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** The template's palette. Edit here to restyle every placeholder at once. */
const PALETTE = {
	ink: '#1c222f',
	slate: '#323f5c',
	mist: '#d4d2e0',
	paper: '#f6f5fa',
	accent: '#ce4555',
	hues: ['#58a8fb', '#5debb4', '#ac5cf5', '#ffb8cc', '#f7d2dc', '#5db4eb', '#ffc9d8', '#465683'],
	/** Hues too dark to use on a dark ground. */
	dim: ['#465683']
};

const pick = (r, xs) => xs[Math.floor(r() * xs.length)];
const between = (r, lo, hi) => lo + r() * (hi - lo);
const round = (n) => Math.round(n * 10) / 10;

/**
 * One abstract composition suggesting a piece of design work: a tinted ground,
 * a toolbar strip, a hero block and some supporting shapes.
 */
function composition(w, h, seed, { forceLight = false } = {}) {
	const r = rng(seed);
	const parts = [];
	// A forced-light composition also avoids the darker hues: these sit on the
	// dark footer band at reduced opacity, where a navy block reads as a hole.
	const hues = forceLight ? PALETTE.hues.filter((h) => !PALETTE.dim.includes(h)) : PALETTE.hues;
	const hue = pick(r, hues);
	const hue2 = pick(r, hues);
	const dark = forceLight ? false : r() < 0.3;
	const ground = dark ? PALETTE.ink : PALETTE.paper;

	parts.push(`<rect width="${w}" height="${h}" fill="${ground}"/>`);

	// A header strip on most of them.
	if (r() < 0.75) {
		const barH = round(between(r, h * 0.1, h * 0.18));
		parts.push(`<rect width="${w}" height="${barH}" fill="${hue}"/>`);
		const dots = Math.floor(between(r, 2, 4));
		for (let i = 0; i < dots; i++) {
			parts.push(
				`<circle cx="${round(w - 14 - i * 13)}" cy="${round(barH / 2)}" r="3" fill="${ground}" opacity="0.65"/>`
			);
		}
	}

	const layout = Math.floor(r() * 3);
	const pad = round(w * 0.07);
	const top = round(h * 0.26);

	if (layout === 0) {
		// Hero block with a caption below it.
		const bh = round((h - top) * 0.52);
		parts.push(
			`<rect x="${pad}" y="${top}" width="${round(w - pad * 2)}" height="${bh}" rx="3" fill="${hue2}" opacity="0.9"/>`
		);
		for (let i = 0; i < 3; i++) {
			const lw = round(between(r, 0.3, 0.8) * (w - pad * 2));
			parts.push(
				`<rect x="${pad}" y="${round(top + bh + 12 + i * 11)}" width="${lw}" height="5" rx="2.5" fill="${dark ? PALETTE.mist : PALETTE.slate}" opacity="${0.18 + i * 0.06}"/>`
			);
		}
	} else if (layout === 1) {
		// Two columns of cards.
		const cols = 2;
		const gap = round(w * 0.05);
		const cw = round((w - pad * 2 - gap) / cols);
		for (let c = 0; c < cols; c++) {
			const ch = round(between(r, 0.4, 0.78) * (h - top - pad));
			parts.push(
				`<rect x="${round(pad + c * (cw + gap))}" y="${top}" width="${cw}" height="${ch}" rx="3" fill="${c ? hue2 : hue}" opacity="${c ? 0.75 : 0.95}"/>`
			);
		}
		parts.push(
			`<circle cx="${round(w * 0.78)}" cy="${round(h * 0.82)}" r="${round(w * 0.1)}" fill="${PALETTE.accent}" opacity="0.8"/>`
		);
	} else {
		// A large arc over stacked rules.
		const cx = round(between(r, 0.25, 0.7) * w);
		const cy = round(between(r, 0.45, 0.72) * h);
		const rad = round(between(r, 0.18, 0.3) * w);
		parts.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${hue}" opacity="0.85"/>`);
		parts.push(
			`<rect x="${round(cx - rad / 2)}" y="${round(cy)}" width="${round(rad * 1.6)}" height="${round(rad * 0.5)}" rx="3" fill="${hue2}" opacity="0.7"/>`
		);
		for (let i = 0; i < 2; i++) {
			parts.push(
				`<rect x="${pad}" y="${round(h - pad - i * 12 - 6)}" width="${round(between(r, 0.25, 0.6) * w)}" height="5" rx="2.5" fill="${dark ? PALETTE.mist : PALETTE.slate}" opacity="0.22"/>`
			);
		}
	}

	return svg(w, h, parts.join(''));
}

const svg = (w, h, body) =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">${body}</svg>\n`;

/** The blank sheet the scrollable grid stacks beneath each shot. */
function sheet(w, h, { grid = false } = {}) {
	const parts = [`<rect width="${w}" height="${h}" fill="#ffffff"/>`];
	if (grid) {
		const step = 18;
		const lines = [];
		for (let x = step; x < w; x += step)
			lines.push(`<path d="M${x} 0V${h}" stroke="${PALETTE.slate}" stroke-width="0.5"/>`);
		for (let y = step; y < h; y += step)
			lines.push(`<path d="M0 ${y}H${w}" stroke="${PALETTE.slate}" stroke-width="0.5"/>`);
		parts.push(`<g opacity="0.16">${lines.join('')}</g>`);
	}
	parts.push(
		`<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${PALETTE.slate}" stroke-width="1" opacity="0.2"/>`
	);
	return svg(w, h, parts.join(''));
}

/** Favicon: a single isometric cube, matching what the site actually does. */
function favicon() {
	return svg(
		64,
		64,
		`<rect width="64" height="64" rx="12" fill="${PALETTE.slate}"/>` +
			`<g transform="translate(32 34)">` +
			`<path d="M0 -16 L16 -7 L0 2 L-16 -7 Z" fill="${PALETTE.mist}"/>` +
			`<path d="M-16 -7 L0 2 L0 20 L-16 11 Z" fill="${PALETTE.mist}" opacity="0.62"/>` +
			`<path d="M16 -7 L0 2 L0 20 L16 11 Z" fill="${PALETTE.mist}" opacity="0.38"/>` +
			`</g>`
	);
}

// ── write everything ────────────────────────────────────────────────────────

rmSync(out, { recursive: true, force: true });
for (const d of ['shots', 'tiles', 'frames', 'layers', 'cards'])
	mkdirSync(join(out, d), { recursive: true });

const written = [];
const write = (rel, body) => {
	writeFileSync(join(out, rel), body);
	written.push(rel);
};

// Scrollable grid artwork — 13 shots at the tile's content width.
for (let i = 1; i <= 13; i++)
	write(`shots/${String(i).padStart(2, '0')}.svg`, composition(270, 203, i * 101));

// Static grid tiles — 10 at 4:3.
for (let i = 1; i <= 10; i++)
	write(`tiles/${String(i).padStart(2, '0')}.svg`, composition(400, 300, 5000 + i * 97));

// The scattered pile — alternating landscape and portrait, as the layout expects.
const PORTRAIT = new Set([2, 5, 8, 10, 11]);
for (let i = 1; i <= 11; i++)
	write(
		`frames/${String(i).padStart(2, '0')}.svg`,
		composition(300, PORTRAIT.has(i) ? 400 : 197, 9000 + i * 89)
	);

// Backing sheets stacked beneath each shot.
write('layers/sheet.svg', sheet(270, 203));
write('layers/grid.svg', sheet(270, 203, { grid: true }));

// The two footer cards.
for (let i = 1; i <= 2; i++)
	write(
		`cards/${String(i).padStart(2, '0')}.svg`,
		composition(300, 163, 400 + i * 71, { forceLight: true })
	);

write('../favicon.svg', favicon());

console.log(`${written.length} placeholders written to static/img`);
