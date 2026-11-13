<script lang="ts">
	import { Card } from '../Card';
	import { IconBadge } from '../IconBadge';
	import { Title } from '../Title';
	import type { QuickAccessCardProps } from './types';

	const {
		title,
		description,
		icon,
		color = 'primary',
		href,
		hoverable = true,
		class: className = ''
	}: QuickAccessCardProps = $props();
</script>

<Card {href} {hoverable} class="ren-quick-access-card {className}">
	<div class="ren-quick-access-card__container">
		<IconBadge {icon} {color} size="lg" />
		<Title {title} size="md" {color} />
		<p class="ren-quick-access-card__description">{description}</p>
	</div>
</Card>

<style>
	.ren-quick-access-card__container {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--ren-space-sm);
	}

	.ren-quick-access-card__description {
		font-size: var(--ren-font-size-sm);
		color: var(--ren-color-text-muted);
	}
</style>
