<script lang="ts">
	import { Icon } from '../Icon';
	import type { ListHeaderProps } from './types';

	const { title, icon, actions, class: className }: ListHeaderProps = $props();
</script>

<li class={['ren-list-header', className]}>
	{#if icon}<Icon {icon} size="sm" />{/if}
	<span class="ren-list-header__title">{title}</span>
	{#if actions}
		<span class="ren-list-header__actions">{@render actions()}</span>
	{/if}
</li>

<style>
	.ren-list-header {
		display: flex;
		align-items: center;
		gap: var(--ren-space-sm);
		margin-block-end: var(--ren-space-2xs);
		padding: var(--ren-space-xs) var(--ren-space-sm);
		border-block-end: var(--ren-border-width-thin) solid
			var(--ren-color-border-light);
		color: var(--ren-control-accent, var(--ren-color-text-muted));
	}

	.ren-list-header__title {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		font-size: var(--ren-font-size-xs);
		font-weight: var(--ren-font-weight-semibold);
		letter-spacing: var(--ren-letter-spacing-wide);
		line-height: var(--ren-line-height-tight);
		text-overflow: ellipsis;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.ren-list-header__actions {
		display: inline-flex;
		align-items: center;
		gap: var(--ren-space-xs);
	}
</style>
