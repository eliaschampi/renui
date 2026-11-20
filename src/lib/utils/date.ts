/**
 * Calendar dates (`YYYY-MM-DD`) and times of day (`HH:MM`), the strings
 * native date and time inputs exchange. Dates are zone-free: they live at UTC
 * midnight, so arithmetic never crosses a daylight-saving edge, and ISO
 * strings sort as text, so range checks are string comparisons.
 */
const DAY_MS = 86_400_000;
/** `YYYY-MM-DD` shape; `parseDate` also rejects impossible days. */
export const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/;

/** Minutes in a day: the exclusive end of the time-of-day scale. */
export const DAY_MINUTES = 1_440;

/** Years listed either side of today in a calendar's year menu. */
export const CALENDAR_YEAR_SPAN = 100;

/** UTC midnight of a valid `YYYY-MM-DD`; impossible days (Feb 31) fail. */
export function parseDate(value: string | null | undefined): Date | undefined {
	const match = value ? DATE_ONLY.exec(value) : null;
	if (!match) return undefined;
	const [, year, month, day] = match.map(Number);
	const date = new Date(0);
	date.setUTCFullYear(year, month - 1, day);
	return date.getUTCMonth() === month - 1 ? date : undefined;
}

export function toIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
	return new Date(date.getTime() + days * DAY_MS);
}

/** Same day `months` later, clamped to the end of a shorter month. */
export function addMonths(date: Date, months: number): Date {
	const next = new Date(date.getTime());
	next.setUTCDate(1);
	next.setUTCMonth(next.getUTCMonth() + months);
	const last = new Date(
		Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)
	).getUTCDate();
	next.setUTCDate(Math.min(date.getUTCDate(), last));
	return next;
}

/** Six weeks covering the month of `date`, rows starting on `weekStart`. */
export function monthGrid(date: Date, weekStart: number): Date[][] {
	const first = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
	const lead = (new Date(first).getUTCDay() - weekStart + 7) % 7;
	const start = first - lead * DAY_MS;
	return Array.from({ length: 6 }, (_, week) =>
		Array.from(
			{ length: 7 },
			(_, day) => new Date(start + (week * 7 + day) * DAY_MS)
		)
	);
}

/** Today in `timeZone` (the runtime's own zone when unset). */
export function today(timeZone?: string): string {
	// Not the shared formatter cache: format.ts reads this module.
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(new Date());
	const part = (type: string) => parts.find((p) => p.type === type)?.value;
	return `${part('year')}-${part('month')}-${part('day')}`;
}

type WeekLocale = Intl.Locale & {
	getWeekInfo?: () => { firstDay: number };
	weekInfo?: { firstDay: number };
};

/** First weekday of `locale`, 0 = Sunday; Sunday where the engine cannot say. */
export function weekStartOf(locale: string): number {
	try {
		const info = new Intl.Locale(locale) as WeekLocale;
		return ((info.getWeekInfo?.() ?? info.weekInfo)?.firstDay ?? 0) % 7;
	} catch {
		return 0;
	}
}

/** Minutes since midnight of a valid `HH:MM` (seconds are ignored). */
export function parseTime(
	value: string | null | undefined
): number | undefined {
	const match = value ? TIME.exec(value) : null;
	return match ? Number(match[1]) * 60 + Number(match[2]) : undefined;
}

export function toTime(minutes: number): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}
