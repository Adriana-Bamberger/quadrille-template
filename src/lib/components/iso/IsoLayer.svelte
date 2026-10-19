<!--
	The 3D stage. This is the public entry point for a grid:

		<IsoLayer preset={deco3} items={deco3Items} />

	Its job is to apply the preset — the isometric transform, the stage box, and
	every box metric as a CSS custom property. Those properties inherit down to
	IsoGrid and IsoGridItem, which is how a variant reaches across component
	boundaries without any descendant selectors or `:global`.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { IsoItem, IsoPreset } from '#lib/iso/types';
	import { scrollDrive, type ScrollDriveHandle } from '#lib/iso/scrollDrive';
	import IsoGrid from './IsoGrid.svelte';

	interface Props {
		preset: IsoPreset;
		items: IsoItem[];
		/** Fired once images have loaded and the grid is packed. */
		onready?: () => void;
		/** Names the grid for assistive tech — see IsoGrid. */
		label?: string;
	}

	let { preset, items, onready, label }: Props = $props();

	let stage: HTMLDivElement;
	let grid = $state<HTMLUListElement | undefined>();
	let driver: ScrollDriveHandle | null = null;

	/**
	 * `perspective()` has to come first in the transform list to apply.
	 *
	 * Passed explicitly as `style:transform={stageTransform}` below, never via the
	 * `style:transform` shorthand: on Svelte 5.57 the shorthand's *server* codegen
	 * emits the `$derived` signal itself rather than calling it, so the thunk's
	 * source text ends up in the prerendered style attribute. Client codegen is
	 * correct, so hydration hides it — but the static HTML is what a visitor
	 * without JS gets, so it has to be right.
	 */
	const stageTransform = $derived(
		preset.perspective
			? `perspective(${preset.perspective}px) ${preset.transform}`
			: preset.transform
	);

	const m = $derived(preset.metrics);

	onMount(() => {
		if (!preset.scrollable) return;
		driver = scrollDrive(stage, { grid: () => grid ?? null });
		return () => driver?.destroy();
	});
</script>

<div
	bind:this={stage}
	class="stage"
	class:is-fixed={preset.scrollable}
	style:transform={stageTransform}
	style:width={m.stageWidth}
	style:max-width={m.stageMaxWidth}
	style:height={m.stageHeight}
	style:--iso-item-w={m.itemWidth}
	style:--iso-item-h={m.itemHeight}
	style:--iso-item-pad={m.itemPadding}
	style:--iso-plane-w={m.layerWidth}
	style:--iso-plane-h={m.layerHeight}
	style:--iso-plane-opacity={m.layerOpacity}
	style:--iso-layer-origin={m.layerOrigin}
	style:--iso-layer-border={m.layerBorder}
	style:--iso-layer-shadow={m.layerShadow}
	style:--iso-layer-hover-shadow={m.layerHoverShadow}
	style:--iso-link-size={m.layerFill ? '100%' : undefined}
	style:--iso-stage-top-compact={m.stageTopCompact}
>
	<IsoGrid
		{items}
		{preset}
		{label}
		bind:element={grid}
		onready={() => {
			driver?.measure();
			onready?.();
		}}
		onrelayout={() => driver?.measure()}
	/>
</div>

<style>
	.stage {
		position: absolute;
		top: 0;
		left: 0;
		/* The plane pivots about its bottom edge, so it tips away from the viewer. */
		transform-origin: 50% 100%;
		transform-style: preserve-3d;
	}

	/*
		The scrollable variant is pinned and its grid is translated on scroll; a
		sibling element created by scrollDrive supplies the page height.
	*/
	.stage.is-fixed {
		position: fixed;
	}

	/*
		Narrow screens pull the stage up so the masthead does not bury the grid.
		Matches the original's `@media (max-width: 50em)` override; the breakpoint
		is the `--breakpoint-compact` token in layout.css.
	*/
	@media (max-width: 50em) {
		.stage {
			top: var(--iso-stage-top-compact, 0);
		}
	}
</style>
