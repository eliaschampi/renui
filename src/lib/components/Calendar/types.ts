import type { RenColor } from '../config';

/** First weekday: 0 = Sunday … 6 = Saturday. */
export type CalendarWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Dates are `YYYY-MM-DD` strings, as native date inputs use: zone-free, so a
 * day renders the same on the server and in every browser.
 */
export interface CalendarProps {
	/** Selected date (bindable) */
	value?: string;
	/** Select a start–end span instead of one date */
	range?: boolean;
	/** Range start (bindable) */
	start?: string;
	/** Range end (bindable); written together with `start` */
	end?: string;
	/** Earliest selectable date */
	min?: string;
	/** Latest selectable date */
	max?: string;
	/** Excludes single days, e.g. weekends or holidays */
	isDateDisabled?: (date: string) => boolean;
	/** @default the locale's first weekday */
	weekStart?: CalendarWeekday;
	/** Accent of the selection and today @default 'primary' */
	color?: RenColor;
	disabled?: boolean;
	/** Accessible name of the day grid @default the month and year shown */
	'aria-label'?: string;
	class?: string;
	/** A date was chosen; in range mode, once both ends are set */
	onchange?: (value: string, end?: string) => void;
}
