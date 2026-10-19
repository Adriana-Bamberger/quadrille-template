/**
 * Tiles for the scrollable grid.
 *
 * Each tile is a stack: two blank sheets with the artwork on top, so the layers
 * fan out on hover. Artwork cycles through `static/img/shots`, which
 * `npm run placeholders` generates.
 *
 * To add tiles, extend `SEQUENCE` or push onto `scrollGridItems` directly.
 */
import type { IsoItem } from '#lib/iso/types';
import { site, lorem } from './site';

/** How many shot files exist in static/img/shots. */
const SHOTS = 13;

/** The order tiles cycle through, repeated to fill the grid. */
const SEQUENCE = Array.from({ length: SHOTS }, (_, i) => i + 1);

/** Total tiles on the page. The grid scrolls, so it wants plenty. */
const TILE_COUNT = 94;

/** The two blank sheets stacked beneath every piece of artwork. */
const BACKING = [
	{ src: '/img/layers/sheet.svg', alt: '' },
	{ src: '/img/layers/grid.svg', alt: '' }
] as const;

const shot = (n: number) => `/img/shots/${String(n).padStart(2, '0')}.svg`;

/**
 * Titles are numbered rather than repeated. They are the tiles' accessible
 * names, and 94 links all announced as "Lorem ipsum" tells a screen-reader user
 * nothing about where they are.
 */
const title = (i: number) =>
	`${lorem.words[i % lorem.words.length]} ${String(i + 1).padStart(2, '0')}`;

export const scrollGridItems: IsoItem[] = Array.from({ length: TILE_COUNT }, (_, i) => {
	const n = SEQUENCE[i % SEQUENCE.length];
	return {
		href: site.portfolio,
		title: title(i),
		layers: [
			// The artwork is decorative: the tile's link carries the name.
			...BACKING.map((b) => ({ kind: 'image' as const, src: b.src, alt: b.alt })),
			{ kind: 'image' as const, src: shot(n), alt: '' }
		]
	};
});
