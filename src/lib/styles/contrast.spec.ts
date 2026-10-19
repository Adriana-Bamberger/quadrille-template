/**
 * Contrast guards on the palette.
 *
 * The tokens in `src/routes/layout.css` are the site's whole colour story, and
 * a plausible-looking tweak can quietly drop text below WCAG AA. These pin the
 * pairs that actually appear on screen.
 *
 * Thresholds: 4.5:1 for body text, 3:1 for large text (>=24px, or >=18.66px
 * bold) and for UI component boundaries.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Relative luminance, per WCAG 2.x. */
function luminance(hex: string): number {
	const h = hex.replace('#', '');
	const channels = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
	const [r, g, b] = channels.map((c) =>
		c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
	);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

/**
 * The @theme block, parsed from the real stylesheet. Reading it rather than
 * copying the values means this suite cannot silently drift from the CSS.
 */
const THEME = Object.fromEntries(
	[
		...readFileSync(new URL('../../routes/layout.css', import.meta.url), 'utf8').matchAll(
			/--color-([\w-]+):\s*(#[0-9a-f]{3,8})/gi
		)
	].map(([, name, value]) => [name, value.toLowerCase()])
);

const token = {
	ink: THEME.ink,
	slateDeep: THEME['slate-deep'],
	slateMid: THEME['slate-mid'],
	lilac: THEME.lilac,
	accent: THEME.accent,
	night: THEME.night,
	dusk: THEME.dusk,
	linkDark: THEME['link-dark'],
	white: '#ffffff'
};

describe('theme tokens', () => {
	it('every colour this suite checks is actually defined in layout.css', () => {
		const missing = Object.entries(token)
			.filter(([name, value]) => name !== 'white' && !value)
			.map(([name]) => name);
		expect(missing).toEqual([]);
	});
});

/** The lighter stop of each section gradient — the harder one to pass. */
const sectionLightStop = {
	intro: '#2f6fb0',
	portraits: '#4a6f94',
	shots: '#4a4fb0',
	cards: '#b4506b'
};

const AA_BODY = 4.5;
const AA_LARGE = 3;

describe('page ground', () => {
	it.each([
		['heading', token.slateDeep],
		['tagline', token.slateMid],
		['body link', token.slateDeep],
		['current nav item', token.accent]
	])('%s is readable on the page background', (_name, colour) => {
		expect(contrast(colour, token.lilac)).toBeGreaterThanOrEqual(AA_BODY);
	});
});

describe('dark bands', () => {
	it('interval prose is readable on night', () => {
		expect(contrast(token.dusk, token.night)).toBeGreaterThanOrEqual(AA_BODY);
	});

	it('links on dark bands are readable', () => {
		expect(contrast(token.linkDark, token.night)).toBeGreaterThanOrEqual(AA_BODY);
	});

	it('the default link colour would NOT be readable there', () => {
		// Why --color-link-dark exists at all.
		expect(contrast(token.slateDeep, token.night)).toBeLessThan(AA_LARGE);
	});

	it('footer card titles are readable on night', () => {
		expect(contrast(token.white, token.night)).toBeGreaterThanOrEqual(AA_BODY);
	});
});

describe('section gradients', () => {
	it.each(Object.entries(sectionLightStop))(
		'%s carries white body text at its lighter stop',
		(_name, stop) => {
			expect(contrast(token.white, stop)).toBeGreaterThanOrEqual(AA_BODY);
		}
	);
});

describe('masthead tones', () => {
	/*
		SiteHeader draws dark type for the pale page ground and light type for a
		section behind it. Both directions have to clear AA, and the wrong tone is
		a real failure, not a style preference — hence a test rather than a note.
	*/
	it('the dark tone is readable on the page ground', () => {
		expect(contrast(token.slateDeep, token.lilac)).toBeGreaterThanOrEqual(AA_BODY);
		expect(contrast(token.slateMid, token.lilac)).toBeGreaterThanOrEqual(AA_BODY);
	});

	it('the dark tone would NOT be readable over a section', () => {
		// Why the light tone exists.
		expect(contrast(token.slateDeep, sectionLightStop.intro)).toBeLessThan(AA_LARGE);
	});

	it.each(Object.entries(sectionLightStop))('the light tone is readable over %s', (_name, stop) => {
		// Both the title and the tagline are full white in this tone: a 92% tint
		// measures 4.28:1 over the pink section, so the tint was dropped.
		expect(contrast(token.white, stop)).toBeGreaterThanOrEqual(AA_BODY);
	});
});

describe('focus indicator', () => {
	it('is distinguishable from both grounds it is drawn on', () => {
		// WCAG 1.4.11: non-text contrast, 3:1.
		expect(contrast(token.accent, token.lilac)).toBeGreaterThanOrEqual(AA_LARGE);
		expect(contrast(token.accent, token.white)).toBeGreaterThanOrEqual(AA_LARGE);
	});
});
