import type { Snippet } from 'svelte';
import type { IconSource } from '../../utils/icons';
import type { RenColor, RenControlSize } from '../config';

export type ContextSize = RenControlSize;

export interface ContextProps {
	/** Minimum menu width @default "md" */
	size?: ContextSize;

	class?: string;

	/** Defaults to the localized "Context menu" */
	'aria-label'?: string;

	/** Opened at the pointer; `top`/`left` are the resolved menu coordinates */
	onopen?: (
		event: MouseEvent,
		data?: unknown,
		top?: number,
		left?: number
	) => void;

	onclose?: () => void;

	/** Menu content; receives the `data` passed to `open(event, data)` */
	children?: Snippet<[{ data: unknown }]>;
}

export interface ContextItemProps {
	title?: string;

	icon?: IconSource;

	/** Keyboard hint shown at the end, e.g. "⌘C" */
	shortcut?: string;

	disabled?: boolean;

	/** Semantic accent, e.g. `danger` for destructive items */
	color?: RenColor;

	class?: string;

	onclick?: (event: MouseEvent) => void;
}
