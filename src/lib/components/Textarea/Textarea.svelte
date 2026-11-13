<script lang="ts">
	import { FieldLabel, FieldMessage } from '../Field';
	import type { TextareaProps } from './types';

	let {
		value = $bindable(''),
		label = '',
		placeholder = '',
		error = false,
		hint = '',
		maxlength,
		disabled = false,
		required = false,
		rows = 3,
		size = 'md',
		color = 'primary',
		showCount = false,
		id: idProp,
		'aria-label': ariaLabel,
		class: className = '',
		...rest
	}: TextareaProps = $props();

	let textarea: HTMLTextAreaElement | undefined = $state();

	const uid = $props.id();
	const id = $derived(idProp ?? `ren-textarea-${uid}`);
	const messageId = $derived(`${id}-message`);
	const invalid = $derived(Boolean(error));
	const errorText = $derived(typeof error === 'string' ? error : '');

	export function focus(): void {
		textarea?.focus();
	}
</script>

<div
	class={[
		'ren-field',
		'ren-textarea',
		`ren-field--${size}`,
		invalid && 'ren-field--invalid',
		disabled && 'ren-field--disabled',
		showCount && maxlength && 'ren-textarea--count',
		`ren-tone ren-tone--${invalid ? 'danger' : color}`,
		className
	]}
	style:--ren-textarea-rows={rows}
>
	{#if label}
		<FieldLabel for={id} {label} required={!!required} />
	{/if}

	<div class="ren-field__control">
		<textarea
			{...rest}
			bind:this={textarea}
			bind:value
			{id}
			{rows}
			{maxlength}
			{placeholder}
			{disabled}
			{required}
			class="ren-field__input ren-autofill"
			aria-label={ariaLabel ?? (label ? undefined : placeholder || undefined)}
			aria-invalid={invalid || undefined}
			aria-describedby={errorText || hint ? messageId : undefined}
		></textarea>

		{#if showCount && maxlength}
			<span class="ren-textarea__count" aria-hidden="true">
				{value?.length ?? 0}/{maxlength}
			</span>
		{/if}
	</div>

	<FieldMessage id={messageId} error={errorText} {hint} />
</div>

<style>
	.ren-textarea {
		--ren-field-pad-y: var(--ren-field-pad-x);
	}

	.ren-textarea .ren-field__control {
		align-items: stretch;
	}

	/* `rows` is the minimum height; the field grows with its content where
	   field-sizing is supported and is resizable everywhere else. */
	textarea {
		field-sizing: content;
		min-block-size: calc(
			var(--ren-textarea-rows) * 1lh + 2 * var(--ren-field-pad-y)
		);
		resize: none;
	}

	@supports not (field-sizing: content) {
		textarea {
			resize: vertical;
		}
	}

	.ren-textarea--count textarea {
		padding-block-end: calc(var(--ren-field-pad-y) + var(--ren-space-md));
	}

	.ren-textarea__count {
		position: absolute;
		inset-block-end: var(--ren-space-2xs);
		inset-inline-end: var(--ren-space-xs);
		padding-inline: var(--ren-space-2xs);
		font-size: var(--ren-font-size-xs);
		font-variant-numeric: tabular-nums;
		color: var(--ren-color-text-muted);
		background: var(--ren-color-control-fill);
		border-radius: var(--ren-radius-sm);
		pointer-events: none;
	}
</style>
