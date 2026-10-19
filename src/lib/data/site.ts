/**
 * Site identity. Everything that names you or points at you lives here, so
 * rebranding the template is a single-file edit.
 */
export const site = {
	title: 'Quadrille Template',
	tagline: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	author: 'Adriana Bamberger',
	/** Used for the masthead links, the promo card and every placeholder link. */
	portfolio: 'https://adriana.bamberger.nz/',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
};

/**
 * Filler copy. Swap these out as real content arrives — nothing else in the
 * codebase hard-codes prose.
 */
export const lorem = {
	short: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	medium:
		'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim ' +
		'veniam, quis nostrud exercitation ullamco laboris.',
	long:
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ' +
		'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud ' +
		'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
	alt:
		'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu ' +
		'fugiat nulla pariatur, excepteur sint occaecat cupidatat non proident.',
	/**
	 * Used to build distinct names for grid tiles. Every tile is a link, and a
	 * grid of identically-named links is unusable with a screen reader.
	 */
	words: ['Lorem', 'Ipsum', 'Dolor', 'Amet', 'Consectetur', 'Adipiscing', 'Elit', 'Tempor']
};
