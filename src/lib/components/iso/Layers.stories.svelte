<!--
	The three layer primitives, flat and in isolation. Useful when debugging a
	stack: if a layer looks wrong here, the problem is not the 3D maths.
-->
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ImageLayer from './ImageLayer.svelte';
	import PlaneLayer from './PlaneLayer.svelte';
	import CardLayer from './CardLayer.svelte';

	const { Story } = defineMeta({
		title: 'Iso/Layers',
		parameters: {
			docs: {
				description: {
					component:
						'A tile is a stack of these. Sizing and colour come from CSS custom ' +
						'properties set by IsoLayer, so each is shown here with those supplied.'
				}
			}
		}
	});
</script>

<Story name="Image">
	{#snippet template()}
		<div style:width="300px">
			<ImageLayer src="/img/shots/01.svg" alt="Lorem ipsum" />
		</div>
	{/snippet}
</Story>

<Story name="Image with deco2 frame">
	{#snippet template()}
		<div
			style:width="340px"
			style:--iso-layer-border="40px 20px solid #fff"
			style:--iso-layer-shadow="-1px 1px 5px rgba(0,0,0,0.08)"
		>
			<ImageLayer src="/img/frames/02.svg" alt="Lorem ipsum" />
		</div>
	{/snippet}
</Story>

<Story name="Plane">
	{#snippet template()}
		<div style:--iso-plane-w="370px" style:--iso-plane-h="270px" style:--iso-plane-opacity="0.4">
			<PlaneLayer background="#ac5cf5" />
		</div>
	{/snippet}
</Story>

<Story name="Card">
	{#snippet template()}
		<div style:width="240px" style:height="320px">
			<CardLayer letter="C" number="03" background="#f7d2dc" />
		</div>
	{/snippet}
</Story>

<!--
	The cards behind the top one are blank: printing all three put the same text
	three times inside one link, which a screen reader read three times.
-->
<Story name="Card — blank backing">
	{#snippet template()}
		<div style:width="240px" style:height="320px">
			<CardLayer letter="C" number="03" background="#e9c5cc" showText={false} />
		</div>
	{/snippet}
</Story>
