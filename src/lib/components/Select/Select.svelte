<script module lang="ts">
	import * as en from '../../i18n/en';
	import type { SelectValue } from './types';

	const COPY = {
		selectPlaceholder: en.selectPlaceholder,
		selectEmpty: en.selectEmpty,
		selectLoading: en.selectLoading,
		selectClear: en.selectClear,
		selectOpen: en.selectOpen,
		selectClose: en.selectClose
	};

	interface NormalizedOption {
		value: SelectValue | null;
		label: string;
		disabled: boolean;
		key: number;
	}

	/** Structural equality for primitive and plain-object values. */
	function isEqual(
		a: unknown,
		b: unknown,
		seen?: WeakMap<object, unknown>
	): boolean {
		if (Object.is(a, b)) return true;
		if (!a || !b || typeof a !== 'object' || typeof b !== 'object')
			return false;
		seen ??= new WeakMap();
		if (seen.has(a)) return seen.get(a) === b;
		seen.set(a, b);
		if (Array.isArray(a) || Array.isArray(b)) {
			return (
				Array.isArray(a) &&
				Array.isArray(b) &&
				a.length === b.length &&
				a.every((entry, index) => isEqual(entry, b[index], seen))
			);
		}
		const proto = Object.getPrototypeOf(a);
		if (proto !== Object.getPrototypeOf(b)) return false;
		if (proto !== Object.prototype && proto !== null) return false;
		const keys = Object.keys(a);
		return (
			keys.length === Object.keys(b).length &&
			keys.every(
				(key) =>
					Object.hasOwn(b, key) &&
					isEqual(
						(a as Record<string, unknown>)[key],
						(b as Record<string, unknown>)[key],
						seen
					)
			)
		);
	}
