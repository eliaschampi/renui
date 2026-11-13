<script lang="ts">
	import { IconBadge } from '../IconBadge';
	import type { InfoItemProps } from './types';

	const {
		layout = 'horizontal',
		icon,
		iconColor = 'primary',
		label = '',
		value = '',
		class: className,
		children
	}: InfoItemProps = $props();
</script>

<div class={['ren-info-item', `ren-info-item--${layout}`, className]}>
	{#if icon}
		<IconBadge {icon} color={iconColor} class="ren-info-item__icon" />
	{/if}

	<dl class="ren-info-item__content">
		<dt class="ren-info-item__label">{label}</dt>
		<dd class="ren-info-item__value">
			{#if children}{@render children()}{:else}{value}{/if}
		</dd>
	</dl>
</div>

<style>
	.ren-info-item {
		--info-shell-bg: var(--ren-color-control-fill);
		--info-shell-border: var(--ren-color-border);
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		gap: var(--ren-space-sm);
		min-width: 0;
		padding: var(--ren-space-sm) var(--ren-space-md);
		border: var(--ren-border-width-thin) solid var(--info-shell-border);
		border-radius: var(--ren-radius-panel);
		background: var(--info-shell-bg);
	}

	.ren-info-item--horizontal:has(> :global(.ren-info-item__icon)) {
		grid-template-columns: auto minmax(0, 1fr);
	}

	.ren-info-item--vertical {
		align-items: start;
	}

	.ren-info-item--vertical > :global(.ren-info-item__icon) {
		margin-block-end: var(--ren-space-2xs);
	}

	.ren-info-item__content {
		display: grid;
		gap: var(--ren-space-2xs);
		min-width: 0;
	}

	.ren-info-item__label {
		font-size: var(--ren-font-size-xs);
		font-weight: var(--ren-font-weight-semibold);
		color: var(--ren-color-text-muted);
		line-height: var(--ren-line-height-normal);
		letter-spacing: var(--ren-letter-spacing-wide);
		text-transform: uppercase;
	}

	.ren-info-item__value {
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-semibold);
		color: var(--ren-color-text);
		line-height: var(--ren-line-height-snug);
		min-width: 0;
		overflow-wrap: break-word;
	}

	.ren-info-item__value :global(*) {
		min-width: 0;
		overflow-wrap: break-word;
	}
</style>
