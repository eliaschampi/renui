<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = {
		calendarPrevious: en.calendarPrevious,
		calendarNext: en.calendarNext,
		calendarMonth: en.calendarMonth,
		calendarYear: en.calendarYear
	};

	const DAY_KEYS = new Map([
		['ArrowLeft', -1],
		['ArrowRight', 1],
		['ArrowUp', -7],
		['ArrowDown', 7]
	]);

	/** `YYYY-MM` of a zero-based month, comparable with an ISO date prefix. */
	const monthKey = (year: number, month: number) =>
		`${year}-${String(month + 1).padStart(2, '0')}`;
</script>

<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { tick } from 'svelte';
	import { useRenLocale } from '../../i18n';
	import {
		CALENDAR_YEAR_SPAN,
		addDays,
		addMonths,
		monthGrid,
		parseDate,
		toIsoDate,
		today,
		weekStartOf
	} from '../../utils/date';
	import { dateFormat } from '../../utils/format';
	import Icon from '../Icon/Icon.svelte';
	import type { CalendarProps } from './types';

	let {
		value = $bindable(''),
		range = false,
		start = $bindable(''),
		end = $bindable(''),
		min,
		max,
		isDateDisabled,
		weekStart,
		color = 'primary',
		disabled = false,
		'aria-label': ariaLabel,
		class: className,
		onchange
	}: CalendarProps = $props();

	const i18n = useRenLocale(COPY);
	const uid = $props.id();
	const titleId = `ren-calendar-${uid}-title`;
	let grid: HTMLTableElement | undefined = $state();
	// First pick of a range until the second completes it; the bound ends
	// change only once both are known.
	let anchor = $state('');
	let hovered = $state('');

	const now = $derived(today(i18n.timeZone));
	const clamp = (iso: string) =>
		min && iso < min ? min : max && iso > max ? max : iso;
	const blocked = (iso: string) =>
		(!!min && iso < min) || (!!max && iso > max) || !!isDateDisabled?.(iso);

	// The roving day, whose month is shown. It follows the selection; arrows,
	// paging and the menus override it until the selection changes again.
	let focused = $derived.by(() => {
		const selected = range ? start : value;
		return clamp(parseDate(selected) ? selected : now);
	});
	const view = $derived(parseDate(focused) ?? (parseDate(now) as Date));
	const viewYear = $derived(view.getUTCFullYear());
	const viewMonth = $derived(view.getUTCMonth());
	const firstDay = $derived(weekStart ?? weekStartOf(i18n.locale));
	const weeks = $derived(monthGrid(view, firstDay));

	const formats = $derived.by(() => {
		const utc = (options: Intl.DateTimeFormatOptions) =>
			dateFormat(i18n.locale, { ...options, timeZone: 'UTC' });
		return {
			weekday: utc({ weekday: 'short' }),
			day: utc({ dateStyle: 'full' }),
			month: utc({ month: 'long' }),
			title: utc({ month: 'long', year: 'numeric' })
		};
	});
	const months = $derived(
		Array.from({ length: 12 }, (_, month) =>
			formats.month.format(Date.UTC(2000, month, 1))
		)
	);
	const years = $derived.by(() => {
		const year = Number(now.slice(0, 4));
		const first =
			parseDate(min)?.getUTCFullYear() ??
			Math.min(year - CALENDAR_YEAR_SPAN, viewYear);
		const last =
			parseDate(max)?.getUTCFullYear() ??
			Math.max(year + CALENDAR_YEAR_SPAN, viewYear);
		return Array.from({ length: last - first + 1 }, (_, i) => first + i);
	});
	const minMonth = $derived(min?.slice(0, 7));
	const maxMonth = $derived(max?.slice(0, 7));
	const shown = $derived(monthKey(viewYear, viewMonth));

	// Highlighted span: the range being picked (anchor to pointer or focus),
	// else the bound selection.
	const span = $derived.by((): [string, string] | undefined => {
		if (range && anchor) {
			const other = hovered || focused;
			return other < anchor ? [other, anchor] : [anchor, other];
		}
		const from = range ? start : value;
		if (!from) return undefined;
		return [from, range ? end || from : from];
	});

	function show(date: Date): void {
		focused = clamp(toIsoDate(date));
	}

	function select(iso: string): void {
		if (disabled || blocked(iso)) return;
		focused = iso;
		if (!range) {
			value = iso;
			onchange?.(iso);
		} else if (!anchor) {
			anchor = iso;
		} else {
			const [from, to] = anchor <= iso ? [anchor, iso] : [iso, anchor];
			anchor = hovered = '';
			start = from;
			end = to;
			onchange?.(from, to);
		}
	}

	async function handleKeydown(event: KeyboardEvent): Promise<void> {
		const { key, shiftKey } = event;
		let next: Date | undefined;
		const step = DAY_KEYS.get(key);
		if (step) next = addDays(view, step);
		else if (key === 'PageUp' || key === 'PageDown')
			next = addMonths(view, (key === 'PageUp' ? -1 : 1) * (shiftKey ? 12 : 1));
		else if (key === 'Home' || key === 'End') {
			const lead = (view.getUTCDay() - firstDay + 7) % 7;
			next = addDays(view, key === 'Home' ? -lead : 6 - lead);
		}
		if (!next) return;
		event.preventDefault();
		show(next);
		await tick();
		grid?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
	}
