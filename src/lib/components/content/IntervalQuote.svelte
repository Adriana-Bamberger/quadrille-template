<!--
	A dark band of prose between two grid sections, used to give the eye somewhere
	to rest. Optionally carries a promo card, as the first one does.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Body text. Rendered before the attribution. */
		text: string;
		/** Attribution label shown after an em dash. */
		sourceLabel?: string;
		sourceHref?: string;
		children?: Snippet;
	}

	let { text, sourceLabel, sourceHref, children }: Props = $props();
</script>

<section class="relative overflow-hidden bg-night px-[20vw] py-[30vh] max-compact:p-6">
	<!-- my-[1em] restores the default <p> margin that Tailwind's preflight removes. -->
	<p
		class="my-[1em] text-[1.75em] leading-[1.5] text-dusk max-compact:pb-[3em] max-compact:text-[1.25em]"
	>
		{text}
		{#if sourceLabel}
			<em>
				&mdash;
				{#if sourceHref}
					<a class="source" href={sourceHref}>{sourceLabel}</a>
				{:else}
					{sourceLabel}
				{/if}
			</em>
		{/if}
	</p>

	{@render children?.()}
</section>

<style>
	/*
		The base link colour is tuned for the pale page ground and drops to 1.5:1
		on this band.
	*/
	.source {
		color: var(--color-link-dark);
	}

	.source:hover {
		color: #fff;
	}
</style>
