<!--
	The page masthead: title, tagline and the section switcher.

	`pointer-events: none` on the header with `auto` restored on the interactive
	children is deliberate — it lets the mouse reach the 3D grid through the
	header's bounding box, which spans the full page width.
-->
<script lang="ts">
	import DemoNav from './DemoNav.svelte';
	import MenuButton from './MenuButton.svelte';
	import { site } from '#lib/data/site';

	interface Props {
		title?: string;
		tagline?: string;
		/** The scrollable page pins its header; the static page scrolls it away. */
		pinned?: boolean;
		/**
		 * Which ground the header sits on. `dark` draws dark type for the pale page
		 * background; `light` draws light type for a dark section behind it.
		 *
		 * Getting this wrong is a contrast failure, not just a look: the dark tone
		 * measures 1.2:1 against the darkened section gradients.
		 */
		tone?: 'dark' | 'light';
		/**
		 * The hamburger. Requires `onMenuClick` — a control that does nothing is a
		 * usability and accessibility problem, so it is not rendered without one.
		 */
		showMenuButton?: boolean;
		onMenuClick?: () => void;
		/** Passed through to the button when it controls a disclosure. */
		menuExpanded?: boolean;
	}

	let {
		title = site.title,
		tagline = site.tagline,
		pinned = false,
		tone = 'dark',
		showMenuButton = false,
		onMenuClick,
		menuExpanded
	}: Props = $props();
</script>

<header
	class="header pointer-events-none z-[2000] w-full pt-[3vmax] pl-[3vmax] max-compact:w-4/5"
	class:absolute={!pinned}
	class:fixed={pinned}
	class:is-light={tone === 'light'}
>
	<h1
		class="title m-0 text-[4.65em] leading-none font-black tracking-[-0.035em] max-compact:text-[2em]"
	>
		{title}
	</h1>
	<p class="tagline m-0 p-0 text-[1.25em] font-bold max-compact:text-[0.9em]">
		{tagline}
	</p>

	<DemoNav />

	{#if showMenuButton && onMenuClick}
		<!--
			Inside the header: the header owns the z-index 2000 stacking context, and
			a button outside it is painted under PageTint.
		-->
		<MenuButton onclick={onMenuClick} expanded={menuExpanded} />
	{/if}
</header>

<style>
	/*
		One set of properties per tone, inherited by everything in the header
		including DemoNav. Each value clears 4.5:1 on the ground its tone is for.
	*/
	.header {
		--header-fg: var(--color-slate-deep);
		--header-fg-strong: var(--color-slate-mid);
		--header-accent: var(--color-accent);
		/* Dark tone: slate-mid, since white on the pale ground is 1.49:1. */
		--header-tagline: var(--color-slate-mid);
	}

	.header.is-light {
		--header-fg: #ffffff;
		--header-fg-strong: #ffffff;
		--header-accent: #ffffff;
		/*
			Full white, not a tint: 92% white drops below 4.5:1 over the lightest
			section. Hierarchy comes from size and weight instead.
		*/
		--header-tagline: #ffffff;
	}

	.title {
		color: var(--header-fg);
	}

	.tagline {
		color: var(--header-tagline);
	}
</style>
