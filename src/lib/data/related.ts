/**
 * Cards for the page footer. Placeholders pointing at the portfolio — swap the
 * hrefs and artwork as real work goes in.
 */
import { site, lorem } from './site';

export interface RelatedCard {
	href: string;
	img: string;
	title: string;
}

export const relatedCards: RelatedCard[] = [
	{ href: site.portfolio, img: '/img/cards/01.svg', title: 'Lorem ipsum dolor' },
	{ href: site.portfolio, img: '/img/cards/02.svg', title: 'Consectetur adipiscing' }
];

/** Intro line above the cards. */
export const relatedIntro = lorem.short;
