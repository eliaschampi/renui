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
		icon
	}: SidebarItemProps = $props();

	const classes = $derived([
		'lumi-sidebar-item lumi-tone',
		level === 'sub' && 'lumi-sidebar-item--sub',
		current && 'lumi-sidebar-item--active',
		collapsed && 'lumi-sidebar-item--collapsed',
		className
	]);
</script>

{#snippet content()}
	{#if icon}
		<span class="lumi-sidebar-item__icon">{@render icon()}</span>
	{/if}
	<!-- Collapsed rails keep the label for assistive tech. -->
	<span class={collapsed ? 'lumi-sr-only' : 'lumi-sidebar-item__text'}>
		{@render children?.()}
	</span>
{/snippet}

{#if href}
	<a
		{href}
		class={classes}
		aria-current={current ? 'page' : undefined}
		{onclick}
	>
		{@render content()}
	</a>
{:else}
	<button
		type="button"
		class={classes}
		aria-current={current || undefined}
		aria-expanded={expanded}
		{onclick}
	>
		{@render content()}
	</button>
{/if}

<style>
	.lumi-sidebar-item {
		font: inherit;
		font-size: var(--lumi-font-size-sm);
		font-weight: var(--lumi-font-weight-medium);
		letter-spacing: normal;
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--lumi-space-md);
		padding: var(--lumi-space-sm) var(--lumi-space-md);
		min-height: var(--lumi-sidebar-item-height);
		border-radius: var(--lumi-radius-control);
		color: var(--lumi-color-text-muted);
		text-decoration: none;
		background: transparent;
		border: 0;
		cursor: pointer;
		text-align: start;
		transition: var(--lumi-transition-control);
		width: 100%;
	}

	.lumi-sidebar-item--sub {
		gap: var(--lumi-space-sm);
		min-height: var(--lumi-sidebar-subitem-height);
		padding: var(--lumi-space-xs) var(--lumi-space-sm);
	}

	/* Neutral wash on hover; the current page settles into the soft tone. */
	.lumi-sidebar-item:hover,
	.lumi-sidebar-item:focus-visible {
		color: var(--lumi-color-text);
		background: var(--lumi-color-hover);
	}

	.lumi-sidebar-item:focus-visible {
		outline: var(--lumi-focus-outline);
		outline-offset: var(--lumi-focus-outline-offset);
	}

	.lumi-sidebar-item.lumi-sidebar-item--active {
		color: var(--lumi-tone-ink);
		font-weight: var(--lumi-font-weight-semibold);
		background: var(--lumi-tone-soft);
	}

	.lumi-sidebar-item__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: var(--lumi-icon-md);
		height: var(--lumi-icon-md);
	}

	.lumi-sidebar-item--sub .lumi-sidebar-item__icon {
		width: var(--lumi-sidebar-subitem-icon-size);
		height: var(--lumi-sidebar-subitem-icon-size);
		opacity: var(--lumi-sidebar-subitem-icon-opacity);
	}

	.lumi-sidebar-item__text {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: var(--lumi-line-height-normal);
	}

	.lumi-sidebar-item :global(.lumi-sidebar-nav-label) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--lumi-space-xs);
		width: 100%;
		min-width: 0;
	}

	.lumi-sidebar-item :global(.lumi-sidebar-nav-label > span) {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.lumi-sidebar-item--collapsed {
		justify-content: center;
		padding-left: var(--lumi-space-sm);
		padding-right: var(--lumi-space-sm);
	}
</style>
