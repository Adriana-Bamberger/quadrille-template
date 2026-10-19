/**
 * Tiles for the card grid. Sixteen three-layer cards that fan open like pages;
 * the preset colours them from its `nth-child` palette, so the data carries no
 * colour of its own.
 */
import type { IsoItem } from '#lib/iso/types';
import { site } from './site';

const CARD_COUNT = 16;
const LAYERS_PER_CARD = 3;

/**
 * Each card carries its own letter and number rather than repeating one value.
 *
 * Two reasons: sixteen identically-labelled links are useless to navigate, and
 * WCAG 2.5.3 requires a link's accessible name to contain its visible text — so
 * the label is built from the same letter and number the card shows.
 */
const LETTERS = 'ABCDEFGHIJKLMNOP';

export const deco3Items: IsoItem[] = Array.from({ length: CARD_COUNT }, (_, i) => {
	const letter = LETTERS[i];
	const number = String(i + 1).padStart(2, '0');
	return {
		href: site.portfolio,
		label: `${letter} ${number}`,
		layers: Array.from({ length: LAYERS_PER_CARD }, () => ({
			kind: 'card' as const,
			letter,
			number
		}))
	};
});
