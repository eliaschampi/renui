<script lang="ts">
	import Image from '../Image/Image.svelte';
	import type { CardProps } from './types';

	const {
		clickable = false,
		href,
		target,
		rel,
		hoverable,
		selected,
		image,
		imageHeight,
		imageAlt,
		title,
		subtitle,
		spaced = false,
		class: className,
		style,
		'aria-label': ariaLabel,
		onclick,
		children,
		media,
		header,
		footer
	}: CardProps = $props();

	const tag = $derived(href !== undefined ? 'a' : clickable ? 'button' : 'div');
	// A button may only hold phrasing content, so its sections become spans.
	const part = $derived(tag === 'button' ? 'span' : 'div');
	const interactive = $derived(tag !== 'div');
</script>

<!-- svelte-ignore a11y_no_static_element_interactions (`onclick` only reaches the native <a> or <button> branches.) -->
<svelte:element
	this={tag}
	{href}
	target={href && target}
	rel={href && (target === '_blank' ? (rel ?? 'noopener noreferrer') : rel)}
	type={tag === 'button' ? 'button' : undefined}
	class={[
		'ren-card',
		interactive && 'ren-card--interactive',
		(hoverable ?? (interactive || media || image)) && 'ren-card--hoverable',
		selected && 'ren-card--selected',
		spaced && 'ren-card--spaced',
		className
	]}
	{style}
	style:--ren-card-image-height={imageHeight && `${imageHeight}px`}
	aria-label={ariaLabel}
	aria-current={href && selected ? 'true' : undefined}
	aria-pressed={tag === 'button' ? selected : undefined}
	onclick={interactive ? onclick : undefined}
>
	{#if media || image}
		<svelte:element this={part} class="ren-card__media">
			{#if media}
				{@render media()}
			{:else if image && part === 'span'}
				<!-- Phrasing content only inside a button card. -->
				<img
					class="ren-card__image"
					src={image}
					alt={imageAlt ?? ''}
					loading="lazy"
					decoding="async"
				/>
			{:else if image}
				<Image
					src={image}
					alt={imageAlt ?? ''}
					radius="none"
					class="ren-card__image"
				/>
			{/if}
		</svelte:element>
	{/if}

	{#if header || title || subtitle}
		<svelte:element this={part} class="ren-card__header">
			{#if header}
				{@render header()}
			{:else}
				{#if title}
					<svelte:element
						this={part === 'span' ? 'span' : 'h4'}
						class="ren-card__title">{title}</svelte:element
					>
				{/if}
				{#if subtitle}
					<svelte:element
						this={part === 'span' ? 'span' : 'p'}
						class="ren-card__subtitle">{subtitle}</svelte:element
					>
				{/if}
			{/if}
		</svelte:element>
	{/if}

	{#if children}
		<svelte:element this={part} class="ren-card__content">
			{@render children()}
		</svelte:element>
	{/if}

	{#if footer}
		<svelte:element this={part} class="ren-card__footer">
			{@render footer()}
		</svelte:element>
	{/if}
</svelte:element>

<style>
	.ren-card {
		--ren-surface-bg: var(--ren-card-surface-bg, var(--ren-color-surface-card));
		--ren-surface-shadow: var(--ren-card-surface-shadow, var(--ren-shadow-sm));
		position: relative;
		min-width: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition: var(--ren-transition-interactive);
		width: 100%;
		text-align: start;
		color: var(--ren-color-text);
		appearance: none;
		font: inherit;
		text-decoration: none;
		padding: 0;
		isolation: isolate;
	}

	.ren-card > * {
		position: relative;
		z-index: 1;
	}

	/* Interactive state */
	.ren-card--interactive {
		cursor: pointer;
		outline: var(--ren-border-width-thick) solid transparent;
	}

	.ren-card--interactive:focus-visible {
		--ren-surface-hover: 1;
		outline-color: transparent;
		border-color: var(--ren-color-border-interactive);
		box-shadow: var(--ren-focus-ring), var(--ren-shadow-md);
	}

	.ren-card--hoverable:hover {
		transform: translateY(var(--ren-interactive-lift));
		border-color: var(--ren-color-border-interactive);
		background: var(--ren-color-surface-card-hover);
		box-shadow: var(--ren-shadow-md);
	}

	@media (hover: hover) {
		.ren-card--hoverable:hover {
			--ren-surface-hover: 1;
		}
	}

	.ren-card--interactive:active {
		transform: translateY(0);
		box-shadow: var(--ren-shadow-sm);
	}

	.ren-card--selected,
	.ren-card--selected:hover {
		--ren-surface-border: var(--ren-border-width-base) solid
			var(--ren-color-primary);
		--ren-surface-shadow: var(--ren-shadow-md);
		border-color: var(--ren-color-primary);
	}

	/* Spaced content */
	.ren-card--spaced .ren-card__content {
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-md);
	}

	/* Image */
	.ren-card__media {
		width: 100%;
		height: var(--ren-card-image-height, var(--ren-card-media-height));
		overflow: hidden;
		flex-shrink: 0;
		position: relative;
		background: var(--ren-color-background-secondary);
		border-bottom: var(--ren-border-width-thin) solid var(--ren-color-border);
	}

	.ren-card__media :global(.ren-card__image) {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
	}

	.ren-card--hoverable:hover .ren-card__media :global(.ren-image img) {
		transform: scale(var(--ren-card-media-hover-scale));
	}

	/* Sections (spans inside a button card, so display is explicit) */
	.ren-card__media,
	.ren-card__content,
	.ren-card__footer,
	.ren-card__title,
	.ren-card__subtitle {
		display: block;
	}

	.ren-card__header,
	.ren-card__content,
	.ren-card__footer {
		padding: var(--ren-space-lg);
	}

	.ren-card__header {
		display: grid;
		gap: var(--ren-space-2xs);
		padding-bottom: var(--ren-space-xs);
	}

	.ren-card__header:last-child {
		padding-bottom: var(--ren-space-lg);
	}

	.ren-card__content {
		flex: 1;
		min-width: 0;
		padding-top: var(--ren-space-sm);
		padding-bottom: var(--ren-space-lg);
	}

	/* Comfortable breathing room when content leads (no header) or follows the image,
	   instead of relying on :first-child which fails whenever an image is rendered. */
	.ren-card__media + .ren-card__content,
	.ren-card__content:first-child {
		padding-top: var(--ren-space-lg);
	}

	.ren-card__footer {
		padding-top: var(--ren-space-md);
		border-top: var(--ren-border-width-thin) solid var(--ren-color-border);
	}

	/* Typography */
	.ren-card__title {
		color: var(--ren-color-text);
		line-height: var(--ren-line-height-tight);
		font-size: var(--ren-font-size-lg);
		font-weight: var(--ren-font-weight-semibold);
	}

	.ren-card__subtitle {
		color: var(--ren-color-text-muted);
		font-size: var(--ren-font-size-sm);
		line-height: var(--ren-line-height-normal);
	}

	@media (forced-colors: active) {
		.ren-card--interactive:focus-visible {
			outline-color: CanvasText;
			box-shadow: none;
		}
	}
</style>
