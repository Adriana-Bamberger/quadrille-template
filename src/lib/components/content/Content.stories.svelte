<!--
	The content bands of the static page.
-->
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Section from './Section.svelte';
	import IntervalQuote from './IntervalQuote.svelte';
	import RelatedCards from './RelatedCards.svelte';
	import PromoCard from './PromoCard.svelte';
	import { relatedCards, relatedIntro } from '#lib/data/related';
	import { promo } from '#lib/data/promo';
	import { lorem } from '#lib/data/site';

	const { Story } = defineMeta({
		title: 'Content',
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Section — intro">
	{#snippet template()}
		<Section variant="intro" />
	{/snippet}
</Story>

<Story name="Section — portraits, right aligned">
	{#snippet template()}
		<Section
			variant="portraits"
			alignRight
			heading="Lorem"
			headingEmphasis="ipsum"
			headingTail="dolor"
			subtitle={lorem.medium}
		></Section>
	{/snippet}
</Story>

<Story name="Section — cards">
	{#snippet template()}
		<Section variant="cards" heading="Sit amet consectetur" subtitle={lorem.medium}></Section>
	{/snippet}
</Story>

<Story name="Section — shots, right aligned">
	{#snippet template()}
		<Section
			variant="shots"
			alignRight
			heading="Format"
			headingEmphasis="is"
			headingTail="Everything"
		></Section>
	{/snippet}
</Story>

<Story name="Interval quote">
	{#snippet template()}
		<IntervalQuote
			text={lorem.long}
			sourceLabel="Adriana Bamberger"
			sourceHref="https://adriana.bamberger.nz/"
		/>
	{/snippet}
</Story>

<Story name="Related cards">
	{#snippet template()}
		<RelatedCards items={relatedCards} intro={relatedIntro} />
	{/snippet}
</Story>

<Story name="Promo card — inline">
	{#snippet template()}
		<div
			style:height="360px"
			style:background="#1c222f"
			style:position="relative"
			style:padding="4rem"
		>
			<PromoCard {...promo} placement="inline" />
		</div>
	{/snippet}
</Story>
