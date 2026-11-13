<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { progress: en.progress };
</script>

<script lang="ts">
	import { useLumiLocale } from '../../i18n';
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

	const i18n = useLumiLocale(COPY);
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
		'lumi-progress',
		`lumi-tone lumi-tone--${color}`,
		size !== 'md' && `lumi-progress--${size}`,
		animated && 'lumi-progress--animated',
		className
	]}
>
	<div
		class="lumi-progress__track"
		role="progressbar"
		aria-label={ariaLabel || label || i18n.t.progress}
		aria-valuenow={indeterminate ? undefined : clampedValue}
		aria-valuemin={0}
		aria-valuemax={100}
	>
		<div
			class={[
				'lumi-progress__bar',
				indeterminate && 'lumi-progress__bar--indeterminate'
			]}
			style:--lumi-progress-value={indeterminate
				? undefined
				: clampedValue / 100}
		>
			{#if striped || animated}
				<div class="lumi-progress__stripes"></div>
			{/if}
		</div>
	</div>

	{#if showLabel}
		<div class="lumi-progress__label">
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
	.lumi-progress {
		--_track: var(--lumi-space-xs);
		--_stripe: calc(var(--_track) * 1.5);
		display: flex;
		align-items: center;
		gap: var(--lumi-space-sm);
		width: 100%;
	}

	.lumi-progress__track {
		position: relative;
		flex: 1;
		height: var(--_track);
		overflow: hidden;
		background: var(--lumi-tone-soft);
		border-radius: var(--lumi-radius-full);
	}

	/* Never resized. The bar is as wide as the track and slides in, so its cap
	   stays round; the beam inside scales to the visible part, so the whole
	   beam always shows, bright end in front. Both are transforms, and both
	   follow the same easing: the value moves on the compositor. */
	.lumi-progress__bar {
		--_dir: 1;
		position: relative;
		height: 100%;
		overflow: hidden;
		border-radius: inherit;
		transform: translateX(
			calc((var(--lumi-progress-value, 0) - 1) * 100% * var(--_dir))
		);
	}

	.lumi-progress__bar::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--lumi-tone-beam);
		transform: scaleX(var(--lumi-progress-value, 0));
		transform-origin: right;
	}

	.lumi-progress__bar,
	.lumi-progress__bar::before {
		transition: transform var(--lumi-duration-slow) var(--lumi-easing-default);
	}

	:global([dir='rtl']) .lumi-progress__bar {
		--_dir: -1;
	}

	:global([dir='rtl']) .lumi-progress__bar::before {
		transform-origin: left;
	}

	.lumi-progress__bar--indeterminate {
		--lumi-progress-value: 1;
		transform-origin: left center;
		animation: lumi-progress-indeterminate var(--lumi-duration-shimmer)
			var(--lumi-easing-default) infinite;
	}

	/* One stripe period wider than the bar, so the loop never shows a seam. */
	.lumi-progress__stripes {
		position: absolute;
		inset: 0 calc(var(--_stripe) * -2.83) 0 0;
		background: repeating-linear-gradient(
			-45deg,
			transparent 0 var(--_stripe),
			color-mix(in srgb, var(--lumi-color-white) 24%, transparent) 0
				calc(var(--_stripe) * 2)
		);
	}

	.lumi-progress--animated .lumi-progress__stripes {
		animation: lumi-progress-stripes var(--lumi-duration-spin) linear infinite;
	}

	.lumi-progress__label {
		min-width: calc(var(--lumi-space-md) * 3);
		color: var(--lumi-color-text);
		font-size: var(--lumi-font-size-sm);
		font-weight: var(--lumi-font-weight-semibold);
		font-variant-numeric: tabular-nums;
		text-align: end;
	}

	.lumi-progress--xs {
		--_track: var(--lumi-space-2xs);
	}

	.lumi-progress--sm {
		--_track: calc(var(--lumi-space-2xs) * 1.5);
	}

	.lumi-progress--lg {
		--_track: var(--lumi-space-sm);
	}

	.lumi-progress--xl {
		--_track: var(--lumi-space-md);
	}

	/* scaleX carves the travelling sliver out of the full-width bar. */
	@keyframes lumi-progress-indeterminate {
		from {
			transform: translateX(-100%) scaleX(0.35);
		}
		to {
			transform: translateX(100%) scaleX(0.35);
		}
	}

	@keyframes lumi-progress-stripes {
		to {
			transform: translateX(calc(var(--_stripe) * -2.83));
		}
	}

	/* core.css collapses durations globally; the indeterminate bar additionally
	   needs a resting shape, since a frozen sliver reads as a stuck progress. */
	@media (prefers-reduced-motion: reduce) {
		.lumi-progress__bar--indeterminate {
			transform: none;
			opacity: 0.45;
		}
	}
</style>
