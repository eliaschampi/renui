<script lang="ts">
	import Icon from '../Icon/Icon.svelte';
	import type { ButtonProps } from './types';

	const {
		variant = 'filled',
		color = 'primary',
		size = 'md',
		icon,
		iconAfter = false,
		loading = false,
		disabled = false,
		pressed,
		type = 'button',
		href,
		target,
		rel,
		download,
		summary = false,
		class: className,
		style,
		children,
		...rest
	}: ButtonProps = $props();

	const inert = $derived(disabled || loading);
	const classes = $derived([
		'ren-button',
		`ren-button--${variant}`,
		`ren-button--${size}`,
		`ren-tone ren-tone--${color}`,
		icon && !children && 'ren-button--icon-only',
		loading && 'ren-button--loading',
		className
	]);
</script>

{#snippet content()}
	{#if loading}
		<span class="ren-spinner ren-button__spinner" aria-hidden="true"></span>
	{/if}
	{#if icon && !iconAfter && !loading}
		<Icon {icon} size="var(--btn-icon)" />
	{/if}
	{#if children}
		<span class="ren-button__text">{@render children()}</span>
	{/if}
	{#if icon && iconAfter && !loading}
		<Icon {icon} size="var(--btn-icon)" />
	{/if}
{/snippet}

{#if href !== undefined}
	<a
		{...rest}
		class={classes}
		href={inert ? undefined : href}
		target={inert ? undefined : target}
		rel={inert ? undefined : rel}
		download={inert ? undefined : download}
		role={inert ? 'link' : undefined}
		aria-disabled={inert || undefined}
		aria-busy={loading || undefined}
		{style}
	>
		{@render content()}
	</a>
{:else if summary}
	<summary {...rest} class={classes} aria-busy={loading || undefined} {style}>
		{@render content()}
	</summary>
{:else}
	<button
		{...rest}
		class={classes}
		{type}
		disabled={inert}
		aria-pressed={pressed}
		aria-busy={loading || undefined}
		{style}
	>
		{@render content()}
	</button>
{/if}

<style>
	/* Semantic actions with restrained tactile depth. Disabled and loading
	   controls drop pointer events, so hover/active rules need no guards. */
	.ren-button {
		--btn-icon: 1.2em;
		--btn-lift: 0;
		--btn-shade: var(--ren-color-black);
		--btn-sheen: inset 0 var(--ren-border-width-thin) 0
			color-mix(in srgb, var(--ren-color-white) 26%, transparent);
		--btn-glow: 0 var(--ren-space-xs) var(--ren-space-lg)
			calc(var(--ren-space-xs) * -1)
			color-mix(in oklch, var(--ren-control-solid) 34%, transparent);
		--btn-glow-hover: 0 var(--ren-space-sm) var(--ren-space-xl)
			calc(var(--ren-space-xs) * -1)
			color-mix(in oklch, var(--ren-control-solid) 42%, transparent);
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--ren-space-xs);
		font-family: var(--ren-font-family-sans);
		font-weight: var(--ren-font-weight-semibold);
		line-height: var(--ren-line-height-none);
		letter-spacing: var(--ren-letter-spacing-wide);
		text-decoration: none;
		white-space: nowrap;
		border: var(--ren-border-width-base) solid transparent;
		border-radius: var(--ren-radius-control);
		outline: var(--ren-border-width-thick) solid transparent;
		cursor: pointer;
		user-select: none;
		isolation: isolate;
		transition: var(--ren-transition-interactive);
	}

	.ren-button:is(:disabled, [aria-disabled='true']) {
		pointer-events: none;
	}

	.ren-button:is(:disabled, [aria-disabled='true']):not(.ren-button--loading) {
		opacity: var(--ren-opacity-disabled);
	}

	.ren-button:hover {
		transform: translateY(var(--btn-lift));
	}

	.ren-button:active {
		transform: scale(var(--ren-interactive-press-scale));
	}

	/* Sizes */
	.ren-button--sm {
		height: var(--ren-control-height-sm);
		padding: 0 var(--ren-space-md);
		font-size: var(--ren-font-size-xs);
	}

	.ren-button--md {
		height: var(--ren-control-height-md);
		padding: 0 var(--ren-space-lg);
		font-size: var(--ren-font-size-sm);
	}

	.ren-button--lg {
		--btn-icon: 1.4em;
		height: var(--ren-control-height-lg);
		padding: 0 var(--ren-space-xl);
		font-size: var(--ren-font-size-base);
	}

	.ren-button--xl {
		--btn-icon: 1.4em;
		height: var(--ren-control-height-xl);
		padding: 0 var(--ren-space-xxl);
		font-size: var(--ren-font-size-lg);
	}

	/* Square from the size height. */
	.ren-button--icon-only {
		padding: 0;
		aspect-ratio: 1;
	}

	/* Solid fills: filled + gradient pair solid with its foreground. */
	.ren-button--filled,
	.ren-button--gradient {
		--btn-lift: var(--ren-interactive-lift);
		color: var(--ren-control-foreground);
		background: var(--ren-control-solid);
		box-shadow: var(--btn-sheen), var(--btn-glow), var(--ren-shadow-sm);
	}

	.ren-button--filled:hover {
		background: color-mix(
			in srgb,
			var(--ren-control-solid) 90%,
			var(--btn-shade)
		);
	}

	.ren-button--filled:hover,
	.ren-button--gradient:hover {
		box-shadow: var(--btn-sheen), var(--btn-glow-hover), var(--ren-shadow-md);
	}

	.ren-button--filled:active,
	.ren-button--gradient:active {
		box-shadow: var(--ren-shadow-sm);
	}

	/* The beam, cut diagonally and kept deep enough for its foreground. */
	.ren-button--gradient {
		--ren-beam-angle: 135deg;
		--ren-beam-sun: 4%;
		background: var(--ren-tone-beam);
	}

	/* Hover shades away from the paired foreground when supported. */
	@supports (color: contrast-color(red)) {
		.ren-button {
			--btn-shade: contrast-color(var(--ren-control-foreground));
		}
	}

	/* Quiet variants live on the tone roles: accent on a neutral surface, ink
	   on a soft one; hover and press step soft → strong. */
	.ren-button--border {
		color: var(--ren-control-accent);
		background: var(--ren-color-surface);
		border-color: color-mix(
			in srgb,
			var(--ren-control-accent) 34%,
			var(--ren-color-border)
		);
	}

	.ren-button--flat {
		color: var(--ren-tone-ink);
		background: var(--ren-tone-soft);
	}

	.ren-button--ghost {
		color: var(--ren-control-accent);
		background: transparent;
	}

	.ren-button--border:hover,
	.ren-button--ghost:hover {
		color: var(--ren-tone-ink);
		background: var(--ren-tone-soft);
	}

	.ren-button--flat:hover,
	.ren-button--border:active,
	.ren-button--flat:active,
	.ren-button--ghost:active {
		background: var(--ren-tone-strong);
	}

	/* Toggle on (or an open disclosure): quiet variants settle into the strong
	   tone. */
	.ren-button[aria-pressed='true']:not(
			.ren-button--filled,
			.ren-button--gradient
		),
	:global(details[open])
		> .ren-button:not(.ren-button--filled, .ren-button--gradient) {
		color: var(--ren-tone-ink);
		background: var(--ren-tone-strong);
		border-color: transparent;
	}

	/* A disclosure toggle drops the native marker; the label carries the state. */
	summary.ren-button {
		list-style: none;
	}

	summary.ren-button::-webkit-details-marker {
		display: none;
	}

	/* Focus wins over hover and pressed fills (doubled class for weight). */
	.ren-button.ren-button:focus-visible {
		box-shadow: var(--ren-focus-ring-offset);
	}

	/* Spinner (shared recipe) centered over the hidden label. */
	.ren-button__spinner {
		--ren-spinner-size: var(--btn-icon);
		position: absolute;
	}

	.ren-button--loading .ren-button__text {
		opacity: 0;
	}

	.ren-button__text {
		display: inline-flex;
		align-items: center;
	}

	@media (forced-colors: active) {
		.ren-button:focus-visible {
			outline-color: Highlight;
		}
	}
</style>
