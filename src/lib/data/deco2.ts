/**
 * Tiles for the scattered pile.
 *
 * Stacks are deliberately uneven — four or five frames each, mixing portrait
 * and landscape — because the preset scatters them randomly on hover and an
 * even pile reads as mechanical. The last frame repeats the first so the stack
 * closes on the image it opened with.
 */
import type { IsoItem } from '#lib/iso/types';
import { site, lorem } from './site';

/**
 * Each row is one tile: frame numbers from static/img/frames, bottom to top.
 * Frames 2, 5, 8, 10 and 11 are portrait; the rest are landscape.
 */
const STACKS: number[][] = [
	[1, 6, 4, 3, 1],
	[2, 10, 8, 5, 2],
	[3, 6, 4, 1, 3],
	[4, 6, 4, 3, 4],
	[5, 11, 8, 2, 5],
	[6, 9, 4, 3, 6],
	[7, 6, 4, 3, 7],
	[8, 2, 11, 10, 8],
	[9, 6, 4, 1, 9],
	[10, 5, 2, 11, 10],
	[1, 6, 4, 3, 1],
	[2, 10, 8, 5, 2],
	[6, 4, 1, 3],
	[4, 6, 4, 3, 4],
	[11, 8, 2, 5],
	[6, 9, 4, 3, 6],
	[7, 6, 4, 3, 7],
	[2, 11, 10, 8],
	[9, 6, 4, 1, 9],
	[5, 2, 11, 10],
	[7, 6, 4, 3, 7],
	[2, 11, 10, 8],
	[9, 6, 4, 1, 9],
	[5, 2, 11, 10],
	[7, 6, 4, 3, 7],
	[2, 11, 10, 8],
	[9, 6, 4, 1, 9],
	[5, 2, 11, 10]
];

export const deco2Items: IsoItem[] = STACKS.map((stack, i) => ({
	href: site.portfolio,
	// Accessible name only — these grids have no visible captions.
	label: `${lorem.words[i % lorem.words.length]} ${String(i + 1).padStart(2, '0')}`,
	layers: stack.map((n) => ({
		kind: 'image' as const,
		src: `/img/frames/${String(n).padStart(2, '0')}.svg`,
		alt: ''
	}))
}));
