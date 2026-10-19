<!--
	The full-screen loading spinner, shown until the grids report themselves
	packed.

	The original drew this as `body::after` and hid it by adding a class to
	<body>. As a component it owns its own markup, and because it only renders
	once mounted, a visitor without JS never sees a spinner that will not stop.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		/** Flip to true when every grid on the page has loaded. */
		done?: boolean;
	}

	let { done = false }: Props = $props();

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
</script>

{#if mounted}
	<div class="veil" class:is-done={done} aria-hidden="true"></div>
	<!--
		The spinner is decorative, so the state is announced in text instead.
		`polite` so it waits for a pause rather than interrupting.
	-->
	<p class="sr-only" role="status" aria-live="polite">
		{done ? 'Content loaded.' : 'Loading content.'}
	</p>
{/if}

<style>
	.veil {
		position: fixed;
		z-index: 1000;
		top: 50%;
		left: 50%;
		width: 70px;
		height: 70px;
		margin: -35px 0 0 -35px;
		pointer-events: none;
		border: 3px solid #fff;
		border-right-color: var(--color-slate-deep);
		border-radius: 50%;
		transition: opacity 0.3s;
		animation: veil-spin 0.7s linear infinite forwards;
	}

	.veil.is-done {
		opacity: 0;
	}

	@keyframes veil-spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Visible to screen readers only. */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
