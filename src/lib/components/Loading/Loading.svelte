<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { loading: en.loading };
</script>

<script lang="ts">
	import { useRenLocale } from '../../i18n';
	import type { LoadingProps } from './types';

	const {
		size = 'md',
		color = 'primary',
		text = '',
		class: className,
		children
	}: LoadingProps = $props();

	const i18n = useRenLocale(COPY);
</script>

<div
	class={[
		'ren-loading',
		size !== 'md' && `ren-loading--${size}`,
		`ren-tone ren-tone--${color}`,
		className
	]}
	role="status"
	aria-label={text || children ? undefined : i18n.t.loading}
>
	<!-- Track plus an arc that grows, shrinks and turns; reduced motion keeps
	     a still arc. -->
	<svg class="ren-loading__indicator" viewBox="0 0 48 48" aria-hidden="true">
		<circle class="ren-loading__track" cx="24" cy="24" r="20" />
		<circle class="ren-loading__arc" cx="24" cy="24" r="20" />
	</svg>

	{#if text || children}
		<span class="ren-loading__text">
			{#if children}{@render children()}{:else}{text}{/if}
		</span>
	{/if}
</div>

<style>
	.ren-loading {
		--loading-size: var(--ren-space-3xl);
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ren-space-md);
		color: var(--ren-control-accent);
	}

	/* Geometry in viewBox units (circumference ≈ 126), so stroke and dashes
	   scale with the size. */
	.ren-loading__indicator {
		inline-size: var(--loading-size);
		block-size: var(--loading-size);
		fill: none;
		stroke-width: 4;
		stroke-linecap: round;
		animation: ren-spin calc(var(--ren-duration-spin) * 2) linear infinite;
	}

	.ren-loading__track {
		stroke: var(--ren-tone-soft);
	}

	.ren-loading__arc {
		stroke: currentColor;
		stroke-dasharray: 60 200;
		animation: ren-loading-arc var(--ren-duration-shimmer)
			var(--ren-easing-in-out) infinite;
	}

	.ren-loading__text {
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-medium);
		color: var(--ren-color-text-muted);
		text-align: center;
		line-height: var(--ren-line-height-normal);
	}

	.ren-loading--sm {
		--loading-size: var(--ren-space-xxl);
		gap: var(--ren-space-sm);
	}

	.ren-loading--lg {
		--loading-size: var(--ren-space-4xl);
		gap: var(--ren-space-lg);
	}

	@keyframes ren-loading-arc {
		0% {
			stroke-dasharray: 1 200;
			stroke-dashoffset: 0;
		}

		50% {
			stroke-dasharray: 90 200;
			stroke-dashoffset: -35;
		}

		100% {
			stroke-dasharray: 90 200;
			stroke-dashoffset: -124;
		}
	}
</style>
