<script lang="ts">
	import type { RadioProps } from './types';

	let {
		group = $bindable(),
		value,
		label = '',
		description = '',
		option = false,
		busy = false,
		id,
		name,
		size = 'md',
		color = 'primary',
		disabled = false,
		required = false,
		class: className = '',
		children,
		onchange,
		'aria-label': ariaLabel
	}: RadioProps = $props();

	const uid = $props.id();
	const labelId = `ren-radio-${uid}-label`;
	const descriptionId = `ren-radio-${uid}-description`;
	const checked = $derived(group === value);

	function handleChange(event: Event): void {
		group = value;
		onchange?.(value, event);
	}
</script>

<label
	class={[
		'ren-radio',
		`ren-radio--${size}`,
		(option || description) && 'ren-radio-option',
		description && 'ren-radio--card',
		busy && 'ren-radio-option--busy',
		checked && 'ren-radio--checked',
		disabled && 'ren-radio--disabled',
		`ren-tone ren-tone--${color}`,
		className
	]}
	aria-busy={busy || undefined}
>
	<input
		type="radio"
		class="ren-sr-only"
		{id}
		{name}
		{value}
		{checked}
		disabled={disabled || busy}
		{required}
		aria-label={ariaLabel}
		aria-labelledby={description && !ariaLabel && (label || children)
			? labelId
			: undefined}
		aria-describedby={description ? descriptionId : undefined}
		onchange={handleChange}
	/>
	<span class="ren-radio__visual" aria-hidden="true">
		<span class="ren-radio__circle"></span>
	</span>
	{#if label || children}
		<span id={labelId} class="ren-radio__label">
			{#if children}
				{@render children()}
			{:else}
				{label}
			{/if}
		</span>
	{/if}
	{#if description}
		<span id={descriptionId} class="ren-radio__description">{description}</span>
	{/if}
</label>

<style>
	/* ── Base control ─────────────────────────────────────────── */
	.ren-radio {
		--radio-size: var(--ren-icon-md);
		--radio-dot-size: var(--ren-space-sm);
		--radio-label-size: var(--ren-font-size-base);

		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--ren-space-sm);
		cursor: pointer;
		user-select: none;
		font-family: var(--ren-font-family-sans);
	}

	.ren-radio__visual {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--radio-size);
		height: var(--radio-size);
		border: var(--ren-border-width-base) solid var(--ren-color-control-border);
		border-radius: var(--ren-radius-full);
		background: var(--ren-color-control-fill);
		box-shadow: var(--ren-control-shadow);
		flex-shrink: 0;
		transition: var(--ren-transition-interactive);
	}

	.ren-radio__circle {
		width: var(--radio-dot-size);
		height: var(--radio-dot-size);
		border-radius: var(--ren-radius-full);
		background: transparent;
		transform: scale(0);
		transition:
			transform var(--ren-duration-fast) var(--ren-easing-default),
			background-color var(--ren-duration-fast) var(--ren-easing-default);
	}

	.ren-radio__label {
		color: var(--ren-color-text);
		font-size: var(--radio-label-size);
		font-weight: var(--ren-font-weight-medium);
		line-height: var(--ren-line-height-tight);
	}

	/* ── Option card (sidebar / dialog lists) ─────────────────── */
	.ren-radio.ren-radio-option {
		width: 100%;
		padding: var(--ren-space-sm) var(--ren-space-md);
		border-radius: var(--ren-radius-option);
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		background: var(--ren-color-surface-card);
		transition: var(--ren-transition-control);
	}

	.ren-radio.ren-radio-option:not(.ren-radio--card) {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--ren-space-sm);
	}

	/* Card: dot + label on the first row, description aligned under the label. */
	.ren-radio.ren-radio-option.ren-radio--card {
		display: grid;
		grid-template-columns: var(--radio-size) minmax(0, 1fr);
		column-gap: var(--ren-space-sm);
		row-gap: var(--ren-space-2xs);
	}

	@media (hover: hover) {
		.ren-radio.ren-radio-option:not(.ren-radio--checked):hover {
			border-color: var(--ren-control-active-border);
			background: var(--ren-control-active-fill);
		}
	}

	.ren-radio.ren-radio-option.ren-radio--checked {
		border-color: var(--ren-control-active-border);
		background: var(--ren-control-active-fill);
		box-shadow: var(--ren-control-active-shadow);
	}

	.ren-radio.ren-radio-option--busy {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
	}

	.ren-radio__description {
		grid-column: 2;
		font-size: var(--ren-font-size-xs);
		font-weight: var(--ren-font-weight-normal);
		line-height: var(--ren-line-height-normal);
		color: var(--ren-color-text-muted);
	}

	/* ── Size variants ────────────────────────────────────────── */
	.ren-radio--sm {
		--radio-size: var(--ren-icon-sm);
		--radio-dot-size: var(--ren-space-xs);
		--radio-label-size: var(--ren-font-size-sm);
	}

	/* ── States ───────────────────────────────────────────────── */
	.ren-radio:not(.ren-radio--checked):hover .ren-radio__visual {
		border-color: var(--ren-control-active-border);
		background: var(--ren-control-active-fill);
	}

	.ren-radio:active .ren-radio__visual {
		transform: scale(var(--ren-interactive-press-scale));
	}

	.ren-radio--checked .ren-radio__visual {
		border-color: var(--ren-control-accent);
		background: var(--ren-control-active-fill);
		box-shadow: var(--ren-control-active-shadow);
	}

	.ren-radio--checked .ren-radio__circle {
		background: var(--ren-control-accent);
		transform: scale(1);
	}

	input:focus-visible + .ren-radio__visual {
		box-shadow: var(--ren-control-focus-shadow);
	}

	.ren-radio--disabled {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
	}

	.ren-radio--disabled .ren-radio__visual {
		background: var(--ren-color-background-secondary);
		border-color: var(--ren-color-border);
	}

	.ren-radio--disabled.ren-radio--checked .ren-radio__visual {
		border-color: var(--ren-color-border);
	}

	.ren-radio--disabled.ren-radio--checked .ren-radio__circle {
		background: var(--ren-color-text-muted);
	}

	/* ── Option list wrapper (pages use on parent div) ─────────── */
	:global(.ren-radio-option-list) {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-sm);
	}

	:global(.ren-radio-option-list--gap-2xs) {
		gap: var(--ren-space-2xs);
	}
</style>
