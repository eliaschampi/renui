<script lang="ts">
	import { Avatar } from '../Avatar';
	import type { SidebarHeaderProps } from './types';

	const {
		collapsed = false,
		coverSrc = '',
		coverAlt = '',
		cover,
		userName,
		userMeta = '',
		avatarText = '',
		avatarSrc = '',
		class: className
	}: SidebarHeaderProps = $props();
</script>

<div
	class={[
		'ren-sidebar-header',
		collapsed && 'ren-sidebar-header--collapsed',
		cover && 'ren-sidebar-header--custom-cover',
		className
	]}
>
	{#if collapsed}
		<div class="ren-sidebar-header__avatar">
			<Avatar
				name={avatarText || userName}
				src={avatarSrc || undefined}
				alt={userName}
				size="md"
				color="primary"
			/>
		</div>
	{:else}
		<div class="ren-sidebar-header__cover">
			{#if cover}
				{@render cover()}
			{:else if coverSrc}
				<img src={coverSrc} alt={coverAlt} decoding="async" />
			{/if}
		</div>

		<div class="ren-sidebar-header__identity">
			<div class="ren-sidebar-header__avatar">
				<Avatar
					name={avatarText || userName}
					src={avatarSrc || undefined}
					alt=""
					size="xl"
					color="primary"
				/>
			</div>
			<div class="ren-sidebar-header__content">
				<p class="ren-sidebar-header__name">{userName}</p>
				{#if userMeta}
					<p class="ren-sidebar-header__meta">{userMeta}</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.ren-sidebar-header {
		display: grid;
		justify-items: center;
		width: 100%;
		min-width: 0;
	}

	.ren-sidebar-header--collapsed {
		place-items: center;
	}

	.ren-sidebar-header__cover {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 7;
		min-height: calc(var(--ren-space-5xl) + var(--ren-space-xs));
		overflow: hidden;
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		border-radius: var(--ren-radius-panel);
		background: var(--ren-color-primary-bg);
		box-shadow: var(--ren-shadow-sm);
	}

	.ren-sidebar-header__cover img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.ren-sidebar-header__identity {
		position: relative;
		z-index: 1;
		display: grid;
		justify-items: center;
		gap: var(--ren-space-xs);
		width: 100%;
		min-width: 0;
		margin-top: calc((var(--ren-space-4xl) + var(--ren-space-2xs)) * -0.55);
		padding: 0 var(--ren-space-xs);
		text-align: center;
	}

	.ren-sidebar-header__avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding: var(--ren-space-2xs);
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		border-radius: var(--ren-radius-full);
		background: var(--ren-color-surface-card);
		box-shadow: var(--ren-shadow-sm);
	}

	.ren-sidebar-header__content {
		display: grid;
		gap: var(--ren-space-2xs);
		width: 100%;
		min-width: 0;
	}

	.ren-sidebar-header__name,
	.ren-sidebar-header__meta {
		max-width: 100%;
		margin: 0;
		overflow: hidden;
		line-height: var(--ren-line-height-tight);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ren-sidebar-header__name {
		color: var(--ren-color-text);
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-semibold);
	}

	.ren-sidebar-header__meta {
		color: var(--ren-color-text-muted);
		font-size: var(--ren-font-size-xs);
	}
</style>
