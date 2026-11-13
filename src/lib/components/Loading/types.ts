import type { Snippet } from 'svelte';
import type { RenColor, RenControlSize } from '../config';

export type LoadingColor = RenColor;
export type LoadingSize = RenControlSize;

export interface LoadingProps {
	/** Size variant */
	size?: LoadingSize;

	/** Color variant */
	color?: LoadingColor;

	/** Loading text */
	text?: string;

	/** Additional CSS classes */
	class?: string;

	/** Rich status text, replacing `text` */
	children?: Snippet;
}
