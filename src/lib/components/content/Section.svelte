<!--
	A full-viewport band with a heading, a subtitle and a grid behind them.

	The four variants differ only by background and text alignment, so they are a
	prop rather than four classes. The grid itself is passed as a snippet, which
	keeps this component unaware of anything isometric.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'intro' | 'portraits' | 'shots' | 'cards';

	interface Props {
		variant: Variant;
		heading?: string;
		/** Rendered between two rules at small caps — the "of"/"is" in the originals. */
		headingEmphasis?: string;
		/** Text following the emphasised word, when there is one. */
		headingTail?: string;
		subtitle?: string;
		/** Right-align the heading and subtitle. */
		alignRight?: boolean;
		children?: Snippet;
	}

	let {
		variant,
		heading,
		headingEmphasis,
		headingTail,
		subtitle,
		alignRight = false,
		children
	}: Props = $props();

	/*
		Darkened from the original pastels so the white display type clears 4.5:1
		everywhere. The gradients run light-to-dark, and a heading can sit at
		either end, so the *lighter* stop is what has to pass — these do.
	*/
	const BACKGROUNDS: Record<Variant, string> = {
		intro: 'linear-gradient(90deg, #2f6fb0, #27304d)',
		portraits: 'linear-gradient(20deg, #4a6f94, #2c4461)',
		shots: 'linear-gradient(20deg, #4a4fb0, #2a2f6b)',
		cards: 'linear-gradient(20deg, #b4506b, #8d3a56)'
	};
</script>

<section
	class="relative h-screen max-h-[1200px] min-h-[800px] overflow-hidden p-[7vmax]"
	class:text-right={alignRight}
	style:background={BACKGROUNDS[variant]}
>
	{#if heading}
		<h2
			class="pointer-events-none relative z-[1000] m-0 p-0 font-display text-[4.5em]
			       leading-none text-white max-compact:text-[2.5em]"
		>
			{heading}
			{#if headingEmphasis}
				<em
					class="inline-block border-y-[3px] border-white py-[0.15em] align-middle
					       font-sans text-[0.3em] tracking-[0.05em] uppercase not-italic"
				>
					{headingEmphasis}
				</em>
				{headingTail}
			{/if}
		</h2>
	{/if}

	{#if subtitle}
		<!--
			White on every variant, and kept visible on narrow screens: the original
			hid it below the breakpoint, which dropped content at small viewports.
		-->
		<p
			class="pointer-events-none relative z-[1000] max-w-[500px] text-[1.25em] text-white
			       max-compact:text-[1em]"
			class:ml-auto={alignRight}
			class:mt-4={alignRight}
		>
			{subtitle}
		</p>
	{/if}

	{@render children?.()}
</section>
