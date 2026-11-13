<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { slider: en.slider };
</script>

<script lang="ts">
	import { useRenLocale } from '../../i18n';
	import type { SliderProps } from './types';

	let {
		name,
		id,
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		label = '',
		color = 'primary',
		size = 'md',
		disabled = false,
		showValue = false,
		showTooltip = true,
		'aria-label': ariaLabel,
		class: className = '',
		onchange
	}: SliderProps = $props();

	const i18n = useRenLocale(COPY);
	const uid = $props.id();
	const sliderId = $derived(id ?? `ren-slider-${uid}`);

	const percentage = $derived.by(() => {
		const range = max - min;
		if (!Number.isFinite(value) || !Number.isFinite(range) || range <= 0)
			return 0;
		return Math.min(100, Math.max(0, ((value - min) / range) * 100));
	});
</script>

<div
	class={[
		'ren-slider',
		`ren-slider--${size}`,
		`ren-tone ren-tone--${color}`,
		disabled && 'ren-slider--disabled',
		className
	]}
	style:--slider-fill="{percentage}%"
>
	{#if label}
		<div class="ren-slider__header">
			<label class="ren-slider__label" for={sliderId}>{label}</label>
			{#if showValue}
				<span class="ren-slider__value-inline">{value}</span>
			{/if}
		</div>
	{/if}

	<div class="ren-slider__control">
		<input
			id={sliderId}
			{name}
			class="ren-slider__input"
			type="range"
			bind:value
			{min}
			{max}
			{step}
			{disabled}
			onchange={() => onchange?.(value)}
			aria-label={ariaLabel ?? (label ? undefined : i18n.t.slider)}
		/>

		{#if showTooltip}
			<span class="ren-slider__tooltip" aria-hidden="true">{value}</span>
		{/if}

		<div class="ren-slider__range-labels" aria-hidden="true">
			<span>{min}</span>
			<span>{max}</span>
		</div>
	</div>

	{#if showValue && !label}
		<div class="ren-slider__value">{value}</div>
	{/if}
</div>

<style>
	/* A meter is a beam: the filled part of the track is the tone beam, bright
	   where it meets the thumb; the thumb is a solid bead with a white rim. */
	.ren-slider {
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-sm);
		width: 100%;

		--slider-fill: 0%;
		--_track-h: calc(var(--ren-space-2xs) * 1.5);
		--_thumb-size: var(--ren-icon-md);
	}

	.ren-slider--sm {
		--_track-h: var(--ren-space-2xs);
		--_thumb-size: var(--ren-icon-sm);
	}

	.ren-slider--lg {
		--_track-h: var(--ren-space-xs);
		--_thumb-size: var(--ren-icon-lg);
	}

	.ren-slider__header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.ren-slider__label {
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-semibold);
		color: var(--ren-color-text);
	}

	/* Value read-outs are tone chips: soft fill, tone ink. */
	.ren-slider__value-inline,
	.ren-slider__value {
		padding: var(--ren-space-2xs) var(--ren-space-xs);
		color: var(--ren-tone-ink);
		font-size: var(--ren-font-size-xs);
		font-weight: var(--ren-font-weight-bold);
		font-variant-numeric: tabular-nums;
		background: var(--ren-tone-soft);
		border-radius: var(--ren-radius-full);
	}

	.ren-slider__value {
		align-self: center;
	}

	.ren-slider__control {
		position: relative;
		display: flex;
		flex-direction: column;
	}

	/* Track and thumb state live on the input; both engine pseudo-elements read
	   them. */
	.ren-slider__input {
		--_thumb-scale: 1;
		--_thumb-ring: 0 0 0 0 transparent;
		--_fill: var(--ren-tone-beam) 0 / var(--slider-fill) 100% no-repeat;
		width: 100%;
		height: var(--ren-control-height-sm);
		margin: 0;
		appearance: none;
		-webkit-appearance: none;
		background: none;
		border-radius: var(--ren-radius-full);
		outline: var(--ren-border-width-thick) solid transparent;
		outline-offset: var(--ren-focus-outline-offset);
		cursor: pointer;
	}

	.ren-slider__input:hover,
	.ren-slider__input:active {
		--_thumb-scale: var(--ren-interactive-zoom-scale);
		--_thumb-ring: 0 0 0 var(--ren-space-2xs)
			color-mix(in srgb, var(--ren-control-accent) 22%, transparent);
	}

	.ren-slider__input:focus-visible {
		--_thumb-ring: 0 0 0 var(--ren-space-2xs)
			color-mix(
				in srgb,
				var(--ren-control-accent) var(--ren-focus-outline-strength),
				transparent
			);
	}

	.ren-slider__input:active {
		--_thumb-ring: 0 0 0 var(--ren-space-xs)
			color-mix(in srgb, var(--ren-control-accent) 26%, transparent);
	}

	.ren-slider__input::-webkit-slider-runnable-track {
		height: var(--_track-h);
		background: var(--_fill), var(--ren-tone-soft);
		border-radius: var(--ren-radius-full);
	}

	.ren-slider__input::-moz-range-track {
		height: var(--_track-h);
		background: var(--_fill), var(--ren-tone-soft);
		border-radius: var(--ren-radius-full);
	}

	.ren-slider__input::-webkit-slider-thumb {
		appearance: none;
		width: var(--_thumb-size);
		height: var(--_thumb-size);
		margin-top: calc((var(--_track-h) - var(--_thumb-size)) / 2);
		background: var(--ren-control-solid);
		border: calc(var(--ren-border-width-base) * 2) solid var(--ren-color-white);
		border-radius: var(--ren-radius-full);
		box-shadow: var(--ren-shadow-md), var(--_thumb-ring);
		transform: scale(var(--_thumb-scale));
		transition:
			transform var(--ren-duration-fast) var(--ren-easing-default),
			box-shadow var(--ren-duration-fast) var(--ren-easing-default);
	}

	/* Same rule body; unknown pseudo-elements invalidate a shared selector list. */
	.ren-slider__input::-moz-range-thumb {
		box-sizing: border-box;
		width: var(--_thumb-size);
		height: var(--_thumb-size);
		background: var(--ren-control-solid);
		border: calc(var(--ren-border-width-base) * 2) solid var(--ren-color-white);
		border-radius: var(--ren-radius-full);
		box-shadow: var(--ren-shadow-md), var(--_thumb-ring);
		transform: scale(var(--_thumb-scale));
		transition:
			transform var(--ren-duration-fast) var(--ren-easing-default),
			box-shadow var(--ren-duration-fast) var(--ren-easing-default);
	}

	/* Value bubble: the solid of the thumb it follows. */
	.ren-slider__tooltip {
		position: absolute;
		left: var(--slider-fill);
		bottom: calc(100% + var(--ren-space-2xs));
		transform: translate(calc(-1 * var(--slider-fill)), var(--ren-space-xs));
		padding: var(--ren-space-2xs) var(--ren-space-sm);
		color: var(--ren-control-foreground);
		font-size: var(--ren-font-size-xs);
		font-weight: var(--ren-font-weight-bold);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		background: var(--ren-control-solid);
		border-radius: var(--ren-radius-full);
		box-shadow: var(--ren-shadow-md);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity var(--ren-duration-fast) var(--ren-easing-default),
			transform var(--ren-duration-fast) var(--ren-easing-default);
	}

	/* Show tooltip on hover or active of input, or hover of control */
	.ren-slider__control:hover .ren-slider__tooltip,
	.ren-slider__input:focus-visible ~ .ren-slider__tooltip,
	.ren-slider__input:active ~ .ren-slider__tooltip {
		opacity: 1;
		transform: translate(calc(-1 * var(--slider-fill)), 0);
	}

	.ren-slider__range-labels {
		display: flex;
		justify-content: space-between;
		margin-top: var(--ren-space-2xs);
		font-size: var(--ren-font-size-xs);
		color: var(--ren-color-text-muted);
	}

	.ren-slider--disabled {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
	}

	@media (forced-colors: active) {
		.ren-slider__input:focus-visible {
			outline-color: Highlight;
		}
	}
</style>
