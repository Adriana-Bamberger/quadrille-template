/**
 * Tests for the preset table — the single description of each grid variant.
 */
import { describe, expect, it, vi } from 'vitest';
import {
	presets,
	nthChildCascade,
	randomInt,
	scroll1,
	deco1,
	deco2,
	deco3,
	deco4
} from './presets';
import type { IsoPreset } from './types';

const ALL = Object.values(presets);

describe('preset table', () => {
	it('exposes the five variants of the original site', () => {
		expect(Object.keys(presets)).toEqual(['scroll1', 'deco1', 'deco2', 'deco3', 'deco4']);
	});

	it.each(ALL.map((p) => [p.id, p] as const))('%s is internally consistent', (_id, preset) => {
		expect(preset.transform).toBeTruthy();
		expect(preset.metrics.stageWidth).toBeTruthy();
		expect(preset.metrics.stageHeight).toBeTruthy();
		expect(preset.metrics.itemWidth).toBeTruthy();
		expect(typeof preset.stack.properties).toBe('function');
		expect(typeof preset.stack.options).toBe('function');
	});

	it('only the scrollable grid is scroll-driven and reveals on scroll', () => {
		const scrollable = ALL.filter((p) => p.scrollable);
		const revealing = ALL.filter((p) => p.revealOnScroll);
		expect(scrollable.map((p) => p.id)).toEqual(['scroll1']);
		expect(revealing.map((p) => p.id)).toEqual(['scroll1']);
	});

	it('only scroll1 and deco1 draw the shadow plane', () => {
		expect(ALL.filter((p) => p.shadow).map((p) => p.id)).toEqual(['scroll1', 'deco1']);
	});

	it('only deco2 and deco4 use a perspective', () => {
		const withPerspective = ALL.filter((p) => p.perspective);
		expect(withPerspective.map((p) => p.id)).toEqual(['deco2', 'deco4']);
		expect(withPerspective.every((p) => p.perspective === 3000)).toBe(true);
	});

	it('only deco4 springs; everything else uses the shared bezier', () => {
		const typeOf = (p: IsoPreset) => p.stack.options(0, 3).type;
		expect(ALL.filter((p) => typeOf(p) === 'spring').map((p) => p.id)).toEqual(['deco4']);
	});
});

describe('stack animations', () => {
	it('scroll1 lifts each layer 50px further in depth', () => {
		expect(scroll1.stack.properties(0).translateZ).toBe(50);
		expect(scroll1.stack.properties(1).translateZ).toBe(100);
		expect(scroll1.stack.properties(2).translateZ).toBe(150);
	});

	it('deco1 lifts in 30px steps', () => {
		expect([0, 1, 2].map((p) => deco1.stack.properties(p).translateZ)).toEqual([30, 60, 90]);
	});

	it('deco3 fans each card 15 degrees further about Y', () => {
		// `pos * -15` is negative zero at position 0; `+ 0` normalises it so the
		// assertion reads as intended. The sign of zero makes no difference to CSS.
		const degrees = [0, 1, 2].map((p) => deco3.stack.properties(p).rotateY! + 0);
		expect(degrees).toEqual([0, -15, -30]);
	});

	it('deco4 tips each layer 15 degrees further about X', () => {
		expect([0, 1, 2].map((p) => deco4.stack.properties(p).rotateX)).toEqual([-15, -30, -45]);
	});

	it('staggers from the back of the stack forwards', () => {
		// The last layer starts first: delay is (total - pos - 1) * step.
		const total = 4;
		const delays = [0, 1, 2, 3].map((pos) => deco1.stack.options(pos, total).delayMs);
		expect(delays).toEqual([120, 80, 40, 0]);
	});

	it('scroll1 has no stagger — the original leaves its delay commented out', () => {
		expect(scroll1.stack.options(0, 3).delayMs).toBeUndefined();
	});

	it('deco2 jitters every layer within the original bounds', () => {
		for (let i = 0; i < 200; i++) {
			const { translateX, translateY, rotateZ } = deco2.stack.properties(0);
			expect(translateX).toBeGreaterThanOrEqual(-60);
			expect(translateX).toBeLessThanOrEqual(60);
			expect(translateY).toBeGreaterThanOrEqual(-60);
			expect(translateY).toBeLessThanOrEqual(60);
			expect(rotateZ).toBeGreaterThanOrEqual(-10);
			expect(rotateZ).toBeLessThanOrEqual(10);
		}
	});
});

describe('randomInt', () => {
	it('is inclusive of both bounds', () => {
		const lowest = vi.spyOn(Math, 'random').mockReturnValue(0);
		expect(randomInt(-3, 3)).toBe(-3);
		lowest.mockReturnValue(0.9999999);
		expect(randomInt(-3, 3)).toBe(3);
		lowest.mockRestore();
	});
});

describe('nthChildCascade', () => {
	/**
	 * deco3's card colours are five equal-specificity nth-child rules layered over
	 * a base, where the LAST match wins — not a repeating cycle. Tile 12 matches
	 * 2n, 3n and 4n and must take 4n's colour.
	 */
	it('lets the last matching rule win', () => {
		const colour = nthChildCascade('base', [
			[2, 'two'],
			[3, 'three'],
			[4, 'four']
		]);
		expect(colour(1)).toBe('base');
		expect(colour(2)).toBe('two');
		expect(colour(3)).toBe('three');
		expect(colour(4)).toBe('four');
		expect(colour(6)).toBe('three'); // matches 2n and 3n → 3n is later
		expect(colour(12)).toBe('four'); // matches 2n, 3n and 4n → 4n is last
	});

	it('reproduces the original deco3 palette across all sixteen tiles', () => {
		// Verified against the computed backgrounds of the legacy page.
		const expected = [
			'#fff',
			'#f7d2dc',
			'#fff0f3',
			'#e9c5cc',
			'#d6cbcd',
			'#fff0f3',
			'#ffc9d8',
			'#e9c5cc',
			'#fff0f3',
			'#d6cbcd',
			'#fff',
			'#e9c5cc',
			'#fff',
			'#ffc9d8',
			'#d6cbcd',
			'#e9c5cc'
		];
		const actual = Array.from({ length: 16 }, (_, i) => deco3.planeBackground!(i + 1, 0));
		expect(actual).toEqual(expected);
	});
});

describe('plane colours', () => {
	it('deco1 and deco4 colour by stack position, not tile position', () => {
		for (const preset of [deco1, deco4]) {
			const first = [0, 1, 2].map((layer) => preset.planeBackground!(1, layer));
			const seventh = [0, 1, 2].map((layer) => preset.planeBackground!(7, layer));
			expect(first).toEqual(['#ac5cf5', '#5db4eb', '#5debb4']);
			expect(seventh).toEqual(first);
		}
	});
});

describe('item offsets', () => {
	it('replaces the original nth-child margin nudges', () => {
		expect(deco1.itemOffsets).toEqual({ 2: '150px' });
		expect(deco3.itemOffsets).toEqual({ 2: '-160px', 4: '-160px' });
		expect(scroll1.itemOffsets).toBeUndefined();
	});
});
