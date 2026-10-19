/**
 * SSR-safe masonry wrapper.
 *
 * masonry-layout touches `document` at import time, so it must not appear in the
 * module graph the prerender evaluates — hence the dynamic import.
 *
 * Only `scroll1` and `deco2` genuinely need masonry: their tiles are a fixed
 * width with variable height. deco1, deco3 and deco4 have fixed width *and*
 * height, so masonry is only doing simple row packing for them.
 */
import type { MasonryOptions } from 'masonry-layout';

export interface MasonryHandle {
	layout(): void;
	destroy(): void;
	/** Fires after every relayout, including the ones triggered by resize. */
	onLayout(listener: () => void): void;
}

export async function createMasonry(
	el: Element,
	options: MasonryOptions = {}
): Promise<MasonryHandle | null> {
	if (typeof window === 'undefined') return null;
	const { default: Masonry } = await import('masonry-layout');
	const instance = new Masonry(el, { itemSelector: '[data-iso-item]', fitWidth: true, ...options });
	return {
		layout: () => instance.layout(),
		destroy: () => instance.destroy(),
		onLayout: (listener) => instance.on('layoutComplete', listener)
	};
}
