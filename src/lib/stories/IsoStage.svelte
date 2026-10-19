<!--
	Story decorator for anything isometric.

	Isometric components are invisible in a default story frame: the stage is
	absolutely positioned, the tiles are rotated out of the viewport, and several
	presets are sized in viewport units. This wraps a story in a scrollable,
	sized, non-transparent box so the thing under test is actually on screen.

	Use it for every iso story — without it the components look broken when they
	are not.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Height of the framed area. */
		height?: string;
		background?: string;
		/** Nudge the stage into view; presets position themselves for a full page. */
		offsetX?: string;
		offsetY?: string;
		children: Snippet;
	}

	let {
		height = '700px',
		background = '#d4d2e0',
		offsetX = '0',
		offsetY = '0',
		children
	}: Props = $props();
</script>

<div class="stage-frame" style:height style:background>
	<div class="inner" style:transform="translate({offsetX}, {offsetY})">
		{@render children()}
	</div>
</div>

<style>
	.stage-frame {
		position: relative;
		overflow: hidden;
		width: 100%;
	}

	.inner {
		position: absolute;
		inset: 0;
	}
</style>
