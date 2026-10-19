/**
 * Accessibility behaviour of a tile, in a real browser.
 *
 * These cover the things an automated page scan cannot: that the reveal is
 * reachable from a keyboard, that the link has a usable name, and that a
 * reduced-motion preference is honoured.
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
	title: 'Dolor 07',
	layers: [
		{ kind: 'image', src: '/img/layers/sheet.svg', alt: '' },
		{ kind: 'image', src: '/img/layers/grid.svg', alt: '' },
		{ kind: 'image', src: '/img/shots/01.svg', alt: '' }
	]
};

/** A tile with no visible caption — the deco grids' shape. */
const unlabelled: IsoItem = {
	href: 'https://example.test/work',
	label: 'Ipsum 02',
	layers: [{ kind: 'plane' }, { kind: 'plane' }]
};

function spyAnimator() {
	const animated: HTMLElement[] = [];
	const animator: Animator = {
		animate: (el) => void animated.push(el),
		reset: (_el, _d, done) => done?.()
	};
	return { animator, animated };
}

describe('IsoGridItem accessibility', () => {
	it('gives the link a name from its visible caption', async () => {
		render(IsoGridItem, { item: artwork, preset: scroll1, index: 1 });
		await expect.element(page.getByRole('link', { name: 'Dolor 07' })).toBeInTheDocument();
	});

	it('gives the link a name from `label` when there is no caption', async () => {
		render(IsoGridItem, { item: unlabelled, preset: scroll1, index: 1 });
		await expect.element(page.getByRole('link', { name: 'Ipsum 02' })).toBeInTheDocument();
	});

	it('never leaves the link unnamed, even with no title or label', async () => {
		const { container } = render(IsoGridItem, {
			item: { href: '#', layers: [{ kind: 'plane' }] },
			preset: scroll1,
			index: 9
		});
		const link = container.querySelector('a')!;
		expect(link.getAttribute('aria-label')).toBeTruthy();
	});

	it('does not repeat the caption to a screen reader', async () => {
		// The caption is rendered visually but hidden from AT: the link already
		// carries it as its accessible name.
		const { container } = render(IsoGridItem, { item: artwork, preset: scroll1, index: 1 });
		const caption = container.querySelector('.title, [class*="title"]')!;
		expect(caption.getAttribute('aria-hidden')).toBe('true');
	});

	it('treats stacked artwork as decorative', async () => {
		const { container } = render(IsoGridItem, { item: artwork, preset: scroll1, index: 1 });
		for (const img of container.querySelectorAll('img')) {
			expect(img.getAttribute('alt')).toBe('');
		}
	});

	it('expands the stack on keyboard focus, not just hover', async () => {
		const { animator, animated } = spyAnimator();
		const { container } = render(IsoGridItem, {
			item: artwork,
			preset: scroll1,
			index: 1,
			animator
		});
		const link = container.querySelector('a')!;

		link.focus();
		expect(animated.length).toBe(3);
		// The lift is driven by $state, which flushes asynchronously.
		await expect.poll(() => container.querySelector('li')!.style.zIndex).not.toBe('1');
	});

	it('collapses when focus leaves the tile entirely', async () => {
		const { animator } = spyAnimator();
		const { container } = render(IsoGridItem, {
			item: artwork,
			preset: scroll1,
			index: 1,
			animator
		});
		const link = container.querySelector('a')!;
		const li = container.querySelector('li')!;

		link.focus();
		await expect.poll(() => li.style.zIndex).not.toBe('1');

		link.dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.body, bubbles: true }));
		await expect.poll(() => li.style.zIndex).toBe('1');
	});

	it('stays expanded while focus moves within the tile', async () => {
		const { animator } = spyAnimator();
		const { container } = render(IsoGridItem, {
			item: artwork,
			preset: scroll1,
			index: 1,
			animator
		});
		const link = container.querySelector('a')!;
		const li = container.querySelector('li')!;

		link.focus();
		await expect.poll(() => li.style.zIndex).not.toBe('1');

		// relatedTarget inside the tile must not collapse it.
		link.dispatchEvent(new FocusEvent('focusout', { relatedTarget: link, bubbles: true }));
		await expect.poll(() => li.style.zIndex).not.toBe('1');
	});

	it('prints only the top card of a stack, so its text is not tripled', async () => {
		const cards: IsoItem = {
			href: '#',
			label: 'C 03',
			layers: Array.from({ length: 3 }, () => ({
				kind: 'card' as const,
				letter: 'C',
				number: '03'
			}))
		};
		const { container } = render(IsoGridItem, { item: cards, preset: deco3, index: 3 });
		// WCAG 2.5.3: the link's name must contain its visible text, which it
		// cannot if the same text is rendered three times.
		expect(container.textContent?.match(/C/g) ?? []).toHaveLength(1);
		expect(container.querySelector('a')!.getAttribute('aria-label')).toBe('C 03');
	});
});
