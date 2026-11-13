<script lang="ts">
	import type { SwitchProps } from './types';

	let {
		checked = $bindable(false),
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
	}: SwitchProps = $props();

	function handleChange(event: Event): void {
		checked = (event.currentTarget as HTMLInputElement).checked;
		onchange?.(checked, event);
	}
</script>

<label
	class={[
		'ren-switch',
		`ren-switch--${size}`,
		checked && 'ren-switch--checked',
		disabled && 'ren-switch--disabled',
		`ren-tone ren-tone--${color}`,
		className
	]}
>
	<input
		type="checkbox"
		role="switch"
		class="ren-sr-only"
		{id}
		{name}
		{value}
		{checked}
		{disabled}
		{required}
		aria-label={ariaLabel}
		onchange={handleChange}
	/>

	<span class="ren-switch__track" aria-hidden="true">
		<span class="ren-switch__thumb"></span>
	</span>

	{#if label || children}
		<span class="ren-switch__label">
			{#if children}
				{@render children()}
			{:else}
				{label}
			{/if}
		</span>
	{/if}
</label>

<style>
	.ren-switch {
		--switch-track-w: calc(var(--ren-space-xxl) + var(--ren-space-2xs));
		--switch-track-h: var(--ren-space-lg);
		--switch-inset: var(--ren-border-width-thick);
		--switch-thumb: calc(var(--switch-track-h) - var(--switch-inset) * 2);
		--switch-travel: calc(var(--switch-track-w) - var(--switch-track-h));
		--switch-stretch: var(--ren-space-2xs);
		--switch-label-size: var(--ren-font-size-base);

		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--ren-space-sm);
		cursor: pointer;
		user-select: none;
		font-family: var(--ren-font-family-sans);
	}

	.ren-switch__track {
		display: flex;
		align-items: center;
		width: var(--switch-track-w);
		height: var(--switch-track-h);
		padding: var(--switch-inset);
		box-sizing: border-box;
		background: var(--ren-color-control-fill);
		box-shadow:
			inset 0 0 0 var(--ren-border-width-base) var(--ren-color-control-border),
			var(--ren-control-shadow);
		border-radius: var(--ren-radius-full);
		transition: var(--ren-transition-control);
		flex-shrink: 0;
	}

	.ren-switch__thumb {
		width: var(--switch-thumb);
		height: var(--switch-thumb);
		background: var(--ren-color-white);
		box-sizing: border-box;
		border: var(--ren-border-width-thin) solid
			color-mix(in srgb, var(--ren-color-text) 10%, transparent);
		border-radius: var(--ren-radius-full);
		box-shadow: var(--ren-shadow-sm);
		flex-shrink: 0;
		transition:
			transform var(--ren-duration-fast) var(--ren-easing-default),
			width var(--ren-duration-fast) var(--ren-easing-default);
	}

	.ren-switch__label {
		color: var(--ren-color-text);
		font-size: var(--switch-label-size);
		font-weight: var(--ren-font-weight-medium);
		line-height: var(--ren-line-height-tight);
	}

	/* Checked pairs the role's solid with its foreground thumb (≥ 3:1). */
	.ren-switch--checked .ren-switch__track {
		background: var(--ren-control-solid);
		box-shadow: var(--ren-control-active-shadow);
	}

	.ren-switch--checked .ren-switch__thumb {
		background: var(--ren-control-foreground);
		border-color: transparent;
		transform: translateX(var(--switch-travel));
	}

	.ren-switch:not(.ren-switch--checked):hover .ren-switch__track {
		box-shadow:
			inset 0 0 0 var(--ren-border-width-base) var(--ren-control-active-border),
			var(--ren-control-shadow);
		background: var(--ren-control-active-fill);
	}

	.ren-switch:hover .ren-switch__thumb {
		box-shadow: var(--ren-shadow-md);
	}

	.ren-switch:active .ren-switch__thumb {
		width: calc(var(--switch-thumb) + var(--switch-stretch));
	}

	.ren-switch--checked:active .ren-switch__thumb {
		transform: translateX(calc(var(--switch-travel) - var(--switch-stretch)));
	}

	input:focus-visible + .ren-switch__track {
		box-shadow: var(--ren-control-focus-shadow);
	}

	.ren-switch--sm {
		--switch-track-w: calc(var(--ren-space-xl) + var(--ren-space-2xs));
		--switch-track-h: var(--ren-icon-md);
		--switch-label-size: var(--ren-font-size-sm);
		gap: var(--ren-space-xs);
	}

	.ren-switch--lg {
		--switch-track-w: calc(var(--ren-space-3xl) + var(--ren-space-2xs));
		--switch-track-h: calc(var(--ren-space-lg) + var(--ren-space-2xs));
		--switch-label-size: var(--ren-font-size-lg);
		gap: var(--ren-space-md);
	}

	.ren-switch--disabled {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
	}

	.ren-switch--disabled:not(.ren-switch--checked) .ren-switch__track {
		background: var(--ren-color-border);
		box-shadow: none;
	}
</style>
