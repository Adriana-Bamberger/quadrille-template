/**
 * Types for the three untyped vendor libraries the original site used.
 *
 * Only the surface this project touches is declared — narrower than reality, but
 * cheaper and safer than trusting a stale community `@types` package.
 *
 * This file must not be named after any module beside it: TypeScript reads
 * `foo.d.ts` as the declaration output of `foo.ts` and ignores it as an input.
 */

declare module 'masonry-layout' {
	interface MasonryOptions {
		itemSelector?: string;
		columnWidth?: number | string | Element;
		gutter?: number | string | Element;
		/** Shrink the container to the width of the columns actually used. */
		fitWidth?: boolean;
		percentPosition?: boolean;
		horizontalOrder?: boolean;
		transitionDuration?: string | number;
		initLayout?: boolean;
	}

	class Masonry {
		constructor(element: Element | string, options?: MasonryOptions);
		layout(): void;
		reloadItems(): void;
		destroy(): void;
		on(event: 'layoutComplete' | 'removeComplete', listener: () => void): void;
		off(event: string, listener: () => void): void;
	}

	export default Masonry;
	export type { MasonryOptions };
}

declare module 'imagesloaded' {
	interface ImagesLoadedInstance {
		on(event: 'always' | 'done' | 'fail', listener: () => void): ImagesLoadedInstance;
		images: { isLoaded: boolean; img: HTMLImageElement }[];
	}

	function imagesLoaded(
		elem: Element | NodeList | Element[] | string,
		options?: object
	): ImagesLoadedInstance;

	export default imagesLoaded;
}

declare module 'dynamics.js' {
	interface DynamicsOptions {
		type?: unknown;
		duration?: number;
		delay?: number;
		friction?: number;
		frequency?: number;
		bounciness?: number;
		elasticity?: number;
		points?: unknown;
		complete?: () => void;
		change?: () => void;
	}

	const dynamics: {
		animate(el: Element, properties: Record<string, number>, options?: DynamicsOptions): void;
		stop(el: Element): void;
		css(el: Element, properties: Record<string, number>): void;
		bezier: unknown;
		spring: unknown;
		easeInOut: unknown;
		linear: unknown;
	};

	export default dynamics;
}
