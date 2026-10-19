/**
 * Tiles for the first static grid — three translucent colour planes beneath a
 * piece of artwork, which lift apart on hover.
 */
import type { IsoItem } from '#lib/iso/types';
import { site, lorem } from './site';

/** How many tile files exist in static/img/tiles. */
const TILES = 10;

/** Two passes through the set fills the stage. */
const ARTWORK = [
	...Array.from({ length: TILES }, (_, i) => i + 1),
	...Array.from({ length: TILES }, (_, i) => i + 1)
];

export const deco1Items: IsoItem[] = ARTWORK.map((n, i) => ({
	href: site.portfolio,
	// Accessible name only — these grids have no visible captions.
	label: `${lorem.words[i % lorem.words.length]} ${String(i + 1).padStart(2, '0')}`,
	layers: [
		{ kind: 'plane' },
		{ kind: 'plane' },
		{ kind: 'plane' },
		{
			kind: 'image',
			src: `/img/tiles/${String(n).padStart(2, '0')}.svg`,
			alt: ''
		}
	]
}));
