/**
 * Promise wrapper over imagesLoaded.
 *
 * The library is UMD and reads `window` as it initialises, so it is imported
 * lazily — this module is only ever called from `onMount`, but keeping the
 * import dynamic means a stray server-side call degrades instead of crashing
 * the prerender.
 *
 * (imagesLoaded 5 does still accept the v3 `imagesLoaded(el, cb)` callback form,
 * but an awaitable is the shape every caller here actually wants.)
 */

/** Resolves once every `<img>` inside `el` has loaded or failed. */
export async function imagesReady(el: Element): Promise<void> {
	if (typeof window === 'undefined') return;
	const { default: imagesLoaded } = await import('imagesloaded');
	await new Promise<void>((resolve) => {
		imagesLoaded(el).on('always', () => resolve());
	});
}
