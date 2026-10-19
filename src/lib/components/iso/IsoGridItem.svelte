<!--
	One tile: a link wrapping a stack of layers.

	Owns the reveal interaction. On pointer enter *or keyboard focus*, each layer
	animates to the offset the preset's `stack.properties(pos)` describes; on
	leave or blur they all collapse back. Layers are found by `[data-iso-layer]`
	within this component's own DOM, so no cross-component selector or `:global`
	is needed.

	Driving the effect from focus as well as hover is what makes the grid usable
	from a keyboard — the original was pointer-only, so a keyboard user tabbing
	through the tiles got no feedback at all.
-->
<script lang="ts">
	import type { IsoItem, IsoPreset } from '#lib/iso/types';
	import { dynamicsAnimator, type Animator } from '#lib/iso/animator';
	import ImageLayer from './ImageLayer.svelte';
	import PlaneLayer from './PlaneLayer.svelte';
	import CardLayer from './CardLayer.svelte';

	interface Props {
		item: IsoItem;
		preset: IsoPreset;
		/** 1-based position in the grid, for `itemOffsets` and `planeBackground`. */
		index: number;
		/** Tiles start hidden and are revealed by the `reveal` action. */
		revealable?: boolean;
		/**
		 * Accessible name for the tile's link. Falls back to `item.title`; without
		 * either, the link has no name, since the artwork is decorative.
		 */
		label?: string;
		animator?: Animator;
	}

	let {
		item,
		preset,
		index,
		revealable = false,
		label,
		animator = dynamicsAnimator
	}: Props = $props();

	let root: HTMLLIElement;
	let link: HTMLAnchorElement;
	let active = $state(false);

	/** The stack's resting z-index, raised while active so it sits above peers. */
	const LIFTED = 999;

	function layers(): HTMLElement[] {
		return Array.from(link.querySelectorAll<HTMLElement>('[data-iso-layer]'));
	}

	/** True when the visitor has asked for less motion. */
	function prefersReducedMotion(): boolean {
		return (
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
		);
	}

	function expand() {
		if (active) return;
		active = true;
		// With reduced motion the stack stays put; the tile still lifts and its
		// title still appears, so the interaction is signalled without movement.
		if (prefersReducedMotion()) return;
		const stack = layers();
		stack.forEach((layer, pos) => {
			animator.animate(
				layer,
				preset.stack.properties(pos),
				preset.stack.options(pos, stack.length)
			);
		});
	}

	function collapse() {
		if (prefersReducedMotion()) {
			active = false;
			return;
		}
		// Resets over 100ms and drops the z-index once done, so the tile stays
		// above its neighbours until it has finished folding away.
		const stack = layers();
		let remaining = stack.length;
		for (const layer of stack) {
			animator.reset(layer, 100, () => {
				if (--remaining === 0) active = false;
			});
		}
		if (stack.length === 0) active = false;
	}

	/**
	 * Focus moving *within* the tile is not a leave. `relatedTarget` is where
	 * focus is heading, so only collapse when it lands outside this tile.
	 */
	function onFocusOut(event: FocusEvent) {
		const next = event.relatedTarget;
		if (next instanceof Node && root?.contains(next)) return;
		collapse();
	}

	const offset = $derived(preset.itemOffsets?.[index]);

	/**
	 * What a screen reader announces for this tile. The artwork is decorative, so
	 * without this the link would be announced as just "link".
	 */
	const accessibleName = $derived(label ?? item.title ?? item.label ?? `Item ${index}`);
</script>

<li
	bind:this={root}
	data-iso-item
	class="item"
	class:is-hidden={revealable}
	class:has-shadow={preset.shadow}
	style:margin-top={offset}
	style:z-index={active ? LIFTED : 1}
	onmouseenter={expand}
	onmouseleave={collapse}
	onfocusin={expand}
	onfocusout={onFocusOut}
>
	<a
		bind:this={link}
		class="link"
		class:is-flat={preset.flatLinks}
		href={item.href ?? '#'}
		aria-label={accessibleName}
		style:z-index={active ? LIFTED : 1}
	>
		{#each item.layers as layer, pos (pos)}
			{#if layer.kind === 'image'}
				<ImageLayer src={layer.src} alt={layer.alt} />
			{:else if layer.kind === 'plane'}
				<PlaneLayer background={preset.planeBackground?.(index, pos)} />
			{:else}
				<!-- Last layer is the one on top at rest, so it carries the printing. -->
				<CardLayer
					letter={layer.letter}
					number={layer.number}
					showText={pos === item.layers.length - 1}
					background={preset.planeBackground?.(index, pos)}
				/>
			{/if}
		{/each}

		{#if item.title}
			<!-- Visual only: the link is already named by aria-label. -->
			<span class="title" aria-hidden="true">{item.title}</span>
		{/if}
	</a>
</li>

<style>
	.item {
		width: var(--iso-item-w, 300px);
		height: var(--iso-item-h, auto);
		padding: var(--iso-item-pad, 0);
		transform-style: preserve-3d;
		backface-visibility: hidden;
	}

	.link {
		position: relative;
		display: block;
		width: var(--iso-link-size, auto);
		height: var(--iso-link-size, auto);
		transform-style: preserve-3d;
	}

	/* deco2 keeps its photo pile flat rather than stacking it in depth. */
	.link.is-flat {
		transform: translate3d(0, 0, 0);
		transform-style: flat;
	}

	/* The drop-shadow plane, inset behind the tile. */
	.has-shadow .link::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset: 5px;
		opacity: 0.6;
		background: rgba(0, 0, 0, 0.8);
		box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.8);
		transform: translateZ(-1px) scale(0.95);
		transition:
			transform 0.3s,
			opacity 0.3s,
			box-shadow 0.3s;
		backface-visibility: hidden;
	}

	.has-shadow:hover .link::before {
		opacity: 0.2;
		box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.8);
		transform: translateZ(-1px) scale(1);
	}

	.title {
		position: absolute;
		z-index: -1;
		bottom: 0;
		width: 100%;
		font-size: 0.65em;
		font-weight: 600;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 2px;
		color: #fff;
		opacity: 0;
		transform: translate3d(0, -20px, 0);
		transition:
			transform 0.3s,
			opacity 0.3s;
	}

	.item:hover .title {
		opacity: 1;
		transform: translate3d(0, 0, 0);
	}

	/* deco3 fans its cards open and shadows the ones behind the front page. */
	.link:hover :global([data-iso-layer]:not(:first-child)) {
		box-shadow: var(--iso-layer-hover-shadow, none);
	}

	/*
		Reveal-on-scroll. Tiles are only hidden once JS has confirmed it can run
		(IsoGrid sets --iso-ready), so a no-JS visitor sees the flat grid instead
		of an empty page — an improvement on the original, which hid them via a
		Modernizr class applied before anything could go wrong.
	*/
	.item.is-hidden {
		opacity: var(--iso-hidden-opacity, 1);
	}

	.item.is-hidden:global(.is-shown) {
		opacity: 1;
	}

	.item.is-hidden:global(.is-animating) {
		opacity: 1;
		transform: translateY(800px);
		animation: iso-move-up 1s cubic-bezier(0.2, 1, 0.3, 1) forwards;
	}

	@keyframes iso-move-up {
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
