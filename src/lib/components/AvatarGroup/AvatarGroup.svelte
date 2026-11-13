<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { avatarGroup: en.avatarGroup };
</script>

<script lang="ts">
	import { Avatar } from '../Avatar';
	import { AVATAR_SIZES } from '../Avatar/size';
	import { useRenLocale } from '../../i18n';
	import type { AvatarGroupProps } from './types';

	const {
		items = [],
		max = 4,
		total,
		size = 'sm',
		color = 'primary',
		class: className
	}: AvatarGroupProps = $props();

	const i18n = useRenLocale(COPY);

	const visible = $derived(items.slice(0, Math.max(0, max)));
	const count = $derived(Math.max(total ?? 0, items.length));
	const names = $derived(
		items
			.map((item) => item.name)
			.filter(Boolean)
			.join(', ')
	);
</script>

<!-- One summary for assistive tech; the avatars inside are decorative. -->
<span
	class={['ren-avatar-group', className]}
	style:--ren-avatar-size={AVATAR_SIZES[size]}
	role="img"
	aria-label={names
		? `${i18n.t.avatarGroup(count)}: ${names}`
		: i18n.t.avatarGroup(count)}
	title={names || undefined}
>
	{#each visible as item}
		<Avatar name={item.name} src={item.src} {size} {color} alt="" />
	{/each}
	{#if count > visible.length}
		<span class="ren-avatar-group__more">+{count - visible.length}</span>
	{/if}
</span>

<style>
	.ren-avatar-group {
		--ren-avatar-group-overlap: calc(var(--ren-avatar-size) * -0.25);
		display: inline-flex;
		align-items: center;
	}

	/* Spread slightly on hover so faces read individually. */
	@media (hover: hover) {
		.ren-avatar-group:hover {
			--ren-avatar-group-overlap: calc(var(--ren-avatar-size) * -0.1);
		}
	}

	.ren-avatar-group > :global(*) {
		/* The ring matches the surface behind the stack; override per context. */
		box-shadow: 0 0 0 var(--ren-border-width-thick)
			var(--ren-avatar-group-ring, var(--ren-color-surface));
		transition: margin-inline-start var(--ren-duration-base)
			var(--ren-easing-default);
	}

	.ren-avatar-group > :global(:not(:first-child)) {
		margin-inline-start: var(--ren-avatar-group-overlap);
	}

	.ren-avatar-group__more {
		display: inline-grid;
		place-items: center;
		inline-size: var(--ren-avatar-size);
		block-size: var(--ren-avatar-size);
		border-radius: var(--ren-radius-full);
		background: color-mix(
			in srgb,
			var(--ren-color-surface-inset) 88%,
			var(--ren-color-text) 12%
		);
		color: var(--ren-color-text-muted);
		font-size: calc(var(--ren-avatar-size) * 0.34);
		font-weight: var(--ren-font-weight-semibold);
		line-height: var(--ren-line-height-none);
		user-select: none;
	}
</style>
