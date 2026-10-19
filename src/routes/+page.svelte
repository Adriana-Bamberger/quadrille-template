<!--
	The scrollable grid.

	One stage, pinned to the viewport, whose grid slides past as the page scrolls.
-->
<script lang="ts">
	import IsoLayer from '#lib/components/iso/IsoLayer.svelte';
	import SiteHeader from '#lib/components/chrome/SiteHeader.svelte';
	import LoadVeil from '#lib/components/chrome/LoadVeil.svelte';
	import PageTint from '#lib/components/chrome/PageTint.svelte';
	import PromoCard from '#lib/components/content/PromoCard.svelte';
	import SkipLink from '#lib/components/chrome/SkipLink.svelte';
	import { scroll1 } from '#lib/iso/presets';
	import { scrollGridItems } from '#lib/data/scroll-grid';
	import { site } from '#lib/data/site';
	import { promo } from '#lib/data/promo';

	let loaded = $state(false);
</script>

<svelte:head>
	<title>{site.title} — Scrollable grid</title>
	<meta name="description" content={site.description} />
</svelte:head>

<SkipLink />

<LoadVeil done={loaded} />

<main id="main">
	<SiteHeader pinned />

	<IsoLayer
		preset={scroll1}
		items={scrollGridItems}
		label="Selected work"
		onready={() => (loaded = true)}
	/>

	<PageTint />
</main>

<!--
	In a <footer> rather than loose in the body: axe's `region` rule flags any
	content outside a landmark, and a screen-reader user navigating by landmark
	would otherwise never reach it.
-->
<footer>
	<PromoCard {...promo} placement="fixed" />
</footer>
