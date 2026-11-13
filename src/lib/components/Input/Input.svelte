<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { clear: en.clear };
</script>

<script lang="ts">
	import CircleX from '@lucide/svelte/icons/circle-x';
	import X from '@lucide/svelte/icons/x';
	import { useRenLocale } from '../../i18n';
	import { FieldLabel, FieldMessage } from '../Field';
	import Icon from '../Icon/Icon.svelte';
	import type { InputProps } from './types';

	let {
		type = 'text',
		value = $bindable(''),
		label = '',
		placeholder = '',
		icon,
		actionIcon,
		actionLabel,
		clearable = false,
		color = 'primary',
		error = false,
		hint = '',
		size = 'md',
		disabled = false,
		readonly = false,
		required = false,
		id: idProp,
		'aria-label': ariaLabel,
		class: className = '',
		onactionclick,
		...rest
	}: InputProps = $props();

	let input: HTMLInputElement | undefined = $state();

	const i18n = useRenLocale(COPY);
	const uid = $props.id();
	const id = $derived(idProp ?? `ren-input-${uid}`);
	const messageId = $derived(`${id}-message`);
	const invalid = $derived(Boolean(error));
	const errorText = $derived(typeof error === 'string' ? error : '');
	const iconSize = $derived(
		size === 'xs' ? 'xs' : size === 'lg' || size === 'xl' ? 'md' : 'sm'
	);
	const showClear = $derived(
		clearable && !disabled && !readonly && value != null && value !== ''
	);

	function clear(): void {
		if (!input) return;
		// Native input event so bindings, handlers and forms all observe it.
		input.value = '';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.focus();
	}

	function action(event: MouseEvent): void {
		input?.focus();
		onactionclick?.(event);
	}

	export function focus(): void {
		input?.focus();
	}
</script>

<div
	class={[
		'ren-field',
		'ren-input-container',
		`ren-field--${size}`,
		invalid && 'ren-field--invalid',
		disabled && 'ren-field--disabled',
		`ren-tone ren-tone--${invalid ? 'danger' : color}`,
		className
	]}
>
	{#if label}
		<FieldLabel for={id} {label} required={!!required} />
	{/if}

	<div class="ren-field__control">
		{#if icon}
			<span class="ren-input__icon" aria-hidden="true">
				<Icon {icon} size={iconSize} />
			</span>
		{/if}

		<input
			{...rest}
			bind:this={input}
			bind:value
			{id}
			{type}
			{placeholder}
			{disabled}
			{readonly}
			{required}
			class="ren-field__input ren-autofill"
			aria-label={ariaLabel ?? (label ? undefined : placeholder || undefined)}
			aria-invalid={invalid || undefined}
			aria-describedby={errorText || hint ? messageId : undefined}
		/>

		{#if invalid}
			<span class="ren-input__invalid" aria-hidden="true">
				<Icon icon={CircleX} size={iconSize} />
			</span>
		{/if}

		{#if showClear}
			<button
				type="button"
				class="ren-field__button"
				aria-label={i18n.t.clear}
				onclick={clear}
			>
				<Icon icon={X} size={iconSize} />
			</button>
		{/if}

		{#if actionIcon}
			<button
				type="button"
				class="ren-field__button"
				aria-label={actionLabel}
				{disabled}
				onclick={action}
			>
				<Icon icon={actionIcon} size={iconSize} />
			</button>
		{/if}
	</div>

	<FieldMessage id={messageId} error={errorText} {hint} />
</div>

<style>
	.ren-input__icon {
		display: inline-flex;
		padding-inline-start: var(--ren-field-pad-x);
	}

	.ren-input__icon + .ren-field__input {
		padding-inline-start: var(--ren-space-xs);
	}

	.ren-input__invalid {
		display: inline-flex;
		padding-inline: var(--ren-space-2xs);
		color: var(--ren-control-accent);
	}

	.ren-input__invalid:last-child {
		padding-inline-end: var(--ren-field-pad-x);
	}

	/* Native date/time pickers: theme-aware (inherits color-scheme), quiet
	   indicator that wakes on hover and focus, no layout jump in WebKit. */
	.ren-field__input::-webkit-calendar-picker-indicator {
		margin: 0;
		opacity: 0.55;
		cursor: pointer;
		transition: opacity var(--ren-duration-fast) var(--ren-easing-default);
	}

	.ren-field__control:is(:hover, :focus-within)
		.ren-field__input::-webkit-calendar-picker-indicator {
		opacity: 1;
	}

	.ren-field__input::-webkit-datetime-edit {
		padding: 0;
	}

	.ren-field__input::-webkit-date-and-time-value {
		text-align: start;
	}

	/* The clearable button replaces WebKit's search cancel glyph. */
	.ren-field__input::-webkit-search-cancel-button {
		appearance: none;
	}
</style>
