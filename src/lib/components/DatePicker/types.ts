import type { CalendarProps } from '../Calendar';
import type { RenExtendedSize } from '../config';
import type { FieldError } from '../Field';

export type DatePickerSize = RenExtendedSize;

/**
 * Field that opens a `Calendar`. Dates are `YYYY-MM-DD` strings, as native
 * date inputs use; `range` picks a start–end span in one field.
 */
export interface DatePickerProps extends Pick<
	CalendarProps,
	| 'value'
	| 'range'
	| 'start'
	| 'end'
	| 'min'
	| 'max'
	| 'isDateDisabled'
	| 'weekStart'
	| 'color'
	| 'disabled'
	| 'onchange'
> {
	/** Id of the combobox input, to point a `<label for>` at it */
	id?: string;
	/** Visible label above the field */
	label?: string;
	/** Accessible name when no visible label is present */
	'aria-label'?: string;
	/** @default locale "Select a date" ("Select dates" with `range`) */
	placeholder?: string;
	/** Shown date format, in the locale @default { dateStyle: 'medium' } */
	format?: Intl.DateTimeFormatOptions;
	/** Submits the date; with `range`, the ISO 8601 interval `start/end` */
	name?: string;
	required?: boolean;
	/** Invalid state; a string is also shown as the message */
	error?: FieldError;
	/** Helper text below the field; an error message replaces it */
	hint?: string;
	/** Show a clear button while a date is set @default true */
	clearable?: boolean;
	/** @default 'md' */
	size?: DatePickerSize;
	class?: string;
}
