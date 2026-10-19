<!--
	The grid itself: a masonry-packed list of tiles.

	Sequence on mount is the same as the original's: wait for every image, lay the
	tiles out, then fade the grid in and start revealing on scroll. Until images
	are measured, masonry would pack them at zero height.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { IsoItem, IsoPreset } from '#lib/iso/types';
	import { imagesReady } from '#lib/iso/imagesLoaded';
	import { createMasonry, type MasonryHandle } from '#lib/iso/masonry';
	import { reveal } from '#lib/iso/reveal';
	import { preloadAnimator } from '#lib/iso/animator';
	import IsoGridItem from './IsoGridItem.svelte';

	interface Props {
		items: IsoItem[];
		preset: IsoPreset;
		/** Bound by IsoLayer, which needs the element to drive it on scroll. */
		element?: HTMLUListElement;
		/** Fired after images have loaded and masonry has packed the tiles. */
		onready?: () => void;
		/** Fired after every masonry relayout, including on resize. */
		onrelayout?: () => void;
		/**
		 * Names the list for assistive tech, e.g. "Selected work". Without it a
		 * grid of 94 links is announced as an unlabelled list.
		 */
		label?: string;
	}

	let { items, preset, element = $bindable(), onready, onrelayout, label }: Props = $props();

	/**
	 * False during SSR and until mount. Gates the load fade and the reveal
	 * effect, so a visitor without working JS gets the plain prerendered grid
	 * rather than a page of invisible tiles.
	 */
	let scripted = $state(false);
	let loaded = $state(false);
	let masonry: MasonryHandle | null = null;

	onMount(() => {
		scripted = true;
		preloadAnimator();

		let disposed = false;

		(async () => {
			if (!element) return;
			await imagesReady(element);
			if (disposed) return;

			masonry = await createMasonry(element);
			if (disposed) {
				masonry?.destroy();
				return;
			}
			masonry?.onLayout(() => onrelayout?.());

			loaded = true;
			onready?.();
		})();

		return () => {
			disposed = true;
			masonry?.destroy();
		};
	});
</script>

<ul
	bind:this={element}
	aria-label={label}
	class="grid"
	class:is-scripted={scripted}
	class:is-loaded={loaded}
	use:reveal={{ enabled: preset.revealOnScroll === true, threshold: 0 }}
>
	{#each items as item, i (i)}
		<IsoGridItem {item} {preset} index={i + 1} revealable={preset.revealOnScroll === true} />
	{/each}
</ul>

<style>
	.grid {
		position: relative;
		margin: 0 auto;
		padding: 0;
		list-style: none;
		transform-style: preserve-3d;
	}

	/* Hide the unpacked grid only once we know JS is running to unhide it. */
	.grid.is-scripted {
		opacity: 0;
		transition: opacity 0.3s;
		/* Read by IsoGridItem to hide revealable tiles. */
		--iso-hidden-opacity: 0;
	}

	.grid.is-scripted.is-loaded {
		opacity: 1;
	}
</style>
