<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { slider: en.slider };
</script>

<script lang="ts">
	import { useLumiLocale } from '../../i18n';
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

	const i18n = useLumiLocale(COPY);
	const uid = $props.id();
	const sliderId = $derived(id ?? `lumi-slider-${uid}`);

	const percentage = $derived.by(() => {
		const range = max - min;
		if (!Number.isFinite(value) || !Number.isFinite(range) || range <= 0)
			return 0;
		return Math.min(100, Math.max(0, ((value - min) / range) * 100));
	});
</script>

<div
	class={[
		'lumi-slider',
		`lumi-slider--${size}`,
		`lumi-tone lumi-tone--${color}`,
		disabled && 'lumi-slider--disabled',
		className
	]}
	style:--slider-fill="{percentage}%"
>
	{#if label}
		<div class="lumi-slider__header">
			<label class="lumi-slider__label" for={sliderId}>{label}</label>
			{#if showValue}
				<span class="lumi-slider__value-inline">{value}</span>
			{/if}
		</div>
	{/if}

	<div class="lumi-slider__control">
		<input
			id={sliderId}
			{name}
			class="lumi-slider__input"
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
			<span class="lumi-slider__tooltip" aria-hidden="true">{value}</span>
		{/if}

		<div class="lumi-slider__range-labels" aria-hidden="true">
			<span>{min}</span>
			<span>{max}</span>
		</div>
	</div>

	{#if showValue && !label}
		<div class="lumi-slider__value">{value}</div>
	{/if}
</div>

<style>
	/* A meter is a beam: the filled part of the track is the tone beam, bright
	   where it meets the thumb; the thumb is a solid bead with a white rim. */
	.lumi-slider {
		display: flex;
		flex-direction: column;
		gap: var(--lumi-space-sm);
		width: 100%;

		--slider-fill: 0%;
		--_track-h: calc(var(--lumi-space-2xs) * 1.5);
		--_thumb-size: var(--lumi-icon-md);
	}

	.lumi-slider--sm {
		--_track-h: var(--lumi-space-2xs);
		--_thumb-size: var(--lumi-icon-sm);
	}

	.lumi-slider--lg {
		--_track-h: var(--lumi-space-xs);
		--_thumb-size: var(--lumi-icon-lg);
	}

	.lumi-slider__header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.lumi-slider__label {
		font-size: var(--lumi-font-size-sm);
		font-weight: var(--lumi-font-weight-semibold);
		color: var(--lumi-color-text);
	}

	/* Value read-outs are tone chips: soft fill, tone ink. */
	.lumi-slider__value-inline,
	.lumi-slider__value {
		padding: var(--lumi-space-2xs) var(--lumi-space-xs);
		color: var(--lumi-tone-ink);
		font-size: var(--lumi-font-size-xs);
		font-weight: var(--lumi-font-weight-bold);
		font-variant-numeric: tabular-nums;
		background: var(--lumi-tone-soft);
		border-radius: var(--lumi-radius-full);
	}

	.lumi-slider__value {
		align-self: center;
	}

	.lumi-slider__control {
		position: relative;
		display: flex;
		flex-direction: column;
	}

	/* Track and thumb state live on the input; both engine pseudo-elements read
	   them. */
	.lumi-slider__input {
		--_thumb-scale: 1;
		--_thumb-ring: 0 0 0 0 transparent;
		--_fill: var(--lumi-tone-beam) 0 / var(--slider-fill) 100% no-repeat;
		width: 100%;
		height: var(--lumi-control-height-sm);
		margin: 0;
		appearance: none;
		-webkit-appearance: none;
		background: none;
		border-radius: var(--lumi-radius-full);
		outline: var(--lumi-border-width-thick) solid transparent;
		outline-offset: var(--lumi-focus-outline-offset);
		cursor: pointer;
	}

	:global([dir='rtl']) .lumi-slider__input {
		--_fill: var(--lumi-tone-beam) 100% / var(--slider-fill) 100% no-repeat;
	}

	.lumi-slider__input:hover,
	.lumi-slider__input:active {
		--_thumb-scale: var(--lumi-interactive-zoom-scale);
		--_thumb-ring: 0 0 0 var(--lumi-space-2xs)
			color-mix(in srgb, var(--lumi-control-accent) 22%, transparent);
	}

	.lumi-slider__input:focus-visible {
		--_thumb-ring: 0 0 0 var(--lumi-space-2xs)
			color-mix(
				in srgb,
				var(--lumi-control-accent) var(--lumi-focus-outline-strength),
				transparent
			);
	}

	.lumi-slider__input:active {
		--_thumb-ring: 0 0 0 var(--lumi-space-xs)
			color-mix(in srgb, var(--lumi-control-accent) 26%, transparent);
	}

	.lumi-slider__input::-webkit-slider-runnable-track {
		height: var(--_track-h);
		background: var(--_fill), var(--lumi-tone-soft);
		border-radius: var(--lumi-radius-full);
	}

	.lumi-slider__input::-moz-range-track {
		height: var(--_track-h);
		background: var(--_fill), var(--lumi-tone-soft);
		border-radius: var(--lumi-radius-full);
	}

	.lumi-slider__input::-webkit-slider-thumb {
		appearance: none;
		width: var(--_thumb-size);
		height: var(--_thumb-size);
		margin-top: calc((var(--_track-h) - var(--_thumb-size)) / 2);
		background: var(--lumi-control-solid);
		border: calc(var(--lumi-border-width-base) * 2) solid
			var(--lumi-color-white);
		border-radius: var(--lumi-radius-full);
		box-shadow: var(--lumi-shadow-md), var(--_thumb-ring);
		transform: scale(var(--_thumb-scale));
		transition:
			transform var(--lumi-duration-fast) var(--lumi-easing-default),
			box-shadow var(--lumi-duration-fast) var(--lumi-easing-default);
	}

	/* Same rule body; unknown pseudo-elements invalidate a shared selector list. */
	.lumi-slider__input::-moz-range-thumb {
		box-sizing: border-box;
		width: var(--_thumb-size);
		height: var(--_thumb-size);
		background: var(--lumi-control-solid);
		border: calc(var(--lumi-border-width-base) * 2) solid
			var(--lumi-color-white);
		border-radius: var(--lumi-radius-full);
		box-shadow: var(--lumi-shadow-md), var(--_thumb-ring);
		transform: scale(var(--_thumb-scale));
		transition:
			transform var(--lumi-duration-fast) var(--lumi-easing-default),
			box-shadow var(--lumi-duration-fast) var(--lumi-easing-default);
	}

	/* Value bubble: the solid of the thumb it follows. */
	.lumi-slider__tooltip {
		position: absolute;
		--_tooltip-direction: -1;
		inset-inline-start: var(--slider-fill);
		bottom: calc(100% + var(--lumi-space-2xs));
		transform: translate(
			calc(var(--_tooltip-direction) * var(--slider-fill)),
			var(--lumi-space-xs)
		);
		padding: var(--lumi-space-2xs) var(--lumi-space-sm);
		color: var(--lumi-control-foreground);
		font-size: var(--lumi-font-size-xs);
		font-weight: var(--lumi-font-weight-bold);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		background: var(--lumi-control-solid);
		border-radius: var(--lumi-radius-full);
		box-shadow: var(--lumi-shadow-md);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity var(--lumi-duration-fast) var(--lumi-easing-default),
			transform var(--lumi-duration-fast) var(--lumi-easing-default);
	}

	.lumi-slider__tooltip:dir(rtl) {
		--_tooltip-direction: 1;
	}

	/* Show tooltip on hover or active of input, or hover of control */
	.lumi-slider__control:hover .lumi-slider__tooltip,
	.lumi-slider__input:focus-visible ~ .lumi-slider__tooltip,
	.lumi-slider__input:active ~ .lumi-slider__tooltip {
		opacity: 1;
		transform: translate(
			calc(var(--_tooltip-direction) * var(--slider-fill)),
			0
		);
	}

	.lumi-slider__range-labels {
		display: flex;
		justify-content: space-between;
		margin-top: var(--lumi-space-2xs);
		font-size: var(--lumi-font-size-xs);
		color: var(--lumi-color-text-muted);
	}

	.lumi-slider--disabled {
		opacity: var(--lumi-opacity-disabled);
		pointer-events: none;
	}

	@media (forced-colors: active) {
		.lumi-slider__input:focus-visible {
			outline-color: Highlight;
		}
	}
</style>
