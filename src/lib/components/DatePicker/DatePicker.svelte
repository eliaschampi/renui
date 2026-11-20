<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = {
		clear: en.clear,
		datePlaceholder: en.datePlaceholder,
		dateRangePlaceholder: en.dateRangePlaceholder
	};

	const MEDIUM: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };
</script>

<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import X from '@lucide/svelte/icons/x';
	import { tick } from 'svelte';
	import { scale } from 'svelte/transition';
	import '../../styles/floating.css';
	import { portal } from '../../actions/portal';
	import { useRenLocale } from '../../i18n';
	import { parseDate } from '../../utils/date';
	import { createFloating } from '../../utils/floating.svelte';
	import { dateFormat } from '../../utils/format';
	import { focusable } from '../../utils/modal';
	import Calendar from '../Calendar/Calendar.svelte';
	import { DURATION_FAST, motion } from '../config';
	import { FieldLabel, FieldMessage } from '../Field';
	import Icon from '../Icon/Icon.svelte';
	import type { DatePickerProps } from './types';

	let {
		id: idProp,
		value = $bindable(''),
		range = false,
		start = $bindable(''),
		end = $bindable(''),
		min,
		max,
		isDateDisabled,
		weekStart,
		label = '',
		'aria-label': ariaLabel,
		placeholder,
		format = MEDIUM,
		name = '',
		size = 'md',
		color = 'primary',
		disabled = false,
		required = false,
		error = false,
		hint = '',
		clearable = true,
		class: className = '',
		onchange
	}: DatePickerProps = $props();

	let root: HTMLDivElement | undefined = $state();
	let control: HTMLDivElement | undefined = $state();
	let input: HTMLInputElement | undefined = $state();
	let surface: HTMLDivElement | undefined = $state();
	// Hidden surfaces refuse focus: the day is focused once placed.
	let pendingFocus = $state(false);

	const i18n = useRenLocale(COPY);
	const floating = createFloating(
		() => control,
		() => surface,
		{
			offset: 4,
			maxHeight: Number.POSITIVE_INFINITY,
			inside: () => root,
			onoutside: () => close()
		}
	);

	const uid = $props.id();
	const inputId = $derived(idProp ?? `ren-date-picker-${uid}`);
	const surfaceId = `ren-date-picker-${uid}-calendar`;
	const messageId = `ren-date-picker-${uid}-message`;

	const open = $derived(floating.isOpen);
	const text = $derived.by(() => {
		const shown = dateFormat(i18n.locale, { ...format, timeZone: 'UTC' });
		if (!range) {
			const date = parseDate(value);
			return date ? shown.format(date) : '';
		}
		const from = parseDate(start);
		const to = parseDate(end);
		return from && to ? shown.formatRange(from, to) : '';
	});
	const formValue = $derived(range ? (text ? `${start}/${end}` : '') : value);
	const invalid = $derived(Boolean(error));
	const errorText = $derived(typeof error === 'string' ? error : '');
	// Repeated on the portaled surface, which does not inherit from the root.
	const tone = $derived(`ren-tone ren-tone--${invalid ? 'danger' : color}`);
	const placeholderText = $derived(
		placeholder ??
			(range ? i18n.t.dateRangePlaceholder : i18n.t.datePlaceholder)
	);
	const showClear = $derived(clearable && !!text && !disabled);

	function show(): void {
		if (disabled || open) return;
		floating.open();
		pendingFocus = true;
	}

	function close(restoreFocus = false): void {
		if (!open) return;
		pendingFocus = false;
		floating.close();
		if (restoreFocus) input?.focus();
	}

	$effect(() => {
		if (!floating.hasPosition || !pendingFocus) return;
		pendingFocus = false;
		void tick().then(() =>
			surface
				?.querySelector<HTMLElement>('[role="grid"] [tabindex="0"]')
				?.focus()
		);
	});

	$effect(() => {
		if (disabled) close();
	});

	function handleChange(date: string, last?: string): void {
		close(true);
		onchange?.(date, last);
	}

	function clear(): void {
		if (range) {
			start = end = '';
			onchange?.('', '');
		} else {
			value = '';
			onchange?.('');
		}
		input?.focus();
	}

	function handleInputKeydown(event: KeyboardEvent): void {
		if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
			event.preventDefault();
			show();
		}
	}

	// A dialog keeps Tab inside and closes on Escape, back to the field.
	function handleSurfaceKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			close(true);
			return;
		}
		if (event.key !== 'Tab' || !surface) return;
		const elements = focusable(surface);
		const edge = event.shiftKey ? elements[0] : elements.at(-1);
		if (document.activeElement !== edge) return;
		event.preventDefault();
		(event.shiftKey ? elements.at(-1) : elements[0])?.focus();
	}
</script>

<div
	bind:this={root}
	class={[
		'ren-field',
		'ren-date-picker',
		`ren-field--${size}`,
		invalid && 'ren-field--invalid',
		disabled && 'ren-field--disabled',
		tone,
		className
	]}
>
	{#if label}
		<FieldLabel for={inputId} {label} {required} />
	{/if}

	<div bind:this={control} class="ren-field__control">
		{#if name || required}
			<!-- Form proxy, as in Select: `required` needs a validatable input. -->
			<input
				class="ren-sr-only"
				tabindex="-1"
				aria-hidden="true"
				{name}
				value={formValue}
				{required}
				{disabled}
				oninvalid={() => input?.focus()}
			/>
		{/if}

		<input
			bind:this={input}
			id={inputId}
			type="text"
			class="ren-field__input"
			readonly
			{disabled}
			placeholder={placeholderText}
			value={text}
			role="combobox"
			autocomplete="off"
			aria-haspopup="dialog"
			aria-expanded={open}
			aria-controls={open ? surfaceId : undefined}
			aria-label={ariaLabel ?? (label ? undefined : placeholderText)}
			aria-required={required || undefined}
			aria-invalid={invalid || undefined}
			aria-describedby={errorText || hint ? messageId : undefined}
			onclick={() => (open ? close() : show())}
			onkeydown={handleInputKeydown}
		/>

		{#if showClear}
			<button
				type="button"
				class="ren-field__button"
				aria-label={i18n.t.clear}
				onclick={clear}
			>
				<Icon icon={X} size="sm" />
			</button>
		{:else}
			<button
				type="button"
				class="ren-field__button"
				tabindex="-1"
				aria-label={placeholderText}
				{disabled}
				onclick={() => (open ? close() : show())}
			>
				<Icon icon={CalendarDays} size="sm" />
			</button>
		{/if}
	</div>

	{#if open}
		<div
			bind:this={surface}
			use:portal
			id={surfaceId}
			class="ren-floating ren-date-picker__surface ren-scrollbar {tone}"
			style={floating.styleString}
			transition:scale={{ duration: motion(DURATION_FAST), start: 0.96 }}
			role="dialog"
			aria-label={label || ariaLabel || placeholderText}
			tabindex="-1"
			onkeydown={handleSurfaceKeydown}
		>
			<Calendar
				bind:value
				bind:start
				bind:end
				{range}
				{min}
				{max}
				{isDateDisabled}
				{weekStart}
				{color}
				onchange={handleChange}
			/>
		</div>
	{/if}

	<FieldMessage id={messageId} error={errorText} {hint} />
</div>

<style>
	.ren-date-picker .ren-field__control,
	.ren-date-picker .ren-field__input {
		cursor: pointer;
		text-overflow: ellipsis;
	}

	.ren-date-picker__surface {
		padding: var(--ren-space-sm);
		overflow-y: auto;
		overscroll-behavior: contain;
	}
</style>
