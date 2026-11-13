<script module lang="ts">
	const NONE = () => ({ duration: 0 });
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TransitionConfig } from 'svelte/transition';
	import { CloseButton } from '../CloseButton';
	import type { LumiColor } from '../config';
	import { STATUS_GLYPHS } from './status';

	interface Props {
		color: LumiColor;
		title?: string;
		message?: string;
		icon?: boolean;
		/** Toast look: raised, rounder, icon tile */
		floating?: boolean;
		role?: 'alert' | 'status';
		closeLabel?: string;
		/** Auto-expire after ms (0 = never); pauses on hover and focus */
		duration?: number;
		class?: string;
		children?: Snippet;
		/** Enter/exit transition; none when the owner animates a wrapper */
		motion?: (node: Element, params: object) => TransitionConfig;
		params?: object;
		onclose?: () => void;
		onexpire?: () => void;
		onoutroend?: () => void;
	}

	const {
		color,
		title,
		message,
		icon = true,
		floating = false,
		role,
		closeLabel,
		duration = 0,
		class: className,
		children,
		motion = NONE,
		params = {},
		onclose,
		onexpire,
		onoutroend
	}: Props = $props();

	// Countdown that pauses while hovered or focused; restarts when `duration` changes.
	let hovered = $state(false);
	let focused = $state(false);
	let elapsed = 0;
	let counted = 0;
	$effect(() => {
		if (duration !== counted) {
			counted = duration;
			elapsed = 0;
		}
		if (duration <= 0 || hovered || focused) return;
		const start = Date.now();
		const timer = setTimeout(() => onexpire?.(), duration - elapsed);
		return () => {
			clearTimeout(timer);
			elapsed += Date.now() - start;
		};
	});
</script>

<!-- Internal: the one status shell shared by Alert, Notification and Toaster.
     In flow it is a tinted panel; floating it is a raised card. Both carry the
     same seal: the status glyph on a solid disc. -->
<div
	class={[
		'lumi-status',
		`lumi-tone lumi-tone--${color}`,
		floating && 'lumi-status--floating',
		duration > 0 && 'lumi-status--timed',
		className
	]}
	style:--lumi-status-duration={duration > 0 ? `${duration}ms` : undefined}
	{role}
	aria-atomic={role && 'true'}
	onpointerenter={() => (hovered = true)}
	onpointerleave={() => (hovered = false)}
	onfocusin={() => (focused = true)}
	onfocusout={() => (focused = false)}
	{onoutroend}
	transition:motion={params}
>
	{#if icon}
		<span class="lumi-status__icon" aria-hidden="true">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				{#each STATUS_GLYPHS[color] as d (d)}<path {d} />{/each}
			</svg>
		</span>
	{/if}

	<div class="lumi-status__body">
		{#if title}<p class="lumi-status__title">{title}</p>{/if}
		{#if message}<p class="lumi-status__text">{message}</p>{/if}
		{#if children}<div class="lumi-status__text">{@render children()}</div>{/if}
	</div>

	{#if closeLabel}
		<CloseButton label={closeLabel} onclick={onclose} />
	{/if}
</div>

<style>
	.lumi-status {
		--_seal: var(--lumi-space-lg);
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--lumi-space-sm);
		padding: var(--lumi-space-sm) var(--lumi-space-md);
		overflow: hidden;
		color: var(--lumi-tone-ink);
		background: var(--lumi-tone-soft);
		border-radius: var(--lumi-radius-panel);
	}

	.lumi-status--floating {
		--_seal: var(--lumi-space-2xl);
		--lumi-beam-angle: 145deg;
		align-items: flex-start;
		gap: var(--lumi-space-md);
		inline-size: min(100%, calc(var(--lumi-space-6xl) * 5));
		padding: var(--lumi-space-md);
		color: var(--lumi-color-text);
		background: var(--lumi-color-surface-overlay);
		border: var(--lumi-border-width-thin) solid var(--lumi-color-border);
		box-shadow: var(--lumi-shadow-lg);
	}

	/* The seal: a solid disc in flow, a beam-lit tile on a toast. */
	.lumi-status__icon {
		display: grid;
		flex-shrink: 0;
		place-items: center;
		inline-size: var(--_seal);
		block-size: var(--_seal);
		color: var(--lumi-control-foreground);
		background: var(--lumi-control-solid);
		border-radius: var(--lumi-radius-full);
	}

	.lumi-status__icon svg {
		inline-size: 58%;
		block-size: 58%;
	}

	.lumi-status--floating .lumi-status__icon {
		background: var(--lumi-tone-beam);
		border-radius: var(--lumi-radius-control);
	}

	.lumi-status__body {
		flex: 1;
		min-inline-size: 0;
	}

	.lumi-status__title {
		font-size: var(--lumi-font-size-sm);
		font-weight: var(--lumi-font-weight-semibold);
		line-height: var(--lumi-line-height-snug);
	}

	/* Body copy stays in the hue of its surface: ink in flow, muted on a toast. */
	.lumi-status__text {
		font-size: var(--lumi-font-size-sm);
		line-height: var(--lumi-line-height-normal);
		overflow-wrap: break-word;
	}

	.lumi-status__title + .lumi-status__text {
		opacity: 0.86;
	}

	.lumi-status--floating .lumi-status__title {
		font-size: var(--lumi-font-size-base);
	}

	.lumi-status--floating .lumi-status__text {
		color: var(--lumi-color-text-muted);
		opacity: 1;
	}

	/* Countdown beam mirrors the paused timer. */
	.lumi-status--timed::after {
		content: '';
		position: absolute;
		inset-inline: 0;
		inset-block-end: 0;
		block-size: calc(var(--lumi-border-width-base) * 2);
		background: var(--lumi-tone-beam);
		transform-origin: left;
		animation: lumi-status-countdown var(--lumi-status-duration) linear forwards;
	}

	.lumi-status--timed:is(:hover, :focus-within)::after {
		animation-play-state: paused;
	}

	@keyframes lumi-status-countdown {
		to {
			transform: scaleX(0);
		}
	}

	@media (max-width: 48rem) {
		.lumi-status--floating {
			inline-size: 100%;
			gap: var(--lumi-space-sm);
			padding: var(--lumi-space-sm);
		}
	}
</style>
