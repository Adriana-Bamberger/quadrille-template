/**
 * The pinned promo card. Points at the portfolio by default; delete this file
 * and the <PromoCard> usages to remove it entirely.
 */
import { site, lorem } from './site';

export const promo = {
	href: site.portfolio,
	eyebrow: 'Designed by',
	name: site.author,
	description: lorem.medium
};
