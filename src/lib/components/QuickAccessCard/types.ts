import type { IconSource } from '../../utils/icons';
import type { RenColor } from '../config';

export interface QuickAccessCardProps {
	/** Card title */
	title: string;
	/** Description text */
	description: string;
	/** Lucide icon name */
	icon: IconSource;
	/** Semantic color */
	color?: RenColor;
	/** Whether card shows hover effects */
	hoverable?: boolean;
	/** Link destination (progressive enhancement; SPA routers intercept same-origin clicks) */
	href: string;
	/** Additional CSS classes */
	class?: string;
}
