<script lang="ts">
	import { Icon } from '../Icon';
	import type { TitleLevel, TitleProps } from './types';

	const {
		id,
		level = 3,
		size = 'md',
		color = 'text',
		icon,
		iconColor,
		title = '',
		subtitle = '',
		class: className
	}: TitleProps = $props();

	const headingTag = $derived(`h${level}` as `h${TitleLevel}`);
</script>

<div
	class={['ren-title', `ren-title--${size}`, className]}
	style:--title-color="var(--ren-color-{color})"
	style:--title-icon-color="var(--ren-color-{iconColor ?? color})"
>
	{#if icon}
		<span class="ren-title__icon" aria-hidden="true">
			<Icon {icon} {size} />
		</span>
	{/if}

	<div class="ren-title__content">
		<svelte:element this={headingTag} {id} class="ren-title__text">
			{title}
		</svelte:element>

		{#if subtitle}
			<p class="ren-title__subtitle">{subtitle}</p>
		{/if}
	</div>
</div>

<style>
	.ren-title {
		display: flex;
		align-items: center;
		line-height: var(--ren-line-height-normal);
		gap: var(--ren-space-sm);
		color: var(--title-color);
	}

	.ren-title__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--title-icon-color);
		opacity: var(--ren-opacity-hover);
	}

	.ren-title__content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.ren-title__text {
		margin: 0;
		font-weight: var(--ren-font-weight-bold);
		color: inherit;
		line-height: var(--ren-line-height-tight);
	}

	.ren-title__subtitle {
		margin: var(--ren-space-2xs) 0 0 0;
		font-weight: var(--ren-font-weight-normal);
		color: var(--ren-color-text-muted);
		line-height: var(--ren-line-height-normal);
		font-size: var(--ren-font-size-sm);
	}

	/* Sizes */
	.ren-title--sm .ren-title__text {
		font-size: var(--ren-font-size-base);
	}
	.ren-title--sm .ren-title__subtitle {
		font-size: var(--ren-font-size-xs);
	}
	.ren-title--md .ren-title__text {
		font-size: var(--ren-font-size-lg);
	}
	.ren-title--lg .ren-title__text {
		font-size: var(--ren-font-size-xl);
	}
	.ren-title--xl .ren-title__text {
		font-size: var(--ren-font-size-2xl);
	}

	/* Responsive */
	@media (max-width: 48rem) {
		.ren-title--xl .ren-title__text {
			font-size: var(--ren-font-size-xl);
		}
		.ren-title--lg .ren-title__text {
			font-size: var(--ren-font-size-lg);
		}
	}
</style>
