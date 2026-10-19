/**
 * Reveal-on-scroll, replacing js/animOnScroll.js.
 *
 * The original walked `offsetParent` chains on every scroll event to decide
 * whether a tile was visible. Inside a `position: fixed`, 3D-transformed stage
 * that arithmetic is fragile — it is the likely origin of this repo's "Scroll fix
 * for Webkit (mobile)" commit. An IntersectionObserver asks the browser the same
 * question correctly, and in ~30 lines instead of ~180.
 *
 * Keeps the original's random per-tile animation duration so the reveal still
 * looks shuffled rather than mechanical.
 */

export interface RevealOptions {
	/** Fraction of the tile that must be visible before it animates. */
	threshold?: number;
	minDurationSec?: number;
	maxDurationSec?: number;
	/** Skip the effect entirely (static grids). */
	enabled?: boolean;
}

/**
 * Svelte action for a grid container. Watches its children and, as each enters
 * the viewport, runs the flip-up animation once.
 *
 * Tiles go `hidden` → `animate` → `shown`. `shown` is also applied immediately
 * to whatever is already on screen, matching the original's first pass.
 */
export function reveal(node: HTMLElement, options: RevealOptions = {}) {
	const { threshold = 0, minDurationSec = 1, maxDurationSec = 1.2, enabled = true } = options;

	if (!enabled) return {};

	const onEnter = (tile: HTMLElement) => {
		const duration = Math.random() * (maxDurationSec - minDurationSec) + minDurationSec;
		tile.style.animationDuration = `${duration}s`;
		tile.classList.add('is-animating');
		tile.addEventListener(
			'animationend',
			() => {
				tile.classList.add('is-shown');
				tile.classList.remove('is-animating');
				tile.style.animationDuration = '';
			},
			{ once: true }
		);
	};

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const tile = entry.target as HTMLElement;
				observer.unobserve(tile);
				if (!tile.classList.contains('is-shown')) onEnter(tile);
			}
		},
		{ threshold }
	);

	const observeAll = () => {
		for (const child of node.children) observer.observe(child);
	};
	observeAll();

	// The grid's children are created by the same render pass as this action, but
	// a later data change can add more — pick those up too.
	const mutations = new MutationObserver(observeAll);
	mutations.observe(node, { childList: true });

	return {
		destroy() {
			observer.disconnect();
			mutations.disconnect();
		}
	};
}
