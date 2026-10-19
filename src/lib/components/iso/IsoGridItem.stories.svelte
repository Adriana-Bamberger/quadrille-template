<!--
	A single tile per variant, plus an interaction story that drives the hover.
-->
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, waitFor, within } from 'storybook/test';
	import IsoGridItem from './IsoGridItem.svelte';
	import { scroll1, deco1, deco3, deco4 } from '#lib/iso/presets';
	import type { IsoItem } from '#lib/iso/types';

	const { Story } = defineMeta({
		title: 'Iso/IsoGridItem',
		component: IsoGridItem,
		parameters: {
			docs: {
				description: {
					component:
						'One tile. Owns the hover interaction: layers fan out according to the ' +
						"preset's `stack` animation and collapse again on leave."
				}
			}
		}
	});

	const artwork: IsoItem = {
		href: 'https://adriana.bamberger.nz/',
		title: 'Lorem ipsum',
		layers: [
			{ kind: 'image', src: '/img/layers/sheet.svg', alt: '' },
			{ kind: 'image', src: '/img/layers/grid.svg', alt: '' },
			{ kind: 'image', src: '/img/shots/01.svg', alt: 'Lorem ipsum' }
		]
	};

	const planes: IsoItem = {
		href: '#',
		layers: [
			{ kind: 'plane' },
			{ kind: 'plane' },
			{ kind: 'plane' },
			{ kind: 'image', src: '/img/tiles/01.svg', alt: 'Lorem ipsum' }
		]
	};

	/**
	 * `label` mirrors the card's printed text: WCAG 2.5.3 requires a link's
	 * accessible name to contain its visible text.
	 */
	const cards: IsoItem = {
		href: 'https://adriana.bamberger.nz/',
		label: 'C 03',
		layers: Array.from({ length: 3 }, () => ({ kind: 'card' as const, letter: 'C', number: '03' }))
	};
</script>

<!-- A tile has to live in a list and a 3D context to render correctly. -->
{#snippet frame(item: IsoItem, preset: typeof scroll1, pad = '80px')}
	<ul
		style:list-style="none"
		style:margin="0"
		style:padding={pad}
		style:transform-style="preserve-3d"
		style:transform="rotateX(45deg) rotateZ(45deg)"
		style:--iso-item-w={preset.metrics.itemWidth}
		style:--iso-item-h={preset.metrics.itemHeight}
		style:--iso-item-pad={preset.metrics.itemPadding}
		style:--iso-plane-w={preset.metrics.layerWidth}
		style:--iso-plane-h={preset.metrics.layerHeight}
		style:--iso-plane-opacity={preset.metrics.layerOpacity}
		style:--iso-layer-origin={preset.metrics.layerOrigin}
		style:--iso-link-size={preset.metrics.layerFill ? '100%' : undefined}
	>
		<IsoGridItem {item} {preset} index={1} />
	</ul>
{/snippet}

<Story name="Artwork stack (scroll1)">
	{#snippet template()}
		{@render frame(artwork, scroll1)}
	{/snippet}
</Story>

<Story name="Colour planes (deco1)">
	{#snippet template()}
		{@render frame(planes, deco1)}
	{/snippet}
</Story>

<Story name="Letter cards (deco3)">
	{#snippet template()}
		{@render frame(cards, deco3)}
	{/snippet}
</Story>

<Story name="Spring flip (deco4)">
	{#snippet template()}
		{@render frame(planes, deco4)}
	{/snippet}
</Story>

<!--
	Drives the real interaction: hovering must move every layer in the stack, and
	leaving must put them all back.
-->
<Story
	name="Hover expands the stack"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const tile = canvasElement.querySelector('li[data-iso-item]') as HTMLElement;
		const layers = () =>
			[...tile.querySelectorAll<HTMLElement>('[data-iso-layer]')].map(
				(l) => getComputedStyle(l).transform
			);

		const atRest = layers();

		await userEvent.hover(tile);
		await waitFor(() =>
			expect(layers().filter((t, i) => t !== atRest[i]).length).toBeGreaterThan(0)
		);

		await userEvent.unhover(tile);
		await waitFor(() => expect(layers().join('|')).toBe(atRest.join('|')), { timeout: 3000 });

		// The title is the tile's visible label on the scrollable grid.
		await expect(canvas.getByText('Lorem ipsum')).toBeInTheDocument();
	}}
>
	{#snippet template()}
		{@render frame(artwork, scroll1)}
	{/snippet}
</Story>
