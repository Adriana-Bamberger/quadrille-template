/**
 * Tiles for the fourth static grid. Same shape as deco1, but the preset tips
 * the layers about X with a spring rather than lifting them in depth.
 */
import type { IsoItem } from '#lib/iso/types';
import { site, lorem } from './site';

const TILES = 10;

const ARTWORK = [
	...Array.from({ length: TILES }, (_, i) => i + 1),
	...Array.from({ length: TILES }, (_, i) => i + 1)
];

export const deco4Items: IsoItem[] = ARTWORK.map((n, i) => ({
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
