<!--
	Skip link — WCAG 2.4.1 Bypass Blocks.

	Both pages open with a masthead and then a grid of up to 94 links, so without
	this a keyboard user has to tab through the whole grid to reach anything
	after it. Hidden until focused, then pinned to the top-left.
-->
<script lang="ts">
	interface Props {
		/** Id of the element to jump to. */
		href?: string;
		children?: import('svelte').Snippet;
	}

	let { href = '#main', children }: Props = $props();
</script>

<a class="skip" {href}>
	{#if children}{@render children()}{:else}Skip to main content{/if}
</a>

<style>
	.skip {
		position: fixed;
		z-index: 3000;
		top: 0;
		left: 0;
		padding: 0.75em 1.25em;
		font-weight: 700;
		color: #fff;
		background: var(--color-slate-deep);
		border-bottom-right-radius: 4px;
		/* Off-screen until focused, rather than display:none, so it stays focusable. */
		transform: translateY(-110%);
		transition: transform 0.15s ease-out;
	}

	.skip:focus-visible {
		transform: translateY(0);
		color: #fff;
	}
</style>
