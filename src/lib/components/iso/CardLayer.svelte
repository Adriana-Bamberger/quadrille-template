<!--
	A lettered card, used by deco3. Three of these stacked per tile fan open like
	the pages of a book on hover — the top one is printed, the rest are blank.
-->
<script lang="ts">
	interface Props {
		letter: string;
		number: string;
		background?: string;
		/**
		 * Only the card on top of the stack is printed; the ones behind it are
		 * blank backing cards.
		 *
		 * The original printed all three, which meant the same text appeared three
		 * times inside one link — a screen reader read it three times, and the
		 * link's accessible name could not contain all of it, failing WCAG 2.5.3
		 * Label in Name. Blank backs fix both, and read as pages behind a cover.
		 */
		showText?: boolean;
	}

	let { letter, number, background, showText = true }: Props = $props();
</script>

<div data-iso-layer class="layer" style:background>
	{#if showText}
		<span class="letter">{letter}</span>
		<span class="number">{number}</span>
	{/if}
</div>

<style>
	.layer {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		text-align: center;
		transform-origin: var(--iso-layer-origin, 50% 50%);
	}

	.layer:not(:first-child) {
		position: absolute;
		top: 0;
		left: 0;
	}

	.letter {
		display: block;
		padding: 70px 0 0 0;
		font-size: 6em;
		font-weight: 900;
		line-height: 1;
		color: #000;
	}

	.number {
		display: block;
		font-size: 3em;
		color: #000;
	}
</style>
