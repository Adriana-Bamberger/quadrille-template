/**
 * Guards on the grids' content.
 *
 * These are the invariants the layout quietly depends on: tile counts the
 * presets were tuned against, stack depths the hover animations assume, and
 * every referenced asset actually existing on disk. A typo in a path renders as
 * a silently missing layer in a 3D stack, which is easy to miss by eye.
 */
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { scrollGridItems } from './scroll-grid';
import { deco1Items } from './deco1';
import { deco2Items } from './deco2';
import { deco3Items } from './deco3';
import { deco4Items } from './deco4';
import { relatedCards } from './related';
import { promo } from './promo';
import { site } from './site';
import type { IsoItem } from '#lib/iso/types';

/** Resolve a public path (`/img/…`) to its file under static/. */
const asset = (src: string) => new URL(`../../../static${src}`, import.meta.url);

function sources(items: IsoItem[]): string[] {
	return items.flatMap((item) =>
		item.layers.filter((l) => l.kind === 'image').map((l) => (l as { src: string }).src)
	);
}

const GRIDS = {
	scrollGrid: scrollGridItems,
	deco1: deco1Items,
	deco2: deco2Items,
	deco3: deco3Items,
	deco4: deco4Items
};

describe('grid sizes', () => {
	it.each([
		['scrollGrid', scrollGridItems, 94],
		['deco1', deco1Items, 20],
		['deco2', deco2Items, 28],
		['deco3', deco3Items, 16],
		['deco4', deco4Items, 20]
	])('%s has the tile count its preset is tuned for', (_name, items, count) => {
		expect(items).toHaveLength(count);
	});
});

describe('stack shapes', () => {
	it('every tile has at least two layers, or nothing fans out on hover', () => {
		for (const [name, items] of Object.entries(GRIDS)) {
			for (const [i, item] of items.entries()) {
				expect(item.layers.length, `${name}[${i}]`).toBeGreaterThanOrEqual(2);
			}
		}
	});

	it('scroll grid tiles are two backing sheets plus one piece of artwork', () => {
		for (const item of scrollGridItems) {
			expect(item.layers).toHaveLength(3);
			expect(sources([item]).slice(0, 2)).toEqual([
				'/img/layers/sheet.svg',
				'/img/layers/grid.svg'
			]);
		}
	});

	it('deco1 and deco4 back each piece of artwork with three colour planes', () => {
		for (const item of [...deco1Items, ...deco4Items]) {
			expect(item.layers.filter((l) => l.kind === 'plane')).toHaveLength(3);
			expect(item.layers).toHaveLength(4);
		}
	});

	it('deco2 stacks stay uneven — an even pile reads as mechanical', () => {
		expect(new Set(deco2Items.map((i) => i.layers.length))).toEqual(new Set([4, 5]));
	});

	it('deco3 is sixteen identical three-layer cards', () => {
		for (const item of deco3Items) {
			expect(item.layers).toHaveLength(3);
			expect(item.layers.every((l) => l.kind === 'card')).toBe(true);
		}
	});
});

describe('assets', () => {
	it('every referenced image exists under static/', () => {
		const missing = [
			...new Set([...sources(Object.values(GRIDS).flat()), ...relatedCards.map((c) => c.img)])
		].filter((src) => !existsSync(asset(src)));
		expect(missing).toEqual([]);
	});

	it('references only generated placeholders, never an outside asset', () => {
		for (const src of sources(Object.values(GRIDS).flat())) {
			expect(src).toMatch(/^\/img\/(shots|tiles|frames|layers)\/[\w-]+\.svg$/);
		}
	});
});

describe('identity', () => {
	it('routes every outbound link to the configured portfolio', () => {
		const hrefs = [
			...Object.values(GRIDS)
				.flat()
				.map((i) => i.href),
			...relatedCards.map((c) => c.href),
			promo.href
		];
		for (const href of hrefs) expect(href).toBe(site.portfolio);
	});

	it('carries the site author through to the promo card', () => {
		expect(promo.name).toBe(site.author);
		expect(site.author).toBeTruthy();
	});
});
