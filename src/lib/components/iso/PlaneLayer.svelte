<!--
	A flat colour plane with no content, used by deco1 and deco4 to give each tile
	a stack of translucent sheets beneath its artwork.
-->
<script lang="ts">
	interface Props {
		background?: string;
	}

	let { background }: Props = $props();
</script>

<div data-iso-layer class="layer" style:background></div>

<style>
	.layer {
		position: relative;
		display: block;
		/* A div has no intrinsic size, so the variant supplies one. */
		width: var(--iso-plane-w, 100%);
		height: var(--iso-plane-h, 100%);
		opacity: var(--iso-plane-opacity, 1);
		transform-origin: var(--iso-layer-origin, 50% 50%);
	}

	.layer:not(:first-child) {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
