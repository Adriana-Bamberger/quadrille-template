/**
 * Scroll virtualisation for the scrollable grid, replacing the scroll half of
 * js/main.js.
 *
 * The stage is `position: fixed`, so the page has no natural height. A sibling
 * "pseudo scroller" element supplies it, and the grid inside the stage is
 * translated up as the window scrolls. The result is a 3D plane that appears to
 * slide past the camera.
 */

/** Vertical translation currently applied to `el` by its transform, in px. */
function computedTranslateY(el: HTMLElement): number {
	const { transform } = getComputedStyle(el);
	if (!transform || transform === 'none') return 0;
	// m42 is the ty component, for both 2D and 3D matrices.
	return new DOMMatrix(transform).m42;
}

export interface ScrollDriveOptions {
	/** The element translated on scroll — the grid inside the stage. */
	grid: () => HTMLElement | null;
	enabled?: boolean;
}

/**
 * Attaches scroll driving to a stage element and returns a handle.
 *
 * Deliberately a plain factory rather than a Svelte action: the caller has to be
 * able to re-measure after masonry settles, and actions can only expose `update`
 * and `destroy`.
 *
 * The scrollable height is the grid's height plus the stage's own downward
 * translation, scaled by √2 because the stage is rotated 45° about Z — the
 * diagonal of the rotated plane is what actually has to travel past the viewport.
 *
 * (The original recomputed this from `offsetTop` rather than the translation
 * after a relayout, which silently shortened the page by ~390px on any resize.
 * Both paths use the translation here, so resizing now behaves like first load.)
 */
export interface ScrollDriveHandle {
	/** Recompute the page height. Call after masonry settles and on relayout. */
	measure(): void;
	destroy(): void;
}

export function scrollDrive(stage: HTMLElement, options: ScrollDriveOptions): ScrollDriveHandle {
	if (options.enabled === false) return { measure: () => {}, destroy: () => {} };

	const scroller = document.createElement('div');
	scroller.className = 'pseudo-scroller';
	scroller.setAttribute('aria-hidden', 'true');
	stage.parentNode?.insertBefore(scroller, stage);

	let frame = 0;

	const applyScroll = () => {
		frame = 0;
		const grid = options.grid();
		if (grid) grid.style.transform = `translate3d(0,-${window.scrollY}px,0)`;
	};

	const onScroll = () => {
		if (!frame) frame = requestAnimationFrame(applyScroll);
	};

	const resize = () => {
		const grid = options.grid();
		if (!grid) return;
		scroller.style.height = `${grid.offsetHeight + computedTranslateY(stage) * Math.SQRT2}px`;
		applyScroll();
	};

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', resize);

	return {
		measure: resize,
		destroy() {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', resize);
			scroller.remove();
		}
	};
}
