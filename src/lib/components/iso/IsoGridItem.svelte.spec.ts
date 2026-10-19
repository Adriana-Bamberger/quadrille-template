/**
 * Browser-mode tests for the tile.
 *
 * These run in a real Chromium via Vitest's browser mode, because the behaviour
 * under test is computed style and pointer interaction — neither of which a DOM
 * shim reproduces honestly.
 */
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import IsoGridItem from './IsoGridItem.svelte';
import { scroll1, deco3 } from '#lib/iso/presets';
import type { Animator } from '#lib/iso/animator';
import type { IsoItem } from '#lib/iso/types';

const artwork: IsoItem = {
	href: 'https://example.test/work',
	title: 'Lorem ipsum',
	layers: [
		{ kind: 'image', src: '/img/layers/sheet.svg', alt: '' },
		{ kind: 'image', src: '/img/layers/grid.svg', alt: '' },
		{ kind: 'image', src: '/img/shots/01.svg', alt: 'Lorem ipsum 01' }
	]
};

const cards: IsoItem = {
	href: '#',
	layers: Array.from({ length: 3 }, () => ({ kind: 'card' as const, letter: 'A', number: '23' }))
};

/**
 * A recording stand-in for dynamics.js. Lets the tests assert what the tile
 * *asked* for, rather than racing a real animation to its final frame.
 */
function spyAnimator() {
	const animated: { el: HTMLElement; to: Record<string, number> }[] = [];
	const reset: HTMLElement[] = [];
	const animator: Animator = {
		animate(el, to) {
			animated.push({ el, to: to as Record<string, number> });
		},
		reset(el, _duration, onComplete) {
			reset.push(el);
			onComplete?.();
		}
	};
	return { animator, animated, reset };
}

describe('IsoGridItem', () => {
	it('renders one element per layer, in stack order', async () => {
		const { container } = render(IsoGridItem, { item: artwork, preset: scroll1, index: 1 });
		const layers = container.querySelectorAll('[data-iso-layer]');
		expect(layers).toHaveLength(3);
		expect([...layers].map((l) => l.getAttribute('src'))).toEqual([
			'/img/layers/sheet.svg',
			'/img/layers/grid.svg',
			'/img/shots/01.svg'
		]);
	});

	it('links to the item and labels it with its title', async () => {
		render(IsoGridItem, { item: artwork, preset: scroll1, index: 1 });
		await expect
			.element(page.getByRole('link'))
			.toHaveAttribute('href', 'https://example.test/work');
		await expect.element(page.getByText('Lorem ipsum')).toBeInTheDocument();
	});

	it('animates every layer on hover, using the preset’s offsets', async () => {
		const { animator, animated } = spyAnimator();
		const { container } = render(IsoGridItem, {
			item: artwork,
			preset: scroll1,
			index: 1,
			animator
		});
		const tile = container.querySelector('li')!;

		tile.dispatchEvent(new MouseEvent('mouseenter'));

		expect(animated).toHaveLength(3);
		// scroll1 lifts each successive layer 50px further in depth.
		expect(animated.map((a) => a.to.translateZ)).toEqual([50, 100, 150]);
	});

	it('collapses every layer again on leave', async () => {
		const { animator, reset } = spyAnimator();
		const { container } = render(IsoGridItem, {
			item: artwork,
			preset: scroll1,
			index: 1,
			animator
		});
		const tile = container.querySelector('li')!;

		tile.dispatchEvent(new MouseEvent('mouseenter'));
		tile.dispatchEvent(new MouseEvent('mouseleave'));

		expect(reset).toHaveLength(3);
	});

	it('raises the tile above its neighbours while hovered, then drops it back', async () => {
		const { animator } = spyAnimator();
		const { container } = render(IsoGridItem, {
			item: artwork,
			preset: scroll1,
			index: 1,
			animator
		});
		const tile = container.querySelector('li')!;
		expect(tile.style.zIndex).toBe('1');

		tile.dispatchEvent(new MouseEvent('mouseenter'));
		await expect.poll(() => tile.style.zIndex).not.toBe('1');

		tile.dispatchEvent(new MouseEvent('mouseleave'));
		await expect.poll(() => tile.style.zIndex).toBe('1');
	});

	it('applies the preset’s per-position offset to the right tile only', async () => {
		const second = render(IsoGridItem, { item: cards, preset: deco3, index: 2 });
		expect(second.container.querySelector('li')!.style.marginTop).toBe('-160px');

		const third = render(IsoGridItem, { item: cards, preset: deco3, index: 3 });
		expect(third.container.querySelector('li')!.style.marginTop).toBe('');
	});

	it('colours deco3 cards from the nth-child cascade', async () => {
		// Tile 12 matches 2n, 3n and 4n; the original's last matching rule wins.
		const { container } = render(IsoGridItem, { item: cards, preset: deco3, index: 12 });
		const layer = container.querySelector<HTMLElement>('[data-iso-layer]')!;
		expect(getComputedStyle(layer).backgroundColor).toBe('rgb(233, 197, 204)');
	});

	it('is visible by default and only hidden when revealable', async () => {
		const plain = render(IsoGridItem, { item: artwork, preset: scroll1, index: 1 });
		expect(plain.container.querySelector('li')!.className).not.toContain('is-hidden');

		const revealable = render(IsoGridItem, {
			item: artwork,
			preset: scroll1,
			index: 1,
			revealable: true
		});
		expect(revealable.container.querySelector('li')!.className).toContain('is-hidden');
	});
});
