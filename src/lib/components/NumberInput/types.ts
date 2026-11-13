import type { HTMLInputAttributes } from 'svelte/elements';
import type { RenColor, RenExtendedSize } from '../config';
import type { FieldError } from '../Field';

export type NumberInputColor = RenColor;
export type NumberInputSize = RenExtendedSize;

/**
 * Stepper field for bounded numbers; Arrow Up/Down step from the keyboard.
 * Native input attributes (`name`, `inputmode`, events…) pass through to
 * the `<input>`; `class` styles the field root.
 */
export interface NumberInputProps extends Omit<
	HTMLInputAttributes,
	| 'type'
	| 'value'
	| 'min'
	| 'max'
	| 'step'
	| 'size'
	| 'color'
	| 'class'
	| 'children'
	| 'onchange'
> {
	/** Bindable value */
	value?: number;
	/** Lower bound; also the snapping origin for `step` */
	min?: number;
	/** Upper bound */
	max?: number;
	/** Step increment @default 1 */
	step?: number;
	/** Visible label above the field */
	label?: string;
	/** Accent while focused @default 'primary' */
	color?: NumberInputColor;
	/** Invalid state; a string is also shown as the message */
	error?: FieldError;
	/** Helper text below the field; an error message replaces it */
	hint?: string;
	/** @default 'md' */
	size?: NumberInputSize;
	/** Field root class */
	class?: string;
	/** Committed value after a step or blur */
	onchange?: (value: number) => void;
}
