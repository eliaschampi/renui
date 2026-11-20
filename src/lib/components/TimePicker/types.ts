import type { SelectProps } from '../Select';

/**
 * A `Select` of times of day. Values are `HH:MM` (24-hour) strings, as native
 * time inputs use; labels follow the locale. For minute-exact entry use
 * `Input type="time"`.
 */
export interface TimePickerProps extends Omit<
	SelectProps,
	| 'value'
	| 'options'
	| 'placeholder'
	| 'searchMode'
	| 'onsearch'
	| 'loading'
	| 'onchange'
> {
	/** Selected time, `HH:MM` (bindable) */
	value?: string;
	/** Minutes between options, counted from midnight @default 30 */
	interval?: number;
	/** Earliest option, `HH:MM` */
	min?: string;
	/** Latest option, `HH:MM` */
	max?: string;
	/** 12-hour clock @default the locale's */
	hour12?: boolean;
	/** @default locale "Select a time" */
	placeholder?: string;
	onchange?: (value: string) => void;
}
