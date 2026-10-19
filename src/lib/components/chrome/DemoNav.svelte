<!--
	The section switcher.

	The current item is marked three ways — colour, weight and an underline —
	because colour alone fails WCAG 1.4.1, and `aria-current` so it is announced.
	Colours come from the `--header-*` properties SiteHeader sets per tone.
-->
<script lang="ts">
	import { page } from '$app/state';

	interface Link {
		href: string;
		label: string;
	}

	interface Props {
		links?: Link[];
	}

	let {
		links = [
			{ href: '/', label: 'Scrollable grid' },
			{ href: '/static-grid', label: 'Static grid' }
		]
	}: Props = $props();

	const current = $derived(page.url.pathname);
</script>

<nav class="nav max-compact:my-2 max-compact:text-xs" aria-label="Pages">
	{#each links as link (link.href)}
		{@const isCurrent = current === link.href}
		<a
			class="item"
			class:is-current={isCurrent}
			aria-current={isCurrent ? 'page' : undefined}
			href={link.href}
		>
			{link.label}
		</a>
	{/each}
</nav>

<style>
	.nav {
		margin: 1.5em 0;
	}

	.item {
		pointer-events: auto;
		display: inline-block;
		margin-right: 1em;
		font-weight: 700;
		color: var(--header-fg, var(--color-slate-deep));
	}

	.item:hover {
		color: var(--header-fg-strong, var(--color-slate-mid));
	}

	.item.is-current {
		color: var(--header-accent, var(--color-accent));
		/* Not colour alone — see the note above. */
		text-decoration: underline;
		text-underline-offset: 0.3em;
		text-decoration-thickness: 2px;
	}
</style>
