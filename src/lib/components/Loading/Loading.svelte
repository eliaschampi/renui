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
	<span class="ren-loading__indicator" aria-hidden="true">
		<span class="ren-spinner ren-loading__ring"></span>
		<span class="ren-loading__core"></span>
	</span>

	{#if text || children}
		<span class="ren-loading__text">
			{#if children}{@render children()}{:else}{text}{/if}
		</span>
	{/if}
</div>

<style>
	.ren-loading {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ren-space-md);
		color: var(--ren-control-accent);
		--loading-ring-size: var(--ren-space-3xl);
		--loading-core-size: var(--ren-space-lg);
	}

	.ren-loading__indicator {
		position: relative;
		display: grid;
		place-items: center;
		inline-size: var(--loading-ring-size);
		block-size: var(--loading-ring-size);
	}

	.ren-loading__ring {
		position: absolute;
		inset: 0;
		--ren-spinner-size: 100%;
	}

	.ren-loading__core {
		inline-size: var(--loading-core-size);
		block-size: var(--loading-core-size);
		border-radius: var(--ren-radius-full);
		background: currentColor;
		box-shadow: 0 0 var(--ren-space-md)
			color-mix(in srgb, currentColor 35%, transparent);
		animation: ren-loading-pulse var(--ren-duration-shimmer)
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
		--loading-ring-size: var(--ren-space-xxl);
		--loading-core-size: var(--ren-space-sm);
		gap: var(--ren-space-sm);
	}

	.ren-loading--lg {
		--loading-ring-size: var(--ren-space-4xl);
		--loading-core-size: var(--ren-space-xl);
		gap: var(--ren-space-lg);
	}

	@keyframes ren-loading-pulse {
		0%,
		100% {
			transform: scale(0.78);
			opacity: 0.65;
		}

		50% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
