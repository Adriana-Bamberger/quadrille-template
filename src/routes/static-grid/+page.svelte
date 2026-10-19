<!--
	The static grids.

	Four stages, each with its own preset, separated by prose bands. Every section
	is composition: no layout logic lives here.
-->
<script lang="ts">
	import IsoLayer from '#lib/components/iso/IsoLayer.svelte';
	import SiteHeader from '#lib/components/chrome/SiteHeader.svelte';
	import LoadVeil from '#lib/components/chrome/LoadVeil.svelte';
	import Section from '#lib/components/content/Section.svelte';
	import IntervalQuote from '#lib/components/content/IntervalQuote.svelte';
	import RelatedCards from '#lib/components/content/RelatedCards.svelte';
	import PromoCard from '#lib/components/content/PromoCard.svelte';
	import SkipLink from '#lib/components/chrome/SkipLink.svelte';
	import { deco1, deco2, deco3, deco4 } from '#lib/iso/presets';
	import { deco1Items } from '#lib/data/deco1';
	import { deco2Items } from '#lib/data/deco2';
	import { deco3Items } from '#lib/data/deco3';
	import { deco4Items } from '#lib/data/deco4';
	import { relatedCards, relatedIntro } from '#lib/data/related';
	import { site, lorem } from '#lib/data/site';
	import { promo } from '#lib/data/promo';

	/** The spinner clears once all four grids have reported in. */
	let ready = $state(0);
	const loaded = $derived(ready >= 4);
</script>

<svelte:head>
	<title>{site.title} — Static grid</title>
	<meta name="description" content={site.description} />
</svelte:head>

<SkipLink />

<LoadVeil done={loaded} />

<main id="main">
	<!-- Light tone: this header sits over the dark intro gradient. -->
	<SiteHeader tone="light" />

	<Section variant="intro">
		<IsoLayer preset={deco1} items={deco1Items} label="Selected work" onready={() => ready++} />
	</Section>

	<IntervalQuote text={lorem.long} sourceLabel={site.author} sourceHref={site.portfolio}>
		<PromoCard {...promo} placement="inline" />
	</IntervalQuote>

	<Section
		variant="portraits"
		alignRight
		heading="Lorem"
		headingEmphasis="ipsum"
		headingTail="dolor"
		subtitle={lorem.medium}
	>
		<IsoLayer preset={deco2} items={deco2Items} label="Studies" onready={() => ready++} />
	</Section>

	<IntervalQuote text={lorem.alt} sourceLabel={site.author} sourceHref={site.portfolio} />

	<Section variant="cards" heading="Sit amet consectetur" subtitle={lorem.medium}>
		<IsoLayer preset={deco3} items={deco3Items} label="Index cards" onready={() => ready++} />
	</Section>

	<IntervalQuote text={lorem.long} sourceLabel={site.author} sourceHref={site.portfolio} />

	<Section
		variant="shots"
		alignRight
		heading="Adipiscing"
		headingEmphasis="elit"
		headingTail="sed"
		subtitle={lorem.medium}
	>
		<IsoLayer preset={deco4} items={deco4Items} label="Archive" onready={() => ready++} />
	</Section>

	<RelatedCards items={relatedCards} intro={relatedIntro} />
</main>
