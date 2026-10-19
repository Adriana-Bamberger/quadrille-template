/**
 * The vocabulary of the isometric grid.
 *
 * A grid variant is entirely described by an `IsoPreset`: a 3D transform, a set
 * of box metrics, and a per-layer hover animation. Nothing about a variant lives
 * in CSS — the metrics travel to the components as CSS custom properties, so
 * adding a variant means adding a preset and nothing else.
 */

/** One plane in an item's stack. The stack is rendered back-to-front. */
export type LayerSpec =
	| { kind: 'image'; src: string; alt: string }
	| { kind: 'plane' }
	| { kind: 'card'; letter: string; number: string };

/** One tile in a grid. */
export interface IsoItem {
	href?: string;
	/**
	 * Visible caption, revealed on hover beneath the tile. Only the scrollable
	 * grid is styled for one — omit it elsewhere.
	 */
	title?: string;
	/**
	 * Accessible name for the tile's link, when there is no visible caption to
	 * take it from. The artwork is decorative, so without one of the two the link
	 * is announced as just "link".
	 */
	label?: string;
	layers: LayerSpec[];
}

/** Transform properties an animation backend can apply to a layer. */
export interface LayerTransform {
	translateX?: number;
	translateY?: number;
	translateZ?: number;
	rotateX?: number;
	rotateY?: number;
	rotateZ?: number;
}

/** How one layer should move, and with what timing. */
export interface StackAnimationOptions {
	/** `bezier` matches the original dynamics.js curve; `spring` is deco4 only. */
	type: 'bezier' | 'spring';
	durationMs?: number;
	delayMs?: number;
}

export interface StackAnimation {
	/** @param pos zero-based index of the layer within its stack. */
	properties: (pos: number) => LayerTransform;
	/** @param total number of layers in the stack, for reverse-order stagger. */
	options: (pos: number, total: number) => StackAnimationOptions;
}

/**
 * Box metrics for a variant. Every value is emitted as a CSS custom property on
 * the stage element and inherited by the grid and its items, which is how a
 * variant reaches across component boundaries without descendant selectors.
 */
export interface IsoMetrics {
	/** Stage size — `.isolayer--*` width/height in the original CSS. */
	stageWidth: string;
	stageHeight: string;
	stageMaxWidth?: string;
	/**
	 * `top` for the stage below the `compact` breakpoint. The scrollable grid
	 * pulls itself up on a narrow screen so the masthead does not bury it.
	 */
	stageTopCompact?: string;
	/** Tile size. `itemHeight: 'auto'` lets the artwork set it (scroll1, deco2). */
	itemWidth: string;
	itemHeight: string;
	itemPadding: string;
	/** Size of a `plane`/`card` layer, which has no intrinsic dimensions. */
	layerWidth?: string;
	layerHeight?: string;
	layerOpacity?: string;
	/** `transform-origin` for layers; the default is the element centre. */
	layerOrigin?: string;
	/** Per-layer border, used by deco2's white photo frames. */
	layerBorder?: string;
	layerShadow?: string;
	/** Link and layers fill the tile at 100%/100% (deco3's cards). */
	layerFill?: boolean;
	/** `box-shadow` applied to non-first layers while the tile is hovered. */
	layerHoverShadow?: string;
}

export interface IsoPreset {
	id: string;
	/** `position: fixed` + pseudo-scroller + scroll-driven translate. */
	scrollable?: boolean;
	/** CSS `perspective()` in px, prepended to `transform`. 0/undefined = none. */
	perspective?: number;
	transform: string;
	metrics: IsoMetrics;
	/** The drop-shadow plane behind each tile (`.isolayer--shadow`). */
	shadow?: boolean;
	/**
	 * Background for a `plane`/`card` layer. deco1 and deco4 colour by position
	 * within the stack; deco3 colours by the tile's position in the grid. A
	 * function rather than an array because deco3's original rules are five
	 * overlapping `nth-child` selectors, not a cycle — see `nthChildCascade`.
	 *
	 * @param item 1-based position of the tile in the grid.
	 * @param layer 0-based position of the layer within its stack.
	 */
	planeBackground?: (item: number, layer: number) => string | undefined;
	/** Flatten the stack — deco2 draws its layers as a flat pile of photos. */
	flatLinks?: boolean;
	/** `margin-top` nudges by 1-based tile position, replacing `nth-child` rules. */
	itemOffsets?: Record<number, string>;
	stack: StackAnimation;
	/** Reveal tiles on scroll with the flip-up animation (scroll1 only). */
	revealOnScroll?: boolean;
}
