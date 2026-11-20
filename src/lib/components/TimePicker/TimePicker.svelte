<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { timePlaceholder: en.timePlaceholder };
</script>

<script lang="ts">
	import { useRenLocale } from '../../i18n';
	import { DAY_MINUTES, parseTime, toTime } from '../../utils/date';
	import { dateFormat } from '../../utils/format';
	import Select from '../Select/Select.svelte';
	import type { SelectOption } from '../Select';
	import type { TimePickerProps } from './types';

	let {
		value = $bindable(''),
		interval = 30,
		min,
		max,
		hour12,
		placeholder,
		onchange,
		...rest
	}: TimePickerProps = $props();

	const i18n = useRenLocale(COPY);
	// `HH:MM` of the bound value (seconds dropped), or null when unset.
	const selected = $derived.by(() => {
		const minutes = parseTime(value);
		return minutes === undefined ? null : toTime(minutes);
	});

	const options = $derived.by(() => {
		// Minutes as epoch milliseconds, formatted in UTC: the clock face only.
		const label = dateFormat(i18n.locale, {
			hour: 'numeric',
			minute: '2-digit',
			hour12,
			timeZone: 'UTC'
		});
		const option = (minutes: number): SelectOption => ({
			value: toTime(minutes),
			label: label.format(minutes * 60_000)
		});
		const step = Math.max(1, Math.round(interval));
		const first = Math.ceil((parseTime(min) ?? 0) / step) * step;
		const last = parseTime(max) ?? DAY_MINUTES - 1;
		const list: SelectOption[] = [];
		for (let minutes = first; minutes <= last; minutes += step)
			list.push(option(minutes));
		// A bound value between steps stays visible and selected.
		if (selected && !list.some((o) => o.value === selected)) {
			const at = list.findIndex((o) => (o.value as string) > selected);
			list.splice(at < 0 ? list.length : at, 0, option(parseTime(selected)!));
		}
		return list;
	});
</script>

<Select
	{...rest}
	bind:value={
		() => selected, (next) => (value = typeof next === 'string' ? next : '')
	}
	{options}
	placeholder={placeholder ?? i18n.t.timePlaceholder}
	onchange={(next) => onchange?.(typeof next === 'string' ? next : '')}
/>
