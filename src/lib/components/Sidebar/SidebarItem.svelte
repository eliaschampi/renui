<script lang="ts">
	import type { SidebarItemProps } from './types';

	const {
		current = false,
		collapsed = false,
		href,
		level = 'root',
		expanded,
		class: className,
		onclick,
		children,
		icon,
		...rest
	}: SidebarItemProps = $props();

	const classes = $derived([
		'ren-sidebar-item ren-tone',
		level === 'sub' && 'ren-sidebar-item--sub',
		current && 'ren-sidebar-item--active',
		collapsed && 'ren-sidebar-item--collapsed',
		className
	]);
</script>

{#snippet content()}
	{#if icon}
		<span class="ren-sidebar-item__icon">{@render icon()}</span>
	{/if}
	<!-- Collapsed rails keep the label for assistive tech. -->
	<span class={collapsed ? 'ren-sr-only' : 'ren-sidebar-item__text'}>
		{@render children?.()}
	</span>
{/snippet}

{#if href}
	<a
		{...rest}
		{href}
		class={classes}
		aria-current={current ? 'page' : undefined}
		{onclick}
	>
		{@render content()}
	</a>
{:else}
	<!-- `aria-expanded` precedes the spread: a menu trigger supplies its own. -->
	<button
		type="button"
		aria-expanded={expanded}
		{...rest}
		class={classes}
		aria-current={current || undefined}
		{onclick}
	>
		{@render content()}
	</button>
{/if}

<style>
	.ren-sidebar-item {
		font: inherit;
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-medium);
		letter-spacing: normal;
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--ren-space-md);
		padding: var(--ren-space-sm) var(--ren-space-md);
		min-height: var(--ren-sidebar-item-height);
		border-radius: var(--ren-radius-control);
		color: var(--ren-color-text-muted);
		text-decoration: none;
		background: transparent;
		border: 0;
		cursor: pointer;
		text-align: start;
		transition: var(--ren-transition-control);
		width: 100%;
	}

	.ren-sidebar-item--sub {
		gap: var(--ren-space-sm);
		min-height: var(--ren-sidebar-subitem-height);
		padding: var(--ren-space-xs) var(--ren-space-sm);
	}

	/* Neutral wash on hover; the current page settles into the soft tone. */
	.ren-sidebar-item:hover,
	.ren-sidebar-item:focus-visible {
		color: var(--ren-color-text);
		background: var(--ren-color-hover);
	}

	.ren-sidebar-item:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
	}

	.ren-sidebar-item.ren-sidebar-item--active {
		color: var(--ren-tone-ink);
		font-weight: var(--ren-font-weight-semibold);
		background: var(--ren-tone-soft);
	}

	.ren-sidebar-item__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: var(--ren-icon-md);
		height: var(--ren-icon-md);
	}

	.ren-sidebar-item--sub .ren-sidebar-item__icon {
		width: var(--ren-sidebar-subitem-icon-size);
		height: var(--ren-sidebar-subitem-icon-size);
		opacity: var(--ren-sidebar-subitem-icon-opacity);
	}

	.ren-sidebar-item__text {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: var(--ren-line-height-normal);
	}

	.ren-sidebar-item :global(.ren-sidebar-nav-label) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ren-space-xs);
		width: 100%;
		min-width: 0;
	}

	.ren-sidebar-item :global(.ren-sidebar-nav-label > span) {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ren-sidebar-item--collapsed {
		justify-content: center;
		padding-left: var(--ren-space-sm);
		padding-right: var(--ren-space-sm);
	}

	/* A compact group trigger (`aria-expanded`) keeps the current wash without
	   the link-ink icon of a leaf destination. */
	.ren-sidebar-item--collapsed.ren-sidebar-item--active[aria-expanded]
		.ren-sidebar-item__icon {
		color: var(--ren-color-text);
	}
</style>
