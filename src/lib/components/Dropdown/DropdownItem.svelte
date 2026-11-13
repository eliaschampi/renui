<script lang="ts">
	import { getContext } from 'svelte';
	import { Icon } from '../Icon';
	import type { DropdownItemProps } from './types';

	const {
		children,
		icon,
		href,
		color,
		disabled = false,
		submit = false,
		selected,
		class: className,
		onclick
	}: DropdownItemProps = $props();

	// Absent inside a `Context` menu, which closes through its own click handler.
	const closeDropdown = getContext<(() => void) | undefined>('dropdownClose');

	function handleClick(event: MouseEvent): void {
		if (disabled) {
			event.preventDefault();
			return;
		}
		onclick?.(event);
		if (event.defaultPrevented) return;
		// A submit item lets the event reach its form before the menu unmounts.
		if (submit) setTimeout(() => closeDropdown?.());
		else closeDropdown?.();
	}

	function handleLinkKeydown(event: KeyboardEvent): void {
		if (event.key !== ' ') return;
		event.preventDefault();
		if (!disabled) (event.currentTarget as HTMLAnchorElement).click();
	}
</script>

{#snippet itemContent()}
	{#if icon}<Icon {icon} size="sm" />{/if}
	<span class="ren-dropdown-item__content">{@render children?.()}</span>
{/snippet}

<svelte:element
	this={href ? 'a' : 'button'}
	{href}
	type={href ? undefined : submit ? 'submit' : 'button'}
	disabled={href ? undefined : disabled}
	class={[
		'ren-dropdown-item',
		selected && 'ren-dropdown-item--selected',
		disabled && 'ren-dropdown-item--disabled',
		color && `ren-tone ren-tone--${color}`,
		className
	]}
	role={selected === undefined ? 'menuitem' : 'menuitemradio'}
	aria-checked={selected}
	aria-disabled={disabled || undefined}
	tabindex="-1"
	onclick={handleClick}
	onkeydown={href ? handleLinkKeydown : undefined}
>
	{@render itemContent()}
</svelte:element>

<style>
	/* The one menu-item recipe, shared by DropdownItem and ContextItem. A
	   `color` sets the accent; uncolored items keep neutral icons. */
	.ren-dropdown-item {
		--ren-dropdown-item-accent: var(
			--ren-control-accent,
			var(--ren-color-primary)
		);
		display: flex;
		align-items: center;
		gap: var(--ren-space-md);
		inline-size: 100%;
		padding: var(--ren-space-sm) var(--ren-space-md);
		background: transparent;
		border: 0;
		border-radius: var(--ren-radius-control);
		color: var(--ren-color-text);
		font: inherit;
		font-size: var(--ren-font-size-sm);
		line-height: var(--ren-line-height-normal);
		text-align: start;
		text-decoration: none;
		cursor: pointer;
		user-select: none;
		transition: var(--ren-transition-interactive);
	}

	.ren-dropdown-item:hover,
	.ren-dropdown-item:focus-visible {
		background: var(--ren-color-hover);
	}

	/* Same lift and press as list rows and buttons. */
	.ren-dropdown-item:hover {
		transform: translateY(var(--ren-interactive-lift));
	}

	.ren-dropdown-item:active {
		transform: none;
	}

	.ren-dropdown-item:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
	}

	.ren-dropdown-item > :global(.ren-icon) {
		color: var(--ren-control-accent, var(--ren-color-text-muted));
	}

	.ren-dropdown-item--selected {
		color: var(--ren-dropdown-item-accent);
		font-weight: var(--ren-font-weight-semibold);
	}

	.ren-dropdown-item--selected > :global(.ren-icon),
	.ren-dropdown-item:hover > :global(.ren-icon) {
		color: inherit;
	}

	.ren-dropdown-item__content {
		display: flex;
		flex: 1;
		align-items: center;
		gap: var(--ren-space-lg);
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ren-dropdown-item--disabled {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
	}
</style>
