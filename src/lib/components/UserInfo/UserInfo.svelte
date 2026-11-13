<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { unnamed: en.unnamed };
</script>

<script lang="ts">
	import { Avatar } from '../Avatar';
	import { useRenLocale } from '../../i18n';
	import type { UserInfoProps } from './types';

	const {
		name = '',
		description = '',
		src = '',
		size = 'md',
		color = 'primary',
		href,
		trailing,
		class: className
	}: UserInfoProps = $props();

	const i18n = useRenLocale(COPY);
</script>

<div
	class={[
		'ren-user-info',
		size !== 'md' && `ren-user-info--${size}`,
		className
	]}
>
	<!-- Decorative: the visible name is the accessible text. -->
	<Avatar {name} {src} {size} {color} alt="" />
	<span class="ren-user-info__text">
		<svelte:element
			this={href ? 'a' : 'span'}
			{href}
			class="ren-user-info__name"
		>
			{name.trim() || i18n.t.unnamed}
		</svelte:element>
		{#if description}
			<span class="ren-user-info__description">{description}</span>
		{/if}
	</span>
	{#if trailing}
		<span class="ren-user-info__trailing">{@render trailing()}</span>
	{/if}
</div>

<style>
	.ren-user-info {
		--ren-user-info-name: var(--ren-font-size-sm);
		--ren-user-info-description: var(--ren-font-size-xs);
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--ren-space-sm);
		min-inline-size: 0;
	}

	.ren-user-info--sm {
		gap: var(--ren-space-xs);
	}

	.ren-user-info--lg {
		--ren-user-info-name: var(--ren-font-size-base);
	}

	.ren-user-info--xl {
		--ren-user-info-name: var(--ren-font-size-lg);
		--ren-user-info-description: var(--ren-font-size-sm);
		gap: var(--ren-space-md);
	}

	.ren-user-info__text {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: var(--ren-space-2xs);
		min-inline-size: 0;
	}

	.ren-user-info__name,
	.ren-user-info__description {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ren-user-info__name {
		color: var(--ren-color-text);
		font-size: var(--ren-user-info-name);
		font-weight: var(--ren-font-weight-semibold);
		line-height: var(--ren-line-height-tight);
		text-decoration: none;
	}

	.ren-user-info__description {
		color: var(--ren-color-text-muted);
		font-size: var(--ren-user-info-description);
		line-height: var(--ren-line-height-normal);
	}

	/* Stretched link: the whole row is the target, trailing content sits above. */
	a.ren-user-info__name::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--ren-radius-control);
	}

	a.ren-user-info__name:hover {
		color: var(--ren-color-primary);
	}

	a.ren-user-info__name:focus-visible {
		outline: none;
	}

	a.ren-user-info__name:focus-visible::after {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
	}

	.ren-user-info__trailing {
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		gap: var(--ren-space-xs);
	}
</style>
