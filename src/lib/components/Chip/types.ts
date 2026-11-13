import type { Snippet } from 'svelte';
import type { IconSource } from '../../utils/icons';
import type { RenColor, RenCompactSize } from '../config';

export type ChipColor = RenColor;
export type ChipSize = RenCompactSize;

export interface ChipProps {
	/**
	 * Color variant of the chip
	 * @default "primary"
	 */
	color?: ChipColor;

	/**
	 * Size variant of the chip
	 * @default "md"
	 */
	size?: ChipSize;

	/**
	 * Icon to display before the text
	 */
	icon?: IconSource;

	/**
	 * Whether the chip can be closed
	 * @default false
	 */
	closable?: boolean;

	/**
	 * Custom CSS class
	 */
	class?: string;

	/** Remove button name, e.g. "Remove filter: Paid"; defaults to the localized "Remove" */
	closeLabel?: string;

	/** Label content */
	children?: Snippet;

	/**
	 * Close event handler
	 */
	onclose?: (event: MouseEvent) => void;

	/**
	 * Click event handler
	 */
	onclick?: (event: MouseEvent) => void;
}
