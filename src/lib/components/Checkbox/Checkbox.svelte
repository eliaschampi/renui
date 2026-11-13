<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Minus from '@lucide/svelte/icons/minus';
	import type { CheckboxProps } from './types';

	let {
		checked = $bindable(false),
		indeterminate = $bindable(false),
		id,
		name,
		value,
		label = '',
		size = 'md',
		color = 'primary',
		disabled = false,
		required = false,
		class: className = '',
		children,
		onchange,
		'aria-label': ariaLabel
	}: CheckboxProps = $props();

	function handleChange(event: Event): void {
		checked = (event.currentTarget as HTMLInputElement).checked;
		indeterminate = false;
		onchange?.(checked, event);
	}
</script>

<label
	class={[
		'ren-checkbox',
		`ren-checkbox--${size}`,
		(checked || indeterminate) && 'ren-checkbox--checked',
		disabled && 'ren-checkbox--disabled',
		`ren-tone ren-tone--${color}`,
		className
	]}
>
	<input
		type="checkbox"
		class="ren-sr-only"
		{id}
		{name}
		{value}
		{checked}
		{disabled}
		{required}
		aria-label={ariaLabel}
		onchange={handleChange}
		bind:indeterminate
	/>

	<span class="ren-checkbox__visual" aria-hidden="true">
		{#if indeterminate}
			<Minus
				class="ren-checkbox__icon ren-checkbox__icon--minus"
				strokeWidth={3}
			/>
		{:else if checked}
			<Check
				class="ren-checkbox__icon ren-checkbox__icon--check"
				strokeWidth={3}
			/>
		{/if}
	</span>

	{#if label || children}
		<span class="ren-checkbox__label">
			{#if children}
				{@render children()}
			{:else}
				{label}
			{/if}
		</span>
	{/if}
</label>

<style>
	.ren-checkbox {
		--checkbox-size: var(--ren-icon-md);
		--checkbox-icon-size: var(--ren-icon-sm);
		--checkbox-label-size: var(--ren-font-size-base);
		--checkbox-radius: var(--ren-radius-xs);
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--ren-space-sm);
		cursor: pointer;
		user-select: none;
		font-family: var(--ren-font-family-sans);
		transition: var(--ren-transition-opacity);
	}

	.ren-checkbox__visual {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--checkbox-size);
		height: var(--checkbox-size);
		border: var(--ren-border-width-base) solid var(--ren-color-control-border);
		border-radius: var(--checkbox-radius);
		background: var(--ren-color-control-fill);
		box-shadow: var(--ren-control-shadow);
		transition: var(--ren-transition-interactive);
		flex-shrink: 0;
		overflow: hidden;
	}

	/* Icons mount with their state, so keyframes (not transitions) animate them.
	   The check draws like a pen stroke from its short arm; the dash exceeds
	   both glyphs' length in Lucide's 24-unit viewBox. */
	:global(.ren-checkbox__icon) {
		inline-size: var(--checkbox-icon-size);
		block-size: var(--checkbox-icon-size);
		color: var(--ren-control-foreground);
		pointer-events: none;
	}

	:global(.ren-checkbox__icon--check) {
		stroke-dasharray: 24;
		animation: ren-checkbox-draw var(--ren-duration-base)
			var(--ren-easing-default);
	}

	:global(.ren-checkbox__icon--minus) {
		animation: ren-checkbox-grow var(--ren-duration-fast)
			var(--ren-easing-default);
	}

	@keyframes -global-ren-checkbox-draw {
		from {
			stroke-dashoffset: -24;
		}
	}

	@keyframes -global-ren-checkbox-grow {
		from {
			transform: scaleX(0);
		}
	}

	.ren-checkbox__label {
		color: var(--ren-color-text);
		font-size: var(--checkbox-label-size);
		font-weight: var(--ren-font-weight-medium);
		line-height: var(--ren-line-height-tight);
		cursor: pointer;
	}

	.ren-checkbox--sm {
		--checkbox-size: var(--ren-icon-sm);
		--checkbox-icon-size: var(--ren-icon-xs);
		--checkbox-label-size: var(--ren-font-size-sm);
		--checkbox-radius: var(--ren-radius-2xs);
	}

	.ren-checkbox--checked .ren-checkbox__visual {
		background: var(--ren-control-solid);
		border-color: var(--ren-control-solid);
		box-shadow: var(--ren-control-active-shadow);
	}

	input:focus-visible + .ren-checkbox__visual {
		box-shadow: var(--ren-control-focus-shadow);
	}

	.ren-checkbox:not(.ren-checkbox--checked):hover .ren-checkbox__visual {
		border-color: var(--ren-control-active-border);
		background: var(--ren-control-active-fill);
	}

	.ren-checkbox:active .ren-checkbox__visual {
		transform: scale(var(--ren-interactive-press-scale));
	}

	.ren-checkbox--disabled {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
	}

	.ren-checkbox--disabled:not(.ren-checkbox--checked) .ren-checkbox__visual {
		background: var(--ren-color-background-secondary);
		border-color: var(--ren-color-border);
	}
</style>
