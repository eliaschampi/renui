<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { progress: en.progress };
</script>

<script lang="ts">
	import { useRenLocale } from '../../i18n';
	import type { ProgressProps } from './types';

	const {
		value = 0,
		color = 'primary',
		size = 'md',
		indeterminate = false,
		striped = false,
		animated = false,
		showLabel = false,
		label,
		labelSnippet,
		'aria-label': ariaLabel,
		class: className,
		oncomplete
	}: ProgressProps = $props();

	const i18n = useRenLocale(COPY);
	const clampedValue = $derived(
		Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0
	);

	// Notify once per climb to 100%; dropping below re-arms it.
	let notified = false;
	$effect(() => {
		const complete = !indeterminate && clampedValue >= 100;
		if (complete && !notified) oncomplete?.();
		notified = complete;
	});
</script>

<div
	class={[
		'ren-progress',
		`ren-tone ren-tone--${color}`,
		size !== 'md' && `ren-progress--${size}`,
		animated && 'ren-progress--animated',
		className
	]}
>
	<div
		class="ren-progress__track"
		role="progressbar"
		aria-label={ariaLabel || label || i18n.t.progress}
		aria-valuenow={indeterminate ? undefined : clampedValue}
		aria-valuemin={0}
		aria-valuemax={100}
	>
		<div
			class={[
				'ren-progress__bar',
				indeterminate && 'ren-progress__bar--indeterminate'
			]}
			style:--ren-progress-value={indeterminate
				? undefined
				: clampedValue / 100}
		>
			{#if striped || animated}
				<div class="ren-progress__stripes"></div>
			{/if}
		</div>
	</div>

	{#if showLabel}
		<div class="ren-progress__label">
			{#if labelSnippet}
				{@render labelSnippet({ value: clampedValue, max: 100 })}
			{:else if label}
				{label}
			{:else}
				{Math.round(clampedValue)}%
			{/if}
		</div>
	{/if}
</div>

<style>
	/* A meter is a beam: the fill is the tone beam travelling along a track of
	   its own soft tone, bright at the leading end. */
	.ren-progress {
		--_track: var(--ren-space-xs);
		--_stripe: calc(var(--_track) * 1.5);
		display: flex;
		align-items: center;
		gap: var(--ren-space-sm);
		width: 100%;
	}

	.ren-progress__track {
		position: relative;
		flex: 1;
		height: var(--_track);
		overflow: hidden;
		background: var(--ren-tone-soft);
		border-radius: var(--ren-radius-full);
	}

	/* Never resized. The bar is as wide as the track and slides in, so its cap
	   stays round; the beam inside scales to the visible part, so the whole
	   beam always shows, bright end in front. Both are transforms, and both
	   follow the same easing: the value moves on the compositor. */
	.ren-progress__bar {
		position: relative;
		height: 100%;
		overflow: hidden;
		border-radius: inherit;
		transform: translateX(calc((var(--ren-progress-value, 0) - 1) * 100%));
	}

	.ren-progress__bar::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--ren-tone-beam);
		transform: scaleX(var(--ren-progress-value, 0));
		transform-origin: right;
	}

	.ren-progress__bar,
	.ren-progress__bar::before {
		transition: transform var(--ren-duration-slow) var(--ren-easing-default);
	}

	.ren-progress__bar--indeterminate {
		--ren-progress-value: 1;
		transform-origin: left center;
		animation: ren-progress-indeterminate var(--ren-duration-shimmer)
			var(--ren-easing-default) infinite;
	}

	/* One stripe period wider than the bar, so the loop never shows a seam. */
	.ren-progress__stripes {
		position: absolute;
		inset: 0 calc(var(--_stripe) * -2.83) 0 0;
		background: repeating-linear-gradient(
			-45deg,
			transparent 0 var(--_stripe),
			color-mix(in srgb, var(--ren-color-white) 24%, transparent) 0
				calc(var(--_stripe) * 2)
		);
	}

	.ren-progress--animated .ren-progress__stripes {
		animation: ren-progress-stripes var(--ren-duration-spin) linear infinite;
	}

	.ren-progress__label {
		min-width: calc(var(--ren-space-md) * 3);
		color: var(--ren-color-text);
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-semibold);
		font-variant-numeric: tabular-nums;
		text-align: end;
	}

	.ren-progress--xs {
		--_track: var(--ren-space-2xs);
	}

	.ren-progress--sm {
		--_track: calc(var(--ren-space-2xs) * 1.5);
	}

	.ren-progress--lg {
		--_track: var(--ren-space-sm);
	}

	.ren-progress--xl {
		--_track: var(--ren-space-md);
	}

	/* scaleX carves the travelling sliver out of the full-width bar. */
	@keyframes ren-progress-indeterminate {
		from {
			transform: translateX(-100%) scaleX(0.35);
		}
		to {
			transform: translateX(100%) scaleX(0.35);
		}
	}

	@keyframes ren-progress-stripes {
		to {
			transform: translateX(calc(var(--_stripe) * -2.83));
		}
	}

	/* core.css collapses durations globally; the indeterminate bar additionally
	   needs a resting shape, since a frozen sliver reads as a stuck progress. */
	@media (prefers-reduced-motion: reduce) {
		.ren-progress__bar--indeterminate {
			transform: none;
			opacity: 0.45;
		}
	}
</style>