</script>

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import X from '@lucide/svelte/icons/x';
	import { tick } from 'svelte';
	import { scale } from 'svelte/transition';
	import '../../styles/floating.css';
	import { portal } from '../../actions/portal';
	import { useRenLocale } from '../../i18n';
	import { createFloating } from '../../utils/floating.svelte';
	import { rovingIndex } from '../../utils/roving';
	import { DURATION_FAST, motion } from '../config';
	import { FieldLabel, FieldMessage } from '../Field';
	import Icon from '../Icon/Icon.svelte';
	import type { SelectProps } from './types';

	let {
		id: idProp,
		value = $bindable(null),
		options = [],
		placeholder,
		label = '',
		name = '',
		'aria-label': ariaLabel,
		size = 'md',
		color = 'primary',
		disabled = false,
		required = false,
		searchable = false,
		searchMode = 'client',
		error = false,
		hint = '',
		noDataText,
		width = '100%',
		clearable = true,
		loading = false,
		class: className = '',
		onchange,
		onopen,
		onclose,
		onsearch
	}: SelectProps = $props();

	let root: HTMLDivElement | undefined = $state();
	let control: HTMLDivElement | undefined = $state();
	let input: HTMLInputElement | undefined = $state();
	let listbox: HTMLDivElement | undefined = $state();
	let focusedIndex = $state(-1);
	let filterText = $state('');

	const i18n = useRenLocale(COPY);
	const floating = createFloating(
		() => control,
		() => listbox,
		{
			offset: 4,
			maxHeight: 250,
			matchWidth: true,
			inside: () => root,
			onoutside: () => closeList()
		}
	);

	const uid = $props.id();
	const inputId = $derived(idProp ?? `ren-select-${uid}`);
	const listboxId = `ren-select-${uid}-listbox`;
	const messageId = `ren-select-${uid}-message`;
	const optionId = (index: number) => `${listboxId}-${index}`;

	const normalized = $derived(
		options.map((option, key): NormalizedOption => {
			if (typeof option !== 'object') {
				return { value: option, label: String(option), disabled: false, key };
			}
			return {
				value: option.value ?? null,
				label: String(option.label ?? option.value ?? ''),
				disabled: Boolean(option.disabled),
				key
			};
		})
	);

	const selected = $derived(
		normalized.find((opt) => isEqual(opt.value, value))
	);
	const selectedLabel = $derived(selected?.label ?? '');
	const open = $derived(floating.isOpen);
	const filtering = $derived(
		searchable &&
			open &&
			filterText !== '' &&
			filterText.toLowerCase() !== selectedLabel.toLowerCase()
	);
	const visible = $derived.by(() => {
		if (!filtering || searchMode === 'server') return normalized;
		const query = filterText.toLowerCase();
		return normalized.filter((opt) => opt.label.toLowerCase().includes(query));
	});
	const navigable = $derived(
		visible.flatMap((opt, index) => (opt.disabled ? [] : [index]))
	);
	const showClear = $derived(
		clearable && value != null && value !== '' && !disabled && !loading
	);
	const formValue = $derived.by(() => {
		if (value == null) return '';
		if (typeof value !== 'object') return String(value);
		try {
			return JSON.stringify(value);
		} catch {
			return '';
		}
	});
	const invalid = $derived(Boolean(error));
	const errorText = $derived(typeof error === 'string' ? error : '');
	// Repeated on the portaled listbox, which does not inherit from the root.
	const tone = $derived(`ren-tone ren-tone--${invalid ? 'danger' : color}`);
	const placeholderText = $derived(placeholder ?? i18n.t.selectPlaceholder);

	function openList(direction?: 1 | -1): void {
		if (disabled || open) return;
		floating.open();
		filterText = selectedLabel;
		const current = selected ? visible.indexOf(selected) : -1;
		focusedIndex =
			current >= 0
				? current
				: direction === 1
					? (navigable[0] ?? -1)
					: direction === -1
						? (navigable.at(-1) ?? -1)
						: -1;
		onopen?.();
	}

	function closeList(): void {
		if (!open) return;
		floating.close();
		focusedIndex = -1;
		filterText = '';
		onclose?.();
	}

	function choose(option: NormalizedOption): void {
		if (option.disabled || loading) return;
		value = option.value;
		onchange?.(option.value);
		closeList();
	}

	function clearValue(): void {
		value = null;
		onchange?.(null);
		filterText = '';
		input?.focus();
	}

	async function focusOption(index: number): Promise<void> {
		focusedIndex = index;
		await tick();
		listbox
			?.querySelector(`#${CSS.escape(optionId(index))}`)
			?.scrollIntoView({ block: 'nearest' });
	}

	function handleKeydown(event: KeyboardEvent): void {
		switch (event.key) {
			case ' ':
				// Space types in a searchable field; it opens a select-only one.
				if (searchable) break;
				event.preventDefault();
				if (!open) openList();
				else if (focusedIndex >= 0) choose(visible[focusedIndex]);
				break;
			case 'Enter':
				event.preventDefault();
				if (!open) openList();
				else if (focusedIndex >= 0) choose(visible[focusedIndex]);
				break;
			case 'Escape':
				if (open) event.preventDefault();
				closeList();
				break;
			case 'Tab':
				closeList();
				break;
			default: {
				const arrow = event.key === 'ArrowDown' || event.key === 'ArrowUp';
				if (arrow) event.preventDefault();
				if (!open) {
					if (arrow) openList(event.key === 'ArrowDown' ? 1 : -1);
					break;
				}
				const at = rovingIndex(
					event,
					navigable.indexOf(focusedIndex),
					navigable.length,
					true
				);
				if (at === undefined) break;
				event.preventDefault();
				void focusOption(navigable[at]);
			}
		}
	}

	function handleInput(event: Event): void {
		if (!searchable) return;
		openList();
		filterText = (event.currentTarget as HTMLInputElement).value;
		focusedIndex = -1;
		onsearch?.(filterText);
	}

	function handleInputClick(): void {
		if (!open) openList();
		else if (!searchable) closeList();
	}

	function handleTrigger(): void {
		if (open) closeList();
		else openList();
		input?.focus();
	}

	function handleFocusOut(event: FocusEvent): void {
		const next = event.relatedTarget as Node | null;
		if (next && (root?.contains(next) || listbox?.contains(next))) return;
		closeList();
	}

	$effect(() => {
		if (disabled) closeList();
	});
</script>

<div
	bind:this={root}
	class={[
		'ren-field',
		'ren-select',
		`ren-field--${size}`,
		open && 'ren-select--open',
		invalid && 'ren-field--invalid',
		disabled && 'ren-field--disabled',
		tone,
		className
	]}
	style:width
	onfocusout={handleFocusOut}
