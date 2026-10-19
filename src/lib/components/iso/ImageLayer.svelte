<!--
	One photographic plane in a tile's stack.

	`data-iso-layer` is how the parent tile finds its layers to animate — a data
	attribute rather than a class so that Svelte's style scoping is irrelevant to
	the lookup.

	`alt` defaults to empty: a tile is a stack of three to five images that
	together form one picture, and the link around them carries the name. Giving
	each layer its own alt text makes a screen reader read the same tile five
	times.
-->
<script lang="ts">
	interface Props {
		src: string;
		/** Leave empty unless this layer is the only meaningful image in its tile. */
		alt?: string;
	}

	let { src, alt = '' }: Props = $props();
</script>

<img data-iso-layer class="layer" {src} {alt} />

<style>
	.layer {
		position: relative;
		display: block;
		max-width: 100%;
		/* Set per variant by IsoLayer; deco2 frames its photos in white. */
		border: var(--iso-layer-border, none);
		box-shadow: var(--iso-layer-shadow, none);
		transform-origin: var(--iso-layer-origin, 50% 50%);
	}

	/* Every plane after the first is lifted out of flow and stacked in place. */
	.layer:not(:first-child) {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
