# Quadrille Template

A static site template built around decorative, interactive isometric 3D grids.

The name is the squared paper you sketch a layout on before you draw it.

By [Adriana Bamberger](https://adriana.bamberger.nz/).

All copy is Lorem ipsum and all artwork is generated placeholders, so the
template is ready to have real content dropped into it.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command                           | What it does                                        |
| --------------------------------- | --------------------------------------------------- |
| `npm run dev`                     | Dev server with HMR                                 |
| `npm run build`                   | Static site into `build/`                           |
| `npm run preview`                 | Serve the real production build                     |
| `npm run storybook`               | Component workshop on :6006                         |
| `npm test`                        | Unit tests (node) + component tests (real Chromium) |
| `npm run check`                   | `svelte-check` — types and template diagnostics     |
| `npm run lint` / `npm run format` | Prettier + ESLint                                   |
| `npm run shots`                   | Screenshot every page at three viewports            |
| `npm run placeholders`            | Regenerate the placeholder artwork                  |

`build/` is plain static files — no server. Drop it on any static host.

## Making it yours

Start in [`src/lib/data/site.ts`](src/lib/data/site.ts). Every name, link and
piece of filler copy comes from there:

```ts
export const site = {
	title: 'Quadrille Template',
	tagline: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	author: 'Adriana Bamberger',
	portfolio: 'https://adriana.bamberger.nz/',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
};
```

Change the title and tagline there and the masthead, both page titles and the
meta descriptions all follow. Nothing else in the codebase hard-codes prose.

To restyle the placeholder artwork, edit `PALETTE` in
[`scripts/generate-placeholders.mjs`](scripts/generate-placeholders.mjs) and run
`npm run placeholders`. To replace it with real work, drop files into
`static/img/` and point the arrays in `src/lib/data/` at them — the sizes each
grid expects are listed at the top of the generator.

## How it is put together

Two pages over one engine:

- `/` — a grid pinned to the viewport that slides past as you scroll
- `/static-grid` — four decorative grids separated by prose bands

### A grid variant is data, not CSS

The whole visual vocabulary lives in [`src/lib/iso/presets.ts`](src/lib/iso/presets.ts).
A variant is a 3D transform, a set of box metrics and a per-layer hover
animation:

```ts
export const deco3: IsoPreset = {
  id: 'deco3',
  transform: 'translateX(40vw) translateY(100px) rotateX(15deg) ... rotateZ(40deg)',
  metrics: { stageWidth: '960px', itemWidth: '240px', layerOrigin: '0% 50%', ... },
  planeBackground: nthChildCascade('#fff', [[2, '#f7d2dc'], [3, '#fff0f3'], ...]),
  itemOffsets: { 2: '-160px', 4: '-160px' },
  stack: {
    properties: (pos) => ({ rotateY: pos * -15 }),
    options: (pos, total) => ({ type: 'bezier', durationMs: 500, delayMs: (total - pos - 1) * 40 })
  }
};
```

Those metrics are emitted as **CSS custom properties** on the stage element and
inherit down to the grid and its tiles. That is what lets a variant cross
component boundaries without descendant selectors.

**Adding a sixth variant is one preset object and one `<IsoLayer>` usage, with no
CSS change at all.** If you find yourself reaching for `:global()`, that is the
signal a value wants to be a custom property instead.

### Components

```
src/lib/
├── iso/                     the engine
│   ├── presets.ts           the five variants, as data  ← start here
│   ├── types.ts             IsoPreset, IsoItem, LayerSpec
│   ├── animator.ts          swappable animation backend
│   ├── masonry.ts           SSR-safe masonry wrapper
│   ├── imagesLoaded.ts      promise wrapper
│   ├── reveal.ts            IntersectionObserver reveal action
│   ├── scrollDrive.ts       fixed stage + pseudo-scroller + rAF scroll
│   └── vendor.d.ts          types for the three untyped vendor libraries
├── components/
│   ├── iso/                 IsoLayer → IsoGrid → IsoGridItem → {Image,Plane,Card}Layer
│   ├── chrome/              SiteHeader, DemoNav, MenuButton, LoadVeil, PageTint
│   └── content/             Section, IntervalQuote, RelatedCards, PromoCard
├── data/                    site identity and the grids' content
└── stories/                 IsoStage, the decorator every iso story needs
```

`<IsoLayer preset={…} items={…} />` is the public entry point. Nest it in
whatever page you like.

```ts
export type LayerSpec =
	| { kind: 'image'; src: string; alt: string }
	| { kind: 'plane' }
	| { kind: 'card'; letter: string; number: string };
```

`SiteHeader` takes `pinned` (the scrollable page fixes its header), `tone`
(`dark` for the pale page ground, `light` for a dark section behind it — see
[Accessibility](#accessibility)), and `showMenuButton` with `onMenuClick` — the
hamburger is opt-in and not yet wired to anything, ready for whatever you hang
off it.

## Styling

Tailwind v4 for page chrome — headers, sections, prose bands, spacing, the
responsive breakpoint. Scoped component CSS for the isometric engine, where
`transform-style: preserve-3d`, pseudo-element shadow planes and `@keyframes`
read far better as plain CSS than as arbitrary-value utilities.

Both share one source of truth: design tokens are declared in `@theme` in
[`src/routes/layout.css`](src/routes/layout.css) and emitted as real custom
properties, so scoped CSS reads them with `var(--color-slate-deep)` and
utilities get `text-slate-deep` from the same declaration.

Three things worth knowing before you edit that file:

1. **Element defaults must stay inside `@layer base`.** Tailwind v4 puts its
   utilities in a cascade layer, and an _unlayered_ rule beats every layered one
   regardless of specificity — a bare `a { color: … }` outside the layer
   silently defeats every `text-*` utility in the app.
2. **`body` sets `line-height: normal`**, overriding preflight's `1.5`, because
   the layout was tuned around the tighter metrics. Use `leading-*` utilities on
   new content rather than flipping it.
3. **Preflight zeroes `<p>` margins and resets heading font sizes.** Where a
   block needs them, set them explicitly — and mind `em` vs `rem`: `pb-12` is
   48px, but `3em` on 1.25em text is 60px.

The single breakpoint is registered as `--breakpoint-compact: 50em`, giving the
`max-compact:` variant.

## Testing

- **Unit** (`src/**/*.spec.ts`, node) — the presets, the `nth-child` palette
  cascade, and guards on the grid content: tile counts the presets are tuned
  for, stack depths the hover animations assume, and every referenced asset
  actually existing on disk.
- **Component** (`src/**/*.svelte.spec.ts`, real Chromium via Vitest browser
  mode) — hover interaction, z-index lifting, per-variant offsets and colours.
- **Storybook** — 28 stories. The five presets side by side are the
  visual-regression anchor.
- **Screenshots** — `npm run shots` captures both pages at 1920×1080, 1280×800
  and 480×800 in resting and scrolled states, into `reference-shots/`
  (git-ignored). Commit a set before a risky change and re-shoot after.

Iso components are invisible in a default story frame: the stage is absolutely
positioned and several presets are sized in viewport units. Wrap every iso story
in [`IsoStage`](src/lib/stories/IsoStage.svelte) or it will look broken when it
is not.

## Accessibility

The template is built to WCAG 2.2 AA and ships clean: `npm run a11y` runs
axe-core over both pages at desktop and mobile and exits non-zero on any
violation. All 30 Storybook stories pass the same checks.

Automated scanning only reaches part of the standard, so the rest is covered by
tests and by decisions baked into the components:

- **Keyboard.** The reveal is driven by focus as well as hover, so tabbing
  through a grid expands each tile exactly as hovering does. Both pages open
  with a skip link, because otherwise reaching the footer means tabbing through
  up to 94 tiles.
- **Focus.** Focus is drawn explicitly — the original set `outline: none` on
  every link. If you add a component, do not reintroduce that; style
  `:focus-visible` instead.
- **Names.** Grid artwork is decorative (`alt=""`): a tile is three to five
  images forming one picture, and the link around them carries the name. Each
  tile gets a _distinct_ name from `title` (visible caption) or `label`
  (accessible name only) — a grid of identically-named links cannot be
  navigated. Every grid is labelled, so it is announced as "Selected work" and
  not an unlabelled list of 94 items.
- **Label in Name (2.5.3).** Where a tile shows text, its accessible name
  contains that text. This is why the lettered cards are distinct (`C 03`, not
  sixteen copies of `A 23`) and why only the top card in each stack is printed.
- **Reduced motion.** `prefers-reduced-motion: reduce` collapses every
  animation and transition, and the tile reveal skips its transform entirely —
  tiles still lift and caption, just without the movement.
- **Contrast.** Every text pair clears 4.5:1. The section gradients were
  darkened from the original pastels so white display type passes at the lighter
  stop, and `--color-link-dark` exists because the body link colour is 1.5:1 on
  the dark bands. [`contrast.spec.ts`](src/lib/styles/contrast.spec.ts) parses
  the real `@theme` block and fails if a token drops below AA, so the palette
  cannot regress unnoticed.
- **Targets.** The menu button keeps a 44px hit area behind its smaller glyph
  (WCAG 2.5.8). It is only rendered when given an `onMenuClick` handler — a
  control that does nothing is worse than no control.
- **Reflow (1.4.10).** Both pages reflow to 320px with no horizontal scrolling
  and no clipped text. Section subtitles stay visible on narrow screens; the
  original hid them, which dropped content below the breakpoint.

When you add content, the two things most likely to break this are removing a
tile's name and hard-coding a colour instead of using a token.

> `@storybook/addon-vitest` is deliberately **not** installed: it pins the
> Vitest browser provider to a patch release with an open advisory. Component
> tests run through Vitest browser mode directly instead, and `npm audit` is
> clean.

## Gotchas

**Svelte 5.57 `style:` shorthand.** The shorthand's _server_ codegen emits a
`$derived` signal instead of calling it, putting the thunk's source text into
the prerendered style attribute. Client codegen is correct, so hydration hides
it — but the static HTML is what a no-JS visitor gets. `IsoLayer` passes
`style:transform={stageTransform}` explicitly to avoid it. Worth retesting on
future Svelte releases.

**Keyed `{#each}` over links.** Several lists point at the same URL by default.
Key them by index, not by `href`, or Svelte throws `each_key_duplicate` and the
page fails to hydrate.

**SSR.** `masonry-layout`, `imagesloaded` and `dynamics.js` all touch `window`
at import time, and `adapter-static` prerenders at build time — so all three are
dynamically imported inside `onMount`. A top-level import of any of them breaks
`npm run build`, not just dev.

## Third-party code

- [Masonry](https://masonry.desandro.com/) — MIT
- [imagesLoaded](https://imagesloaded.desandro.com/) — MIT
- [Dynamics.js](http://dynamicsjs.com/) — MIT

All artwork and copy in this repository is generated placeholder content.

© Adriana Bamberger
