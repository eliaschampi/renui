import type { RenColor, RenSize } from '../config';
import type { IconSource } from '../../utils/icons';

export type IconColor = RenColor | 'muted' | 'inherit' | `var(--ren-${string})`;

export interface IconProps {
	/** Lucide-compatible component, or a name registered with `registerIcons` */
	icon?: IconSource;

	/** Semantic color or RenUI color token */
	color?: IconColor;

	/** Icon size - predefined or custom CSS size */
	size?: RenSize | string;

	/** Stroke width for the icon */
	stroke?: number;

	/** Additional CSS classes */
	class?: string;

	/** Accessible name for meaningful standalone icons; omitted icons are decorative */
	'aria-label'?: string;
}
