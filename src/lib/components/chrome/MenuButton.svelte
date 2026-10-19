<!--
	The hamburger in the top-right corner.

	The visible glyph keeps its design size while the button itself holds a 44px
	hit area, so it clears WCAG 2.5.8 target size on touch without changing how
	it looks. (The original was 30x20 on narrow screens — under the 24x24
	minimum.)

	SiteHeader only renders this when an `onMenuClick` handler is supplied: a
	control that does nothing is worse than no control.
-->
<script lang="ts">
	interface Props {
		label?: string;
		/** Set when the button controls a disclosure, so its state is announced. */
		expanded?: boolean;
		onclick?: () => void;
	}

	let { label = 'Open menu', expanded, onclick }: Props = $props();
</script>

<button
	type="button"
	class="pointer-events-auto fixed top-[calc(3em-7px)] right-[calc(3em-7px)] grid h-11 w-16
	       cursor-pointer place-items-center border-none bg-transparent fill-white
	       max-compact:top-1 max-compact:right-1"
	aria-label={label}
	aria-expanded={expanded}
	{onclick}
>
	<svg
		class="h-[30px] w-[50px] max-compact:h-5 max-compact:w-[30px]"
		preserveAspectRatio="none"
		viewBox="0 0 67.75 43.63"
		aria-hidden="true"
	>
		<rect width="67.75" height="8.38" />
		<rect x="4.15" y="17.63" width="59.45" height="8.38" />
		<rect y="35.25" width="67.75" height="8.38" />
	</svg>
</button>
