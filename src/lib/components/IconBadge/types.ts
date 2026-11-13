import type { IconSource } from '../../utils/icons';
import type { RenColor, RenDisplaySize } from '../config';

export interface IconBadgeProps {
	/** Icon name from the icon registry */
	icon: IconSource;

	/** Badge color variant */
	color?: RenColor;

	/** Badge size */
	size?: RenDisplaySize;

	/** Additional CSS classes */
	class?: string;
}
