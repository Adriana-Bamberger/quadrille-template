<!--
	Page chrome. These are the pieces you will edit first when making the site
	this template your own.
-->
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SiteHeader from './SiteHeader.svelte';
	import DemoNav from './DemoNav.svelte';
	import MenuButton from './MenuButton.svelte';
	import LoadVeil from './LoadVeil.svelte';
	import PageTint from './PageTint.svelte';
	import SkipLink from './SkipLink.svelte';

	const { Story } = defineMeta({
		title: 'Chrome',
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Site header">
	{#snippet template()}
		<div style:height="420px" style:position="relative">
			<SiteHeader showMenuButton onMenuClick={() => {}} />
		</div>
	{/snippet}
</Story>

<Story name="Demo nav">
	{#snippet template()}
		<div style:padding="2rem"><DemoNav /></div>
	{/snippet}
</Story>

<Story name="Menu button">
	{#snippet template()}
		<div style:height="200px" style:background="#323f5c">
			<MenuButton onclick={() => {}} />
		</div>
	{/snippet}
</Story>

<Story name="Load veil — spinning">
	{#snippet template()}
		<div style:height="300px"><LoadVeil /></div>
	{/snippet}
</Story>

<Story name="Load veil — dismissed">
	{#snippet template()}
		<div style:height="300px"><LoadVeil done /></div>
	{/snippet}
</Story>

<!-- Off-screen until focused; tab into the frame to see it. -->
<Story name="Skip link">
	{#snippet template()}
		<div style:height="200px" style:padding="1rem">
			<SkipLink />
			<p>Tab into this frame — the skip link slides in from the top-left.</p>
		</div>
	{/snippet}
</Story>

<Story name="Page tint">
	{#snippet template()}
		<div style:height="400px" style:background="#d4d2e0" style:position="relative">
			<PageTint />
		</div>
	{/snippet}
</Story>
