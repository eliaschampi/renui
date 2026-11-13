<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { sidebar: en.sidebar };
</script>

<script lang="ts">
	import { useRenLocale } from '../../i18n';
	import type { SidebarProps } from './types';

	const {
		collapsed = false,
		mobileOpen = false,
		'aria-label': ariaLabel,
		class: className,
		children,
		header
	}: SidebarProps = $props();

	const i18n = useRenLocale(COPY);
</script>

<nav
	class={[
		'ren-sidebar',
		collapsed && 'ren-sidebar--collapsed',
		mobileOpen && 'ren-sidebar--mobile-open',
		className
	]}
	aria-label={ariaLabel ?? i18n.t.sidebar}
>
	{#if header}
		<header class="ren-sidebar__header">
			<div class="ren-sidebar__header-content">{@render header()}</div>
		</header>
	{/if}

	<div class="ren-sidebar__body ren-scrollbar">
		<div class="ren-sidebar__items">{@render children?.()}</div>
	</div>
</nav>

<style>
	.ren-sidebar {
		--ren-surface-radius-local: var(--ren-layout-floating-radius);
		grid-area: sidebar;
		position: sticky;
		top: 0;
		align-self: start;
		display: flex;
		flex-direction: column;
		width: var(--ren-sidebar-width);
		height: calc(
			100dvh - max(var(--ren-layout-shell-padding), var(--ren-safe-area-top)) -
				max(var(--ren-layout-shell-padding), var(--ren-safe-area-bottom))
		);
		margin: 0;
		transition:
			width var(--ren-duration-base) var(--ren-easing-default),
			transform var(--ren-duration-base) var(--ren-easing-default),
			box-shadow var(--ren-duration-base) var(--ren-easing-default),
			visibility 0s linear var(--ren-duration-base);
		overflow: hidden;
		z-index: var(--ren-z-sidebar);
	}

	.ren-sidebar--collapsed {
		width: var(--ren-sidebar-width-collapsed);
	}

	.ren-sidebar__header {
		position: relative;
		padding: var(--ren-space-md);
		flex-shrink: 0;
		min-height: calc(var(--ren-space-5xl) + var(--ren-space-3xl));
		display: flex;
		align-items: flex-end;
		background: var(--ren-color-primary-bg);
		background-size: cover;
		background-position: center;
		border-bottom: var(--ren-border-width-thin) solid var(--ren-color-border);
	}

	.ren-sidebar__header-content {
		position: relative;
		z-index: 1;
		width: 100%;
	}

	.ren-sidebar--collapsed .ren-sidebar__header {
		min-height: var(--ren-sidebar-width-collapsed);
		padding: var(--ren-space-sm);
		align-items: center;
	}

	.ren-sidebar__body {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--ren-space-md);
	}

	.ren-sidebar__items {
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-xs);
	}

	:global(.ren-sidebar-subitems) {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-2xs);
		margin: calc(var(--ren-space-2xs) * -1) 0 var(--ren-space-xs)
			var(--ren-sidebar-subitem-indent);
		padding-left: var(--ren-space-sm);
	}

	:global(.ren-sidebar-subitems)::before {
		content: '';
		position: absolute;
		inset-block: var(--ren-space-2xs);
		left: 0;
		width: var(--ren-border-width-thin);
		border-radius: var(--ren-radius-full);
		background: linear-gradient(
			145deg,
			color-mix(in srgb, var(--ren-color-primary) 16%, transparent),
			color-mix(in srgb, var(--ren-color-primary) 4%, transparent)
		);
	}

	/* Mobile responsive behavior */
	@media (max-width: 64rem) {
		.ren-sidebar {
			position: fixed;
			top: max(var(--ren-sidebar-mobile-offset), var(--ren-safe-area-top));
			left: max(var(--ren-sidebar-mobile-offset), var(--ren-safe-area-left));
			height: min(
				var(--ren-sidebar-mobile-height),
				calc(
					100dvh -
						max(var(--ren-sidebar-mobile-offset), var(--ren-safe-area-top)) -
						max(var(--ren-sidebar-mobile-offset), var(--ren-safe-area-bottom))
				)
			);
			transform: translateX(
				min(
					var(--ren-sidebar-mobile-closed-shift),
					calc(-100% - var(--ren-safe-area-left))
				)
			);
			width: min(
				var(--ren-sidebar-mobile-width),
				calc(
					100vw -
						max(var(--ren-sidebar-mobile-offset), var(--ren-safe-area-left)) -
						max(var(--ren-sidebar-mobile-offset), var(--ren-safe-area-right))
				)
			);
			visibility: hidden;
			--ren-surface-radius-local: var(--ren-layout-floating-radius-tablet);
			--ren-surface-shadow: var(--ren-shadow-lg);
		}

		.ren-sidebar.ren-sidebar--mobile-open {
			transform: translateX(0);
			visibility: visible;
			transition-delay: 0s;
		}
	}

	@media (max-width: 48rem) {
		.ren-sidebar {
			--ren-sidebar-mobile-offset: var(--ren-layout-shell-padding-mobile);
			--ren-sidebar-mobile-height: calc(
				100dvh - (var(--ren-sidebar-mobile-offset) * 2)
			);
			--ren-sidebar-mobile-width: min(
				var(--ren-sidebar-width-mobile),
				calc(100vw - (var(--ren-sidebar-mobile-offset) * 2))
			);
			--ren-sidebar-mobile-closed-shift: calc(
				-100% - var(--ren-sidebar-mobile-offset)
			);
			--ren-surface-radius-local: var(--ren-layout-floating-radius-mobile);
		}
	}
</style>
