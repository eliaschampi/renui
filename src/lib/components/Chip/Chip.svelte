<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { chipRemove: en.chipRemove };
</script>

<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { Icon } from '../Icon';
	import { useRenLocale } from '../../i18n';
	import type { ChipProps } from './types';

	const {
		color = 'primary',
		size = 'md',
		icon,
		closable = false,
		class: className,
		children,
		closeLabel,
		onclose,
		onclick
	}: ChipProps = $props();

	const i18n = useRenLocale(COPY);
	const iconSize = $derived(size === 'sm' ? 'xs' : 'sm');
</script>

{#snippet content()}
	{#if icon}<Icon {icon} size={iconSize} />{/if}
	<span class="ren-chip__text">{@render children?.()}</span>
{/snippet}

<!-- The action and the remove control are siblings, never nested. -->
<span
	class={[
		'ren-chip',
		`ren-tone ren-tone--${color}`,
		size === 'sm' && 'ren-chip--sm',
		onclick && 'ren-chip--interactive',
		className
	]}
>
	{#if onclick}
		<button type="button" class="ren-chip__action" {onclick}>
			{@render content()}
		</button>
	{:else}
		{@render content()}
	{/if}

	{#if closable}
		<button
			type="button"
			class="ren-chip__close"
			aria-label={closeLabel ?? i18n.t.chipRemove}
			onclick={(event) => {
				event.stopPropagation();
				onclose?.(event);
			}}
		>
			<X aria-hidden="true" />
		</button>
	{/if}
</span>

<style>
	.ren-chip__close :global(svg) {
		inline-size: var(--ren-chip-close-icon);
		block-size: var(--ren-chip-close-icon);
	}

	.ren-chip {
		--ren-chip-padding-block: var(--ren-space-xs);
		--ren-chip-padding-inline: var(--ren-space-sm);
		--ren-chip-gap: var(--ren-space-xs);
		--ren-chip-font-size: var(--ren-font-size-sm);
		--ren-chip-min-height: var(--ren-control-height-sm);
		--ren-chip-close-size: var(--ren-space-md);
		--ren-chip-close-icon: var(--ren-icon-sm);
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		gap: var(--ren-chip-gap);
		inline-size: fit-content;
		max-inline-size: 100%;
		min-height: var(--ren-chip-min-height);
		padding: var(--ren-chip-padding-block) var(--ren-chip-padding-inline);
		border-radius: var(--ren-radius-full);
		font-size: var(--ren-chip-font-size);
		font-weight: var(--ren-font-weight-medium);
		line-height: var(--ren-line-height-tight);
		transition: var(--ren-transition-interactive);
		white-space: nowrap;
		cursor: default;
		user-select: none;
		background: var(--ren-tone-soft);
		color: var(--ren-tone-ink);
	}

	/* Size variants */
	.ren-chip--sm {
		--ren-chip-padding-block: var(--ren-space-2xs);
		--ren-chip-padding-inline: var(--ren-space-xs);
		--ren-chip-gap: var(--ren-space-2xs);
		--ren-chip-font-size: var(--ren-font-size-xs);
		--ren-chip-min-height: var(--ren-control-height-xs);
		--ren-chip-close-size: var(--ren-space-sm);
		--ren-chip-close-icon: var(--ren-icon-xs);
	}

	.ren-chip__action {
		display: inline-flex;
		align-items: center;
		gap: var(--ren-chip-gap);
		min-width: 0;
		padding: 0;
		background: transparent;
		border: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.ren-chip__text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ren-chip__close {
		display: inline-grid;
		place-items: center;
		width: var(--ren-chip-close-size);
		height: var(--ren-chip-close-size);
		padding: 0;
		margin-inline-start: var(--ren-space-2xs);
		background: transparent;
		border: none;
		border-radius: var(--ren-radius-full);
		color: currentColor;
		cursor: pointer;
		transition: var(--ren-transition-control);
		flex-shrink: 0;
	}

	.ren-chip__close:hover {
		background: color-mix(in srgb, currentColor 15%, transparent);
	}

	.ren-chip__close:focus-visible,
	.ren-chip__action:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
		border-radius: var(--ren-radius-full);
	}

	.ren-chip--interactive:active {
		transform: scale(var(--ren-interactive-press-scale));
	}

	.ren-chip--interactive:hover {
		background: var(--ren-tone-strong);
	}
</style>
