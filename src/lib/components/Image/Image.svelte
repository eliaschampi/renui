<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { imageError: en.imageError };
</script>

<script lang="ts">
	import '../../styles/skeleton.css';
	import { useRenLocale } from '../../i18n';
	import type { ImageProps } from './types';

	const {
		src,
		alt = '',
		width,
		height,
		srcset,
		sizes,
		ratio,
		fit = 'cover',
		radius = 'lg',
		loading = 'lazy',
		fetchpriority,
		zoom = false,
		errorLabel,
		class: className,
		onload,
		onerror
	}: ImageProps = $props();

	const i18n = useRenLocale(COPY);

	// Keyed by URL so a new `src` starts fresh without an effect. The image is
	// never hidden while loading: server-rendered pixels paint before hydration.
	let loadedSrc = $state('');
	let failedSrc = $state('');
</script>

<div
	class={[
		'ren-image',
		ratio && 'ren-image--ratio',
		fit === 'contain' && 'ren-image--contain',
		zoom && 'ren-image--zoom',
		loadedSrc !== src && failedSrc !== src && 'ren-skeleton',
		className
	]}
	style:--ren-image-radius={radius === 'lg'
		? undefined
		: radius === 'none'
			? '0'
			: `var(--ren-radius-${radius})`}
	style:aspect-ratio={ratio ??
		(width && height ? `${width} / ${height}` : undefined)}
	style:inline-size={width && !ratio ? `${width}px` : undefined}
	style:block-size={height && !width && !ratio ? `${height}px` : undefined}
>
	{#if failedSrc === src}
		<div
			class="ren-image__error"
			role={alt ? 'img' : undefined}
			aria-label={alt || undefined}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<circle cx="9" cy="9" r="2" />
				<path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
				<path d="m3 3 18 18" />
			</svg>
			<span>{errorLabel ?? i18n.t.imageError}</span>
		</div>
	{:else}
		<img
			{src}
			{alt}
			{srcset}
			{sizes}
			{width}
			{height}
			{loading}
			{fetchpriority}
			decoding="async"
			onload={(event) => {
				loadedSrc = src;
				onload?.(event);
			}}
			onerror={(event) => {
				failedSrc = src;
				onerror?.(event);
			}}
		/>
	{/if}
</div>

<style>
	/* The frame shows the shared skeleton until the image reports load; the
	   background only applies once loaded (letterboxing for `contain`). */
	.ren-image {
		position: relative;
		display: inline-block;
		max-inline-size: 100%;
		overflow: hidden;
		border-radius: var(--ren-image-radius, var(--ren-radius-lg));
	}

	.ren-image:not(.ren-skeleton) {
		background: var(--ren-color-background-secondary);
	}

	.ren-image--ratio {
		display: block;
		inline-size: 100%;
	}

	img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		transition: transform var(--ren-duration-slow) var(--ren-easing-default);
	}

	.ren-image--contain img {
		object-fit: contain;
	}

	.ren-image--zoom:hover img {
		transform: scale(var(--ren-interactive-zoom-scale));
	}

	.ren-image__error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ren-space-xs);
		block-size: 100%;
		min-block-size: var(--ren-space-4xl);
		padding: var(--ren-space-md);
		color: var(--ren-color-text-muted);
		font-size: var(--ren-font-size-xs);
		text-align: center;
	}

	.ren-image__error svg {
		inline-size: var(--ren-icon-lg);
		block-size: var(--ren-icon-lg);
	}
</style>
