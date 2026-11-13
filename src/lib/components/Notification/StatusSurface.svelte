<script module lang="ts">
	const NONE = () => ({ duration: 0 });
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TransitionConfig } from 'svelte/transition';
	import { CloseButton } from '../CloseButton';
	import type { RenColor } from '../config';
	import { STATUS_GLYPHS } from './status';

	interface Props {
		color: RenColor;
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
		'ren-status',
		`ren-tone ren-tone--${color}`,
		floating && 'ren-status--floating',
		duration > 0 && 'ren-status--timed',
		className
	]}
	style:--ren-status-duration={duration > 0 ? `${duration}ms` : undefined}
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
		<span class="ren-status__icon" aria-hidden="true">
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

	<div class="ren-status__body">
		{#if title}<p class="ren-status__title">{title}</p>{/if}
		{#if message}<p class="ren-status__text">{message}</p>{/if}
		{#if children}<div class="ren-status__text">{@render children()}</div>{/if}
	</div>

	{#if closeLabel}
		<CloseButton label={closeLabel} onclick={onclose} />
	{/if}
</div>

<style>
	.ren-status {
		--_seal: var(--ren-space-lg);
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--ren-space-sm);
		padding: var(--ren-space-sm) var(--ren-space-md);
		overflow: hidden;
		color: var(--ren-tone-ink);
		background: var(--ren-tone-soft);
		border-radius: var(--ren-radius-panel);
	}

	.ren-status--floating {
		--_seal: var(--ren-space-2xl);
		--ren-beam-angle: 145deg;
		align-items: flex-start;
		gap: var(--ren-space-md);
		inline-size: min(100%, calc(var(--ren-space-6xl) * 5));
		padding: var(--ren-space-md);
		color: var(--ren-color-text);
		background: var(--ren-color-surface-overlay);
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		box-shadow: var(--ren-shadow-lg);
	}

	/* The seal: a solid disc in flow, a beam-lit tile on a toast. */
	.ren-status__icon {
		display: grid;
		flex-shrink: 0;
		place-items: center;
		inline-size: var(--_seal);
		block-size: var(--_seal);
		color: var(--ren-control-foreground);
		background: var(--ren-control-solid);
		border-radius: var(--ren-radius-full);
	}

	.ren-status__icon svg {
		inline-size: 58%;
		block-size: 58%;
	}

	.ren-status--floating .ren-status__icon {
		background: var(--ren-tone-beam);
		border-radius: var(--ren-radius-control);
	}

	.ren-status__body {
		flex: 1;
		min-inline-size: 0;
	}

	.ren-status__title {
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-semibold);
		line-height: var(--ren-line-height-snug);
	}

	/* Body copy stays in the hue of its surface: ink in flow, muted on a toast. */
	.ren-status__text {
		font-size: var(--ren-font-size-sm);
		line-height: var(--ren-line-height-normal);
		overflow-wrap: break-word;
	}

	.ren-status__title + .ren-status__text {
		opacity: 0.86;
	}

	.ren-status--floating .ren-status__title {
		font-size: var(--ren-font-size-base);
	}

	.ren-status--floating .ren-status__text {
		color: var(--ren-color-text-muted);
		opacity: 1;
	}

	/* Countdown beam mirrors the paused timer. */
	.ren-status--timed::after {
		content: '';
		position: absolute;
		inset-inline: 0;
		inset-block-end: 0;
		block-size: calc(var(--ren-border-width-base) * 2);
		background: var(--ren-tone-beam);
		transform-origin: left;
		animation: ren-status-countdown var(--ren-status-duration) linear forwards;
	}

	.ren-status--timed:is(:hover, :focus-within)::after {
		animation-play-state: paused;
	}

	@keyframes ren-status-countdown {
		to {
			transform: scaleX(0);
		}
	}

	/* The timer still dismisses; the beam cannot animate truthfully in 1ms. */
	@media (prefers-reduced-motion: reduce) {
		.ren-status--timed::after {
			display: none;
		}
	}

	@media (max-width: 48rem) {
		.ren-status--floating {
			inline-size: 100%;
			gap: var(--ren-space-sm);
			padding: var(--ren-space-sm);
		}
	}
</style>
