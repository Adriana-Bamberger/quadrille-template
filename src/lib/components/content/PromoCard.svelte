<!--
	A pinned card in the corner of the page — a byline, a short pitch and a link.

	`placement`:
	  fixed  — pinned to the viewport corner, for a full-bleed page
	  inline — flows with the page, for use inside a content band
-->
<script lang="ts">
	interface Props {
		href: string;
		/** Your name, or whatever the card is announcing. */
		name: string;
		description: string;
		/** The small caps line above the name. */
		eyebrow?: string;
		placement?: 'fixed' | 'inline';
	}

	let { href, name, description, eyebrow = 'Designed by', placement = 'fixed' }: Props = $props();
</script>

<a class="promo" class:is-fixed={placement === 'fixed'} {href}>
	<h2 class="title" style:--eyebrow="'{eyebrow}'">{name}</h2>
	<p class="desc">{description}</p>
</a>

<style>
	.promo {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 320px;
		/*
			The card is a fixed 320px, which overflows a padded container at a 320px
			viewport. WCAG 1.4.10 asks for reflow without horizontal scrolling.
		*/
		max-width: 100%;
		padding: 2em 2em 2em 0;
		text-align: right;
		/* Dark type: the wash behind it is light, so white would be ~1.5:1. */
		color: var(--promo-ink, #2e1f52);
	}

	.promo.is-fixed {
		position: fixed;
	}

	/*
		The pinned card is meant to bleed off the viewport corner. The inline one
		is not — inset it so the panel and its glow sit inside the band that
		clips them.
	*/
	.promo:not(.is-fixed) {
		right: 3.5em;
		bottom: 2.5em;
	}

	/*
		The panel behind the card.

		This started as a radial blob drawn in an SVG, which could not work: the
		card's text is a rectangle and an ellipse never covers its corners, so the
		description's corner sat at 95% of the gradient's radius and measured
		1.0:1 against the dark band behind it. Automated scanning could not see it
		either, because the background was an image.

		A solid panel with a blurred glow keeps the soft edge, guarantees the
		contrast the text depends on, scales with the card instead of being a
		fixed 491x332 box that ran off the viewport, and needs no asset.
	*/
	.promo::before {
		content: '';
		position: absolute;
		z-index: 0;
		inset: -1.6em -1.3em -1.3em -1.6em;
		background: linear-gradient(135deg, var(--promo-wash-top, #f2ecfc), var(--promo-wash, #d8c9f2));
		border-radius: 2.5em 0.75em 0.75em 0.75em;
		box-shadow: 0 0 2.5em 1.25em rgba(216, 201, 242, 0.45);
		pointer-events: none;
		transform: translate3d(10px, 10px, 0);
		transition:
			opacity 0.3s,
			transform 0.3s;
	}

	.promo:hover::before {
		transform: translate3d(0, 0, 0);
	}

	.title,
	.desc {
		position: relative;
		color: inherit;
	}

	.title {
		/*
			Tailwind's preflight resets heading font-size to `inherit`, and the
			eyebrow below is sized and positioned in `em` against this heading.
		*/
		margin: 0;
		font-size: 1.5em;
		font-weight: 800;
		letter-spacing: -0.01em;
		transform: translate3d(5px, 10px, 0);
		transition: transform 0.3s;
	}

	.promo:hover .title {
		transform: translate3d(0, 0, 0);
	}

	.title::before {
		content: var(--eyebrow);
		position: absolute;
		bottom: 104%;
		right: 0;
		font-size: 0.45em;
		font-weight: bold;
		letter-spacing: 2px;
		text-transform: uppercase;
		color: var(--promo-eyebrow, #4a3a70);
	}

	.desc {
		margin: 0;
		padding: 0.3em 0 0 0.3em;
		font-weight: 600;
	}

	/*
		On a narrow screen the pinned card becomes a full-width banner; the inline
		one just stops being a floated block.
	*/
	@media (max-width: 50em) {
		.promo.is-fixed {
			width: 100%;
			padding: 1.2em 1em;
			text-align: left;
			background: linear-gradient(135deg, #f2ecfc, #d8c9f2);
		}

		.promo.is-fixed::before {
			display: none;
		}

		.promo.is-fixed .title::before {
			right: auto;
			left: 0;
		}

		/*
			The hover lift is a pointer affordance with no touch equivalent, and
			because `transform` does not affect layout it pushed the title down into
			the description. Dropped here rather than worked around.
		*/
		.promo .title {
			transform: none;
			font-size: 1.3em;
		}

		.promo.is-fixed .desc {
			/* Was 0.65em — around 10px, too small to read comfortably. */
			font-size: 0.8em;
			padding-top: 0.5em;
		}

		.promo:not(.is-fixed) {
			position: relative;
			display: block;
			margin: 0 0 0 auto;
			padding: 0;
			background: none;
		}
	}
</style>
