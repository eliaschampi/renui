<script lang="ts">
	import { Icon } from '../Icon';
	import type { ListItemProps, ListText } from './types';

	const {
		title,
		description,
		icon,
		leading,
		trailing,
		href,
		onclick,
		selected = false,
		disabled = false,
		class: className
	}: ListItemProps = $props();

	const interactive = $derived(!disabled && Boolean(href || onclick));
</script>

{#snippet text(value: ListText)}
	{#if typeof value === 'function'}{@render value()}{:else}{value}{/if}
{/snippet}

<li
	class={[
		'ren-list-item',
		interactive && 'ren-list-item--interactive',
		selected && 'ren-list-item--selected',
		disabled && 'ren-list-item--disabled',
		className
	]}
>
	{#if leading}
		<span class="ren-list-item__leading">{@render leading()}</span>
	{:else if icon}
		<Icon {icon} size="var(--ren-list-icon-size, var(--ren-icon-sm))" />
	{/if}

	<span class="ren-list-item__content">
		<!-- The title is the single target; ::after stretches it over the row. -->
		{#if href && !disabled}
			<a
				{href}
				class="ren-list-item__title ren-list-item__target"
				aria-current={selected || undefined}
				{onclick}
			>
				{@render text(title ?? '')}
			</a>
		{:else if onclick}
			<button
				type="button"
				class="ren-list-item__title ren-list-item__target"
				aria-current={selected || undefined}
				{disabled}
				{onclick}
			>
				{@render text(title ?? '')}
			</button>
		{:else if title}
			<span class="ren-list-item__title">{@render text(title)}</span>
		{/if}
		{#if description}
			<span class="ren-list-item__description">
				{@render text(description)}
			</span>
		{/if}
	</span>

	{#if trailing}
		<span class="ren-list-item__trailing">{@render trailing()}</span>
	{/if}
</li>

<style>
	.ren-list-item {
		--ren-list-item-accent: var(--ren-control-accent, var(--ren-color-primary));
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--ren-space-md);
		min-block-size: calc(var(--ren-space-xxl) + var(--ren-space-2xs));
		padding: var(
			--ren-list-item-padding,
			var(--ren-space-sm) var(--ren-space-md)
		);
		border-radius: var(--ren-radius-control);
		color: var(--ren-color-text);
		line-height: var(--ren-line-height-normal);
		transition: var(--ren-transition-interactive);
	}

	.ren-list-item > :global(.ren-icon) {
		color: var(--ren-color-text-muted);
	}

	.ren-list-item__leading {
		display: inline-flex;
		flex-shrink: 0;
	}

	.ren-list-item__content {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: var(--ren-space-2xs);
		min-inline-size: 0;
	}

	.ren-list-item__title {
		overflow: hidden;
		color: inherit;
		font: inherit;
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-medium);
		line-height: var(--ren-line-height-tight);
		text-align: start;
		text-decoration: none;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	button.ren-list-item__title {
		padding: 0;
		background: none;
		border: 0;
		cursor: pointer;
	}

	.ren-list-item__target::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	.ren-list-item__target:focus-visible {
		outline: none;
	}

	.ren-list-item__target:focus-visible::after {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
	}

	.ren-list-item__description {
		color: var(--ren-color-text-muted);
		font-size: var(--ren-font-size-xs);
	}

	/* Above the stretched target so actions stay independently clickable. */
	.ren-list-item__trailing {
		position: relative;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: var(--ren-space-sm);
		margin-inline-start: auto;
	}

	.ren-list-item--interactive:hover {
		background: var(--ren-color-hover);
		transform: translateY(var(--ren-interactive-lift));
	}

	.ren-list-item--interactive:hover > :global(.ren-icon) {
		color: inherit;
	}

	.ren-list-item--interactive:active {
		transform: none;
	}

	.ren-list-item--selected,
	.ren-list-item--selected:hover {
		background: var(--ren-tone-soft, var(--ren-color-primary-bg));
		transform: none;
	}

	.ren-list-item--selected .ren-list-item__title {
		font-weight: var(--ren-font-weight-semibold);
	}

	.ren-list-item--selected > :global(.ren-icon) {
		color: var(--ren-list-item-accent);
	}

	.ren-list-item--disabled {
		opacity: var(--ren-opacity-disabled);
	}
</style>
