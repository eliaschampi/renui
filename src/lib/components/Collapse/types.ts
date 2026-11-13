import type { Snippet } from 'svelte';
import type { RenColor, RenControlSize } from '../config';

export type CollapseColor = RenColor;
export type CollapseSize = RenControlSize;

export interface CollapseProps {
	title?: string;

	/** Expanded state (bindable) */
	open?: boolean;

	/** Accent for focus and the open chevron @default "primary" */
	color?: CollapseColor;

	/** @default "md" */
	size?: CollapseSize;

	disabled?: boolean;

	class?: string;

	/** Panel content; stays in the DOM (and in search indexes) while closed */
	children?: Snippet;

	/** Fires with the new state after a user toggle */
	ontoggle?: (open: boolean) => void;
}
