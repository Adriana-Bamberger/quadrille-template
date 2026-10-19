<!--
	A row of linked cards for the page footer.
-->
<script lang="ts">
	import type { RelatedCard } from '#lib/data/related';

	interface Props {
		items: RelatedCard[];
		intro?: string;
	}

	let { items, intro = '' }: Props = $props();
</script>

<section class="bg-night px-[2vw] py-[10vh] text-center font-bold text-white">
	<!-- my-[1em] restores the default <p> margin that Tailwind's preflight removes. -->
	<p class="my-[1em]">{intro}</p>
	<!--
		Keyed by index, not href: these cards may legitimately share a destination
		(they all point at the portfolio by default), and duplicate keys throw.
	-->
	{#each items as item, i (i)}
		<a
			class="group inline-block p-4 align-top text-white transition-colors duration-300
			       hover:text-white focus:text-white"
			href={item.href}
		>
			<img
				class="max-w-full opacity-60 transition-opacity duration-300 group-hover:opacity-100
				       group-focus:opacity-100"
				src={item.img}
				alt=""
			/>
			<h3 class="m-0 p-2 text-base">{item.title}</h3>
		</a>
	{/each}
</section>
