<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { pageActions: en.pageActions };
</script>

<script lang="ts">
	import { Title } from '../Title';
	import { useRenLocale } from '../../i18n';
	import type { PageHeaderProps } from './types';

	const {
		size = 'lg',
		level = 1,
		class: className,
		actions,
		...titleProps
	}: PageHeaderProps = $props();

	const i18n = useRenLocale(COPY);
</script>

<header class={['ren-page-header', className]}>
	<div class="ren-page-header__title">
		<Title {...titleProps} {size} {level} />
	</div>

	{#if actions}
		<div
			class="ren-page-header__actions"
			role="group"
			aria-label={i18n.t.pageActions}
		>
			{@render actions()}
		</div>
	{/if}
</header>

<style>
	.ren-page-header {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--ren-space-md);
		padding: var(--ren-space-lg);
		border-radius: var(--ren-surface-radius);
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		background: var(--ren-color-surface-card);
		box-shadow: var(--ren-shadow-sm);
		overflow: hidden;
		isolation: isolate;
	}

	.ren-page-header__title {
		position: relative;
		z-index: var(--ren-z-base);
		min-width: 0;
	}

	.ren-page-header__actions {
		position: relative;
		z-index: var(--ren-z-base);
		display: flex;
		align-items: center;
		gap: var(--ren-space-sm);
		flex-shrink: 0;
		flex-wrap: wrap;
	}

	@media (max-width: 48rem) {
		.ren-page-header {
			padding: var(--ren-space-md);
			border-radius: var(--ren-radius-panel);
			grid-template-columns: 1fr;
		}

		.ren-page-header__actions {
			width: 100%;
			justify-content: flex-end;
			gap: var(--ren-space-xs);
		}
	}
</style>