>
	{#if label}
		<FieldLabel for={inputId} {label} {required} />
	{/if}

	<div bind:this={control} class="ren-field__control">
		{#if name || required}
			<!-- Form proxy: a hidden input cannot be validated, so `required`
			     uses a visually hidden one that sends focus to the combobox. -->
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
			class="ren-field__input ren-autofill"
			readonly={!searchable}
			{disabled}
			placeholder={placeholderText}
			value={open && searchable ? filterText : selectedLabel}
			role="combobox"
			autocomplete="off"
			aria-expanded={open}
			aria-controls={open ? listboxId : undefined}
			aria-haspopup="listbox"
			aria-autocomplete={searchable ? 'list' : 'none'}
			aria-activedescendant={focusedIndex > -1
				? optionId(focusedIndex)
				: undefined}
			aria-label={ariaLabel ?? (label ? undefined : placeholderText)}
			aria-required={required || undefined}
			aria-invalid={invalid || undefined}
			aria-describedby={errorText || hint ? messageId : undefined}
			aria-busy={loading || undefined}
			onclick={handleInputClick}
			onkeydown={handleKeydown}
			oninput={handleInput}
		/>

		{#if loading}
			<span class="ren-spinner ren-select__spinner" aria-hidden="true"></span>
		{:else if showClear}
			<button
				type="button"
				class="ren-field__button"
				aria-label={i18n.t.selectClear}
				onclick={clearValue}
			>
				<Icon icon={X} size="sm" />
			</button>
		{:else}
			<button
				type="button"
				class="ren-field__button ren-select__arrow"
				tabindex="-1"
				{disabled}
				aria-label={open ? i18n.t.selectClose : i18n.t.selectOpen}
				onclick={handleTrigger}
			>
				<Icon icon={ChevronDown} size="sm" />
			</button>
		{/if}
	</div>

	{#if open}
		<div
			bind:this={listbox}
			use:portal
			id={listboxId}
			class="ren-floating ren-select__listbox ren-select__listbox--{size} ren-scrollbar {tone}"
			style={floating.styleString}
			transition:scale={{ duration: motion(DURATION_FAST), start: 0.96 }}
			role={loading || visible.length === 0 ? 'status' : 'listbox'}
			aria-label={label || placeholderText}
			aria-busy={loading || undefined}
			onmousedown={(event) => event.preventDefault()}
		>
			{#if loading}
				<div class="ren-select__empty">
					<span class="ren-spinner ren-select__spinner" aria-hidden="true"
					></span>
					{i18n.t.selectLoading}
				</div>
			{:else if visible.length === 0}
				<div class="ren-select__empty">{noDataText ?? i18n.t.selectEmpty}</div>
			{:else}
				{#each visible as option, index (option.key)}
					{@const isSelected = option.key === selected?.key}
					<!-- The listbox keeps focus on the combobox (mousedown is prevented). -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						id={optionId(index)}
						class={[
							'ren-select__option',
							isSelected && 'ren-select__option--selected',
							focusedIndex === index && 'ren-select__option--focused',
							option.disabled && 'ren-select__option--disabled'
						]}
						role="option"
						tabindex="-1"
						aria-selected={isSelected}
						aria-disabled={option.disabled || undefined}
						onclick={() => choose(option)}
						onpointerenter={() => {
							if (!option.disabled) focusedIndex = index;
						}}
					>
						<span class="ren-select__label">{option.label}</span>
						{#if isSelected}
							<Icon icon={Check} size="sm" />
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	{/if}

	<FieldMessage id={messageId} error={errorText} {hint} />
</div>

<style>
	.ren-select .ren-field__control {
		cursor: pointer;
	}

	.ren-select .ren-field__input[readonly] {
		cursor: pointer;
		text-overflow: ellipsis;
	}

	.ren-select__arrow :global(.ren-icon) {
		transition: transform var(--ren-duration-fast) var(--ren-easing-default);
	}

	.ren-select--open .ren-select__arrow :global(.ren-icon) {
		transform: rotate(180deg);
	}

	.ren-select__spinner {
		--ren-spinner-size: var(--ren-icon-sm);
		margin-inline: var(--ren-field-pad-x);
		color: var(--ren-control-accent);
	}

	/* Portaled listbox (floating glass surface). */
	.ren-select__listbox {
		--ren-select-font: var(--ren-font-size-base);
		--ren-select-pad: var(--ren-space-xs) var(--ren-space-sm);
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-2xs);
		padding: var(--ren-space-xs);
		overflow-y: auto;
		overscroll-behavior: contain;
		font-family: var(--ren-font-family-sans);
		font-size: var(--ren-select-font);
	}

	.ren-select__listbox--xs,
	.ren-select__listbox--sm {
		--ren-select-font: var(--ren-font-size-sm);
		--ren-select-pad: var(--ren-space-2xs) var(--ren-space-xs);
	}

	.ren-select__listbox--lg,
	.ren-select__listbox--xl {
		--ren-select-font: var(--ren-font-size-lg);
		--ren-select-pad: var(--ren-space-sm) var(--ren-space-md);
	}

	.ren-select__option {
		display: flex;
		align-items: center;
		gap: var(--ren-space-xs);
		padding: var(--ren-select-pad);
		color: var(--ren-color-text);
		border-radius: var(--ren-radius-control);
		cursor: pointer;
		user-select: none;
		transition: var(--ren-transition-control);
	}

	.ren-select__option--focused {
		background: var(--ren-color-hover);
	}

	.ren-select__option--selected {
		color: var(--ren-tone-ink);
		font-weight: var(--ren-font-weight-semibold);
		background: var(--ren-tone-soft);
	}

	.ren-select__option--disabled {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
	}

	.ren-select__label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ren-select__empty {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--ren-space-sm);
		padding: var(--ren-space-lg) var(--ren-space-md);
		font-size: var(--ren-font-size-sm);
		color: var(--ren-color-text-muted);
	}
</style>
