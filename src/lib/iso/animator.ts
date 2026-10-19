/**
 * The animation seam.
 *
 * Every layer movement in the site goes through this interface, so the backend
 * is a one-file decision. The default backend is dynamics.js — the library the
 * original used — because it is the only thing that reproduces the current
 * motion exactly, including the spring on deco4.
 *
 * Four of the five variants use a plain cubic-bezier and would map 1:1 onto
 * `Element.animate()`; swapping to the Web Animations API means writing a second
 * `Animator` here and changing one import. The dependency is deliberately
 * quarantined behind this file rather than spread across components.
 */
import type { LayerTransform, StackAnimationOptions } from './types';

export interface Animator {
	/** Animate `el` to `to`, cancelling whatever was already running on it. */
	animate(el: HTMLElement, to: LayerTransform, options: StackAnimationOptions): void;
	/** Snap `el` back to its resting transform over `durationMs`. */
	reset(el: HTMLElement, durationMs: number, onComplete?: () => void): void;
}

/** The bezier control points used throughout the original init scripts. */
const BEZIER_POINTS = [
	{ x: 0, y: 0, cp: [{ x: 0.2, y: 1 }] },
	{ x: 1, y: 1, cp: [{ x: 0.3, y: 1 }] }
];

type DynamicsModule = {
	animate(el: Element, props: Record<string, number>, opts: Record<string, unknown>): void;
	stop(el: Element): void;
	bezier: unknown;
	spring: unknown;
};

let dynamicsPromise: Promise<DynamicsModule> | null = null;

/** Loads dynamics.js once, lazily — it assigns to `window` when it evaluates. */
function loadDynamics(): Promise<DynamicsModule> {
	dynamicsPromise ??= import('dynamics.js').then((m) => (m.default ?? m) as DynamicsModule);
	return dynamicsPromise;
}

/**
 * Warms the dynamics.js import so the first hover is not the thing that pays for
 * it. Safe to call more than once; safe to ignore the result.
 */
export function preloadAnimator(): void {
	if (typeof window !== 'undefined') void loadDynamics();
}

export const dynamicsAnimator: Animator = {
	animate(el, to, options) {
		void loadDynamics().then((dynamics) => {
			dynamics.stop(el);
			dynamics.animate(el, { ...to } as Record<string, number>, {
				type: options.type === 'spring' ? dynamics.spring : dynamics.bezier,
				...(options.type === 'bezier'
					? { duration: options.durationMs ?? 500, points: BEZIER_POINTS }
					: {}),
				...(options.delayMs ? { delay: options.delayMs } : {})
			});
		});
	},

	reset(el, durationMs, onComplete) {
		void loadDynamics().then((dynamics) => {
			dynamics.stop(el);
			// translateZ: 0 is enough to clear any transform previously set —
			// dynamics.js rewrites the whole transform property each time.
			dynamics.animate(el, { translateZ: 0 }, { duration: durationMs, complete: onComplete });
		});
	}
};
