/**
 * The five grid variants, transcribed from the original `css/component.css` and
 * the inline init scripts in `index.html` / `index2.html` (both kept in legacy/).
 *
 * This file is the whole surface area of the "fancy" part of the site. Adding a
 * sixth variant means adding a preset here and using it — no CSS changes.
 */
import type { IsoPreset } from './types';

/** `Math.floor(Math.random() * (max - min + 1)) + min` — as in the original. */
export function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Reproduces a run of equal-specificity `nth-child(Nn)` background rules, where
 * the last matching rule wins by source order. deco3's card colours are five
 * such rules layered over a base colour, which is not expressible as a cycle:
 * tile 12 matches 2n, 3n and 4n, and takes 4n's colour.
 *
 * @param base colour for a tile that matches none of the rules.
 * @param rules `[n, colour]` pairs in source order.
 */
export function nthChildCascade(
	base: string,
	rules: readonly (readonly [number, string])[]
): (item: number) => string {
	return (item) => {
		let colour = base;
		for (const [n, c] of rules) if (item % n === 0) colour = c;
		return colour;
	};
}

/** The dynamics.js bezier used by every variant except deco4. */
const BEZIER = { type: 'bezier' } as const;

/** The three translucent colour planes behind the artwork in deco1 and deco4. */
const PLANE_COLOURS = ['#ac5cf5', '#5db4eb', '#5debb4'] as const;
const planeByStackPosition = (_item: number, layer: number) => PLANE_COLOURS[layer];

/** index.html — the scrollable grid. */
export const scroll1: IsoPreset = {
	id: 'scroll1',
	scrollable: true,
	revealOnScroll: true,
	shadow: true,
	transform: 'translateX(-15vw) translateY(275px) rotateX(45deg) rotateZ(45deg)',
	metrics: {
		stageWidth: '70vw',
		stageMaxWidth: '1200px',
		stageHeight: 'calc(100vh - 280px)',
		stageTopCompact: '-38vh',
		itemWidth: '300px',
		itemHeight: 'auto',
		itemPadding: '15px'
	},
	stack: {
		properties: (pos) => ({ translateZ: (pos + 1) * 50, rotateZ: randomInt(-3, 3) }),
		// The original has its stagger delay commented out — kept that way.
		options: () => ({ ...BEZIER, durationMs: 500 })
	}
};

/** index2.html — "Celebration of Shapes" intro grid. */
export const deco1: IsoPreset = {
	id: 'deco1',
	shadow: true,
	transform: 'translateX(33vw) translateY(-340px) rotateX(45deg) rotateZ(45deg)',
	metrics: {
		stageWidth: '1200px',
		stageHeight: '900px',
		itemWidth: '400px',
		itemHeight: '300px',
		itemPadding: '15px',
		layerWidth: '370px',
		layerHeight: '270px',
		layerOpacity: '0.4'
	},
	planeBackground: planeByStackPosition,
	itemOffsets: { 2: '150px' },
	stack: {
		properties: (pos) => ({ translateZ: (pos + 1) * 30, rotateZ: randomInt(-4, 4) }),
		options: (pos, total) => ({ ...BEZIER, durationMs: 500, delayMs: (total - pos - 1) * 40 })
	}
};

/** index2.html — the scattered photo pile. Layers are flat, not stacked in 3D. */
export const deco2: IsoPreset = {
	id: 'deco2',
	perspective: 3000,
	flatLinks: true,
	transform: 'translateY(-150px) rotateX(55deg) rotateZ(-45deg)',
	metrics: {
		stageWidth: '1200px',
		stageHeight: '100vh',
		itemWidth: '300px',
		itemHeight: 'auto',
		itemPadding: '20px',
		layerBorder: '40px 20px solid #fff',
		layerShadow: '-1px 1px 5px rgba(0, 0, 0, 0.08)'
	},
	stack: {
		properties: () => ({
			translateX: randomInt(-60, 60),
			translateY: randomInt(-60, 60),
			rotateZ: randomInt(-10, 10)
		}),
		options: (pos, total) => ({ ...BEZIER, durationMs: 800, delayMs: (total - pos - 1) * 20 })
	}
};

/** index2.html — "Symmetric Wisdom" letter cards that fan open like a book. */
export const deco3: IsoPreset = {
	id: 'deco3',
	transform: 'translateX(40vw) translateY(100px) rotateX(15deg) rotateY(0) rotateZ(40deg)',
	metrics: {
		stageWidth: '960px',
		stageHeight: '500px',
		itemWidth: '240px',
		itemHeight: '320px',
		itemPadding: '0',
		layerFill: true,
		layerOrigin: '0% 50%',
		layerHoverShadow: '2px 0 2px rgba(0, 0, 0, 0.1)'
	},
	planeBackground: nthChildCascade('#fff', [
		[2, '#f7d2dc'],
		[3, '#fff0f3'],
		[4, '#e9c5cc'],
		[5, '#d6cbcd'],
		[7, '#ffc9d8']
	]),
	itemOffsets: { 2: '-160px', 4: '-160px' },
	stack: {
		properties: (pos) => ({ rotateY: pos * -15 }),
		options: (pos, total) => ({ ...BEZIER, durationMs: 500, delayMs: (total - pos - 1) * 40 })
	}
};

/** index2.html — "Format is Everything", the only spring-animated variant. */
export const deco4: IsoPreset = {
	id: 'deco4',
	perspective: 3000,
	transform: 'translate3d(-200px,-200px,0) scale3d(0.8,0.8,1) rotateY(45deg) rotateZ(-10deg)',
	metrics: {
		stageWidth: '1000px',
		stageHeight: '900px',
		itemWidth: '300px',
		itemHeight: '225px',
		itemPadding: '15px',
		layerWidth: '270px',
		layerHeight: '203px',
		layerOpacity: '0.4',
		layerOrigin: '50% 100%'
	},
	planeBackground: planeByStackPosition,
	stack: {
		properties: (pos) => ({ rotateX: (pos + 1) * -15 }),
		options: (pos, total) => ({ type: 'spring', delayMs: (total - pos - 1) * 30 })
	}
};

export const presets = { scroll1, deco1, deco2, deco3, deco4 } as const;
export type PresetId = keyof typeof presets;
