<script lang="ts">
	import type { MessageProps } from './types';

	const {
		align = 'start',
		variant,
		color,
		name,
		time,
		grouped = false,
		class: className = '',
		avatar,
		children,
		footer
	}: MessageProps = $props();

	const end = $derived(align === 'end');
	const accent = $derived(color ?? (end ? 'primary' : undefined));
	const showHeader = $derived(!grouped && Boolean(name || time));
</script>

<div
	class={[
		'ren-message',
		end && 'ren-message--end',
		`ren-message--${variant ?? (end ? 'filled' : 'soft')}`,
		grouped && 'ren-message--grouped',
		className
	]}
	style={accent
		? `--ren-message-accent: var(--ren-color-${accent}); --ren-message-tint: var(--ren-color-${accent}-bg); --ren-message-solid: var(--ren-color-${accent}-solid); --ren-message-on-solid: var(--ren-color-${accent}-foreground)`
		: undefined}
>
	{#if avatar}
		<div class="ren-message__avatar" aria-hidden={grouped || undefined}>
			{#if !grouped}{@render avatar()}{/if}
		</div>
	{/if}

	<div class="ren-message__content">
		{#if showHeader}
			<div class="ren-message__header">
				{#if name}<span class="ren-message__name">{name}</span>{/if}
				{#if time}<span class="ren-message__time">{time}</span>{/if}
			</div>
		{:else if grouped && name}
			<span class="ren-sr-only">{name}</span>
		{/if}

		<div class="ren-message__bubble">
			{@render children?.()}
		</div>

		{#if footer}
			<div class="ren-message__footer">{@render footer()}</div>
		{/if}
	</div>
</div>

<style>
	.ren-message {
		/* Neutral defaults; a `color` re-points these four. */
		--ren-message-accent: var(--ren-color-border-strong);
		--ren-message-tint: var(--ren-color-background-secondary);
		--ren-message-solid: var(--ren-color-surface-elevated);
		--ren-message-on-solid: var(--ren-color-text);
		--ren-message-avatar-size: var(--ren-space-xl);
		--ren-message-max-inline-size: 80%;
		display: flex;
		align-items: flex-start;
		gap: var(--ren-space-xs);
		min-width: 0;
	}

	.ren-message:not(:first-child) {
		margin-block-start: var(--ren-space-md);
	}

	.ren-message--grouped:not(:first-child) {
		margin-block-start: var(--ren-space-2xs);
	}

	.ren-message--end {
		flex-direction: row-reverse;
	}

	.ren-message__avatar {
		display: flex;
		flex: none;
		min-inline-size: var(--ren-message-avatar-size);
	}

	.ren-message__content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--ren-space-2xs);
		min-width: 0;
		max-inline-size: var(--ren-message-max-inline-size);
	}

	.ren-message--end .ren-message__content {
		align-items: flex-end;
	}

	.ren-message__header,
	.ren-message__footer {
		display: flex;
		align-items: baseline;
		gap: var(--ren-space-xs);
		padding-inline: var(--ren-space-2xs);
		font-size: var(--ren-font-size-xs);
		line-height: var(--ren-line-height-tight);
		color: var(--ren-color-text-muted);
	}

	.ren-message__name {
		font-weight: var(--ren-font-weight-semibold);
		color: var(--ren-color-text);
	}

	/* Bubble: one recipe; variants only choose fill, border and ink. */
	.ren-message__bubble {
		padding: var(--ren-space-xs) var(--ren-space-sm);
		font-size: var(--ren-font-size-sm);
		line-height: var(--ren-line-height-normal);
		color: var(--ren-color-text);
		overflow-wrap: anywhere;
		background: var(--ren-message-tint);
		border: var(--ren-border-width-thin) solid
			color-mix(in srgb, var(--ren-message-accent) 18%, transparent);
		border-radius: var(--ren-radius-lg);
		/* The corner beside the sender stays tight, like a tail. */
		border-start-start-radius: var(--ren-radius-xs);
	}

	.ren-message--end .ren-message__bubble {
		border-start-start-radius: var(--ren-radius-lg);
		border-start-end-radius: var(--ren-radius-xs);
	}

	.ren-message--filled .ren-message__bubble {
		color: var(--ren-message-on-solid);
		background: var(--ren-message-solid);
		border-color: transparent;
		box-shadow: var(--ren-shadow-sm);
	}

	.ren-message--filled .ren-message__bubble :global(a) {
		color: inherit;
	}

	.ren-message--outline .ren-message__bubble {
		background: transparent;
		border-color: color-mix(
			in srgb,
			var(--ren-message-accent) 45%,
			var(--ren-color-border)
		);
	}

	.ren-message--ghost {
		--ren-message-max-inline-size: 100%;
	}

	.ren-message--ghost .ren-message__content {
		flex: 1;
	}

	.ren-message--ghost .ren-message__bubble {
		padding: 0;
		background: none;
		border: none;
	}
</style>
