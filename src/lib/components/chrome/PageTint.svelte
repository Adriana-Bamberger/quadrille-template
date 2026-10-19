<!--
	The diagonal wash over the scrollable grid, which darkens the lower-right of
	the viewport so the masthead stays legible against bright artwork.

	Was `.demo-1 main::after` — a pseudo-element on a page-level selector, which
	is exactly the kind of rule that has nowhere to live in a component tree.
-->
<div class="tint" aria-hidden="true"></div>

<style>
	.tint {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		background: linear-gradient(135deg, transparent, rgba(50, 63, 92, 0.6));
	}
</style>
