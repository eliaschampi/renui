<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { emptyTitle: en.emptyTitle };
</script>

<script lang="ts">
	import Inbox from '@lucide/svelte/icons/inbox';
	import { Icon } from '../Icon';
	import { useRenLocale } from '../../i18n';
	import type { EmptyStateProps } from './types';

	const {
		title,
		description = '',
		image = '',
		icon = Inbox,
		iconColor = 'muted',
		class: className,
		visual,
		actions
	}: EmptyStateProps = $props();

	const i18n = useRenLocale(COPY);
</script>

<div class={['ren-empty-state', className]}>
	{#if visual}
		{@render visual()}
	{:else if image}
		<img
			src={image}
			alt=""
			class="ren-empty-state__image"
			loading="lazy"
			decoding="async"
		/>
	{:else}
		<span class="ren-empty-state__icon" aria-hidden="true">
			<Icon {icon} size="xl" color={iconColor} />
		</span>
	{/if}

	<div class="ren-empty-state__content">
		<p class="ren-empty-state__title">{title ?? i18n.t.emptyTitle}</p>
		{#if description}
			<p class="ren-empty-state__description">{description}</p>
		{/if}
		{#if actions}
			<div class="ren-empty-state__actions">{@render actions()}</div>
		{/if}
	</div>
</div>

<style>
	.ren-empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ren-space-lg);
		padding: var(--ren-space-2xl);
		text-align: center;
		line-height: var(--ren-line-height-normal);
	}

	/* A quiet round well keeps the glyph calm on any surface. */
	.ren-empty-state__icon {
		display: grid;
		place-items: center;
		inline-size: var(--ren-space-4xl);
		block-size: var(--ren-space-4xl);
		border: var(--ren-border-width-thin) solid var(--ren-color-border-light);
		border-radius: var(--ren-radius-full);
		background: color-mix(in srgb, var(--ren-color-text) 4%, transparent);
	}

	.ren-empty-state__image {
		inline-size: calc(var(--ren-space-4xl) * 2);
		max-inline-size: 100%;
		block-size: auto;
		object-fit: contain;
	}

	.ren-empty-state__content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--ren-space-sm);
		max-inline-size: var(--ren-max-width-sm);
	}

	.ren-empty-state__title {
		color: var(--ren-color-text);
		font-size: var(--ren-font-size-lg);
		font-weight: var(--ren-font-weight-semibold);
		line-height: var(--ren-line-height-tight);
	}

	.ren-empty-state__description {
		color: var(--ren-color-text-muted);
		font-size: var(--ren-font-size-sm);
	}

	.ren-empty-state__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--ren-space-sm);
		margin-block-start: var(--ren-space-sm);
	}
</style>
