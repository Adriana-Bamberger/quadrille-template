<!--
	The five presets side by side.

	This is the visual-regression anchor for the whole port: if a preset's
	transform, box metrics or palette drifts, it shows here first.
-->
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IsoStage from '#lib/stories/IsoStage.svelte';
	import IsoLayer from './IsoLayer.svelte';
	import { scroll1, deco1, deco2, deco3, deco4 } from '#lib/iso/presets';
	import { scrollGridItems } from '#lib/data/scroll-grid';
	import { deco1Items } from '#lib/data/deco1';
	import { deco2Items } from '#lib/data/deco2';
	import { deco3Items } from '#lib/data/deco3';
	import { deco4Items } from '#lib/data/deco4';

	const { Story } = defineMeta({
		title: 'Iso/IsoLayer',
		component: IsoLayer,
		parameters: {
			layout: 'fullscreen',
			docs: {
				description: {
					component:
						'The 3D stage. Each story is one preset from `#lib/iso/presets`, which is ' +
						'the single place a grid variant is described.'
				}
			}
		}
	});

	/** Keep stories quick — the real grids are up to 94 tiles. */
	const sample = <T,>(items: T[], n: number) => items.slice(0, n);

	const INTRO_BG = 'linear-gradient(90deg, #58a8fb, #465683)';
	const PORTRAITS_BG = 'linear-gradient(20deg, #f5f0f9, #a8cff1)';
	const SHOTS_BG = 'linear-gradient(20deg, #d1d7ef, #5c61f5)';
</script>

<!--
	The scrollable grid. Shown static here; its scroll behaviour needs a real page,
	so that is exercised by the route rather than a story.
-->
<Story name="Scrollable">
	{#snippet template()}
		<IsoStage height="700px" offsetY="-180px">
			<IsoLayer
				preset={{ ...scroll1, scrollable: false, revealOnScroll: false }}
				items={sample(scrollGridItems, 18)}
			/>
		</IsoStage>
	{/snippet}
</Story>

<Story name="Deco 1 — stacked planes">
	{#snippet template()}
		<IsoStage height="700px" offsetX="-420px" offsetY="260px" background={INTRO_BG}>
			<IsoLayer preset={deco1} items={sample(deco1Items, 12)} />
		</IsoStage>
	{/snippet}
</Story>

<Story name="Deco 2 — scattered photos">
	{#snippet template()}
		<IsoStage height="700px" offsetY="200px" background={PORTRAITS_BG}>
			<IsoLayer preset={deco2} items={sample(deco2Items, 12)} />
		</IsoStage>
	{/snippet}
</Story>

<Story name="Deco 3 — fanning cards">
	{#snippet template()}
		<IsoStage height="700px" offsetX="-300px" offsetY="60px" background="#ffb8cc">
			<IsoLayer preset={deco3} items={deco3Items} />
		</IsoStage>
	{/snippet}
</Story>

<Story name="Deco 4 — spring flip">
	{#snippet template()}
		<IsoStage height="700px" offsetX="320px" offsetY="260px" background={SHOTS_BG}>
			<IsoLayer preset={deco4} items={sample(deco4Items, 12)} />
		</IsoStage>
	{/snippet}
</Story>
