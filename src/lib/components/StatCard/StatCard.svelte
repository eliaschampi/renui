<script lang="ts">
	import { Card } from '../Card';
	import { IconBadge } from '../IconBadge';
	import { Title } from '../Title';
	import type { StatCardProps } from './types';

	const {
		title,
		value,
		icon,
		color = 'primary',
		href,
		hoverable,
		subtitle = '',
		class: className = ''
	}: StatCardProps = $props();
</script>

<Card
	{href}
	hoverable={hoverable ?? Boolean(href)}
	class="ren-stat-card {className}"
>
	<div class="ren-stat-card__container">
		<div class="ren-stat-card__header">
			<Title {title} size="sm" {color} />
			<IconBadge {icon} {color} size="md" />
		</div>
		<div class="ren-stat-card__value">{value}</div>
		{#if subtitle}
			<div class="ren-stat-card__subtitle">{subtitle}</div>
		{/if}
	</div>
</Card>

<style>
	.ren-stat-card__container {
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-xs);
		min-height: 100%;
	}

	.ren-stat-card__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-block-end: var(--ren-space-xs);
	}

	.ren-stat-card__value {
		font-size: var(--ren-font-size-3xl);
		font-weight: var(--ren-font-weight-bold);
		font-variant-numeric: tabular-nums;
		line-height: var(--ren-line-height-tight);
		color: var(--ren-color-text);
		overflow-wrap: break-word;
	}

	.ren-stat-card__subtitle {
		font-size: var(--ren-font-size-sm);
		color: var(--ren-color-text-muted);
	}
</style>
