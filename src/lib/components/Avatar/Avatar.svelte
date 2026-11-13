<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { avatar: en.avatar };
</script>

<script lang="ts">
	import { useRenLocale } from '../../i18n';
	import { getInitials } from '../../utils/initials';
	import { AVATAR_SIZES } from './size';
	import type { AvatarProps } from './types';

	const {
		name = '',
		src = '',
		alt,
		color = 'primary',
		size = 'md',
		class: className,
		children
	}: AvatarProps = $props();

	const i18n = useRenLocale(COPY);

	// Remembering the failed URL lets a new `src` retry without an effect.
	let failedSrc = $state('');
	const decorative = $derived(alt === '');
	const initials = $derived(
		name.length <= 2 && !/\s/.test(name)
			? name.toLocaleUpperCase()
			: getInitials(name)
	);
</script>

<span
	class={['ren-avatar', className]}
	style:--ren-avatar-size={AVATAR_SIZES[size]}
	style:--ren-avatar-solid="var(--ren-color-{color}-solid)"
	style:--ren-avatar-foreground="var(--ren-color-{color}-foreground)"
	role={decorative ? undefined : 'img'}
	aria-label={decorative ? undefined : alt || name || i18n.t.avatar}
	aria-hidden={decorative || undefined}
>
	{#if src && src !== failedSrc}
		<img
			{src}
			alt=""
			loading="lazy"
			decoding="async"
			onerror={() => (failedSrc = src)}
		/>
	{:else if children}
		{@render children()}
	{:else}
		{initials}
	{/if}
</span>

<style>
	.ren-avatar {
		display: inline-grid;
		place-items: center;
		flex-shrink: 0;
		inline-size: var(--ren-avatar-size);
		block-size: var(--ren-avatar-size);
		overflow: hidden;
		border-radius: var(--ren-radius-full);
		background: var(--ren-avatar-solid);
		color: var(--ren-avatar-foreground);
		/* Initials scale with the diameter, so every size keeps one proportion. */
		font-size: calc(var(--ren-avatar-size) * 0.375);
		font-weight: var(--ren-font-weight-semibold);
		line-height: var(--ren-line-height-none);
		white-space: nowrap;
		user-select: none;
	}

	img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
</style>