</script>

<div
	class={[
		'ren-calendar',
		`ren-tone ren-tone--${color}`,
		disabled && 'ren-calendar--disabled',
		className
	]}
>
	<div class="ren-calendar__header">
		<span id={titleId} class="ren-sr-only" aria-live="polite">
			{formats.title.format(view)}
		</span>
		<div class="ren-calendar__menus">
			<span class="ren-calendar__menu">
				<select
					aria-label={i18n.t.calendarMonth}
					value={viewMonth}
					{disabled}
					onchange={(event) =>
						show(
							addMonths(view, Number(event.currentTarget.value) - viewMonth)
						)}
				>
					{#each months as name, month (month)}
						{@const key = monthKey(viewYear, month)}
						<option
							value={month}
							disabled={(!!minMonth && key < minMonth) ||
								(!!maxMonth && key > maxMonth)}>{name}</option
						>
					{/each}
				</select>
				<span
					class="ren-calendar__face ren-calendar__face--month"
					aria-hidden="true"
				>
					{months[viewMonth]}<Icon icon={ChevronDown} size="xs" />
				</span>
			</span>
			<span class="ren-calendar__menu">
				<select
					aria-label={i18n.t.calendarYear}
					value={viewYear}
					{disabled}
					onchange={(event) =>
						show(
							addMonths(
								view,
								(Number(event.currentTarget.value) - viewYear) * 12
							)
						)}
				>
					{#each years as year (year)}
						<option value={year}>{year}</option>
					{/each}
				</select>
				<span class="ren-calendar__face" aria-hidden="true">
					{viewYear}<Icon icon={ChevronDown} size="xs" />
				</span>
			</span>
		</div>
		<button
			type="button"
			class="ren-calendar__step"
			aria-label={i18n.t.calendarPrevious}
			disabled={disabled || (!!minMonth && shown <= minMonth)}
			onclick={() => show(addMonths(view, -1))}
		>
			<Icon icon={ChevronLeft} size="sm" />
		</button>
		<button
			type="button"
			class="ren-calendar__step"
			aria-label={i18n.t.calendarNext}
			disabled={disabled || (!!maxMonth && shown >= maxMonth)}
			onclick={() => show(addMonths(view, 1))}
		>
			<Icon icon={ChevronRight} size="sm" />
		</button>
	</div>

	<table
		bind:this={grid}
		class="ren-calendar__grid"
		role="grid"
		aria-label={ariaLabel}
		aria-labelledby={ariaLabel ? undefined : titleId}
		onkeydown={handleKeydown}
		onpointerleave={() => (hovered = '')}
	>
		<thead>
			<tr>
				{#each weeks[0] as day (day.getTime())}
					<th scope="col">{formats.weekday.format(day)}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each weeks as week, row (row)}
				<tr>
					{#each week as day, column (column)}
						{@const iso = toIsoDate(day)}
						{@const edge = !!span && (iso === span[0] || iso === span[1])}
						{@const band = !!span && span[0] !== span[1]}
						<td
							class={[
								'ren-calendar__cell',
								band && iso === span[0] && 'ren-calendar__cell--start',
								band && iso === span[1] && 'ren-calendar__cell--end',
								band &&
									iso > span[0] &&
									iso < span[1] &&
									'ren-calendar__cell--within'
							]}
							aria-selected={edge}
						>
							<button
								type="button"
								class={[
									'ren-calendar__day',
									day.getUTCMonth() !== viewMonth &&
										'ren-calendar__day--outside',
									iso === now && 'ren-calendar__day--today',
									edge && 'ren-calendar__day--selected'
								]}
								tabindex={iso === focused ? 0 : -1}
								aria-label={formats.day.format(day)}
								aria-current={iso === now ? 'date' : undefined}
								aria-disabled={blocked(iso) || undefined}
								{disabled}
								onclick={() => select(iso)}
								onpointerenter={() => {
									if (anchor) hovered = iso;
								}}
							>
								{day.getUTCDate()}
							</button>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.ren-calendar {
		--ren-calendar-cell: var(--ren-control-height-sm);
		display: inline-flex;
		flex-direction: column;
		gap: var(--ren-space-xs);
		font-family: var(--ren-font-family-sans);
		font-size: var(--ren-font-size-sm);
		color: var(--ren-color-text);
	}

	.ren-calendar--disabled {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
	}

	.ren-calendar__header {
		display: flex;
		align-items: center;
		gap: var(--ren-space-2xs);
	}

	.ren-calendar__menus {
		display: flex;
		flex: 1;
		min-inline-size: 0;
	}

	/* A native select, transparent, over the face that draws it: every platform
	   keeps its own picker (a wheel on touch) for long year lists. */
	.ren-calendar__menu {
		position: relative;
		display: inline-flex;
	}

	.ren-calendar__menu select {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		opacity: 0;
		font: inherit;
		cursor: pointer;
	}

	.ren-calendar__face {
		display: inline-flex;
		align-items: center;
		gap: var(--ren-space-2xs);
		padding: var(--ren-space-2xs) var(--ren-space-xs);
		font-size: var(--ren-font-size-base);
		font-weight: var(--ren-font-weight-semibold);
		border-radius: var(--ren-radius-control);
		transition: var(--ren-transition-control);
	}

	.ren-calendar__face--month {
		text-transform: capitalize;
	}

	.ren-calendar__face :global(.ren-icon) {
		color: var(--ren-color-text-muted);
	}

	.ren-calendar__menu:hover .ren-calendar__face {
		background: var(--ren-color-hover);
	}

	.ren-calendar__menu select:focus-visible + .ren-calendar__face {
		outline: var(--ren-focus-outline);
		outline-offset: calc(var(--ren-border-width-thick) * -1);
	}

	.ren-calendar__step,
	.ren-calendar__day {
		display: inline-grid;
		place-items: center;
		padding: 0;
		font: inherit;
		color: inherit;
		background: transparent;
		border: 0;
		border-radius: var(--ren-radius-control);
		cursor: pointer;
		transition: var(--ren-transition-control);
	}

	.ren-calendar__step {
		inline-size: var(--ren-control-height-xs);
		block-size: var(--ren-control-height-xs);
		color: var(--ren-color-text-muted);
	}

	.ren-calendar__step:hover,
	.ren-calendar__day:hover {
		color: var(--ren-color-text);
		background: var(--ren-color-hover);
	}

	.ren-calendar__step:disabled,
	.ren-calendar__day[aria-disabled='true'] {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
	}

	.ren-calendar__step:focus-visible,
	.ren-calendar__day:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
	}

	/* Rows keep a hairline apart; columns touch so a range reads as one band. */
	.ren-calendar__grid {
		border-collapse: separate;
		border-spacing: 0 calc(var(--ren-space-2xs) / 2);
	}

	.ren-calendar__grid th {
		block-size: var(--ren-calendar-cell);
		font-size: var(--ren-font-size-xs);
		font-weight: var(--ren-font-weight-medium);
		color: var(--ren-color-text-muted);
		text-transform: capitalize;
	}

	.ren-calendar__cell {
		padding: 0;
	}

	.ren-calendar__cell--within {
		background: var(--ren-tone-soft);
	}

	.ren-calendar__cell--start {
		background: linear-gradient(
			to right,
			transparent 50%,
			var(--ren-tone-soft) 50%
		);
	}

	.ren-calendar__cell--end {
		background: linear-gradient(
			to left,
			transparent 50%,
			var(--ren-tone-soft) 50%
		);
	}

	.ren-calendar__day {
		inline-size: var(--ren-calendar-cell);
		block-size: var(--ren-calendar-cell);
		font-variant-numeric: tabular-nums;
	}

	.ren-calendar__cell--within .ren-calendar__day {
		color: var(--ren-tone-ink);
	}

	.ren-calendar__day--outside {
		color: var(--ren-color-text-muted);
	}

	.ren-calendar__day--today {
		font-weight: var(--ren-font-weight-semibold);
		color: var(--ren-tone-ink);
		box-shadow: inset 0 0 0 var(--ren-border-width-thin) currentColor;
	}

	.ren-calendar__day--selected,
	.ren-calendar__day--selected:hover {
		font-weight: var(--ren-font-weight-semibold);
		color: var(--ren-control-foreground);
		background: var(--ren-control-solid);
		box-shadow: none;
	}
</style>
