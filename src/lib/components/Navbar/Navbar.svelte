<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { sidebarToggle: en.sidebarToggle };
</script>

<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import { Button } from '../Button';
	import { useRenLocale } from '../../i18n';
	import type { NavbarProps } from './types';

	const {
		class: className,
		ontogglesidebar,
		title,
		actions,
		user
	}: NavbarProps = $props();

	const i18n = useRenLocale(COPY);
</script>

<nav class={['ren-navbar', className]}>
	<div class="ren-navbar__left">
		{#if ontogglesidebar}
			<Button
				variant="ghost"
				icon={Menu}
				aria-label={i18n.t.sidebarToggle}
				onclick={ontogglesidebar}
			/>
		{/if}
		{#if title}
			<div class="ren-navbar__title">{@render title()}</div>
		{/if}
	</div>

	<div class="ren-navbar__right">
		{#if actions}
			{@render actions()}
		{:else if user}
			<div class="ren-navbar__actions">{@render user()}</div>
		{/if}
	</div>
</nav>

<style>
	.ren-navbar {
		--ren-surface-radius-local: var(--ren-layout-floating-radius);
		grid-area: navbar;
		position: sticky;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: var(--ren-navbar-height);
		width: 100%;
		min-width: 0;
		padding: 0 var(--ren-space-lg);
		z-index: var(--ren-z-fixed);
		transition: var(--ren-transition-colors);
	}

	.ren-navbar__left {
		display: flex;
		align-items: center;
		gap: var(--ren-space-md);
	}

	.ren-navbar__title {
		color: var(--ren-color-text);
		font-size: var(--ren-font-size-lg);
		font-weight: var(--ren-font-weight-bold);
		white-space: nowrap;
	}

	.ren-navbar__right {
		display: flex;
		align-items: center;
		gap: var(--ren-space-md);
	}

	.ren-navbar__actions {
		display: flex;
		align-items: center;
		gap: var(--ren-space-xs);
	}

	/* Responsive adjustments */
	@media (max-width: 64rem) {
		.ren-navbar {
			--ren-surface-radius-local: var(--ren-layout-floating-radius-tablet);
		}
	}

	@media (max-width: 48rem) {
		.ren-navbar {
			padding: 0 var(--ren-space-md);
			--ren-surface-radius-local: var(--ren-layout-floating-radius-mobile);
		}

		.ren-navbar__title {
			display: none;
		}
	}
</style>
