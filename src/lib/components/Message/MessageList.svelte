<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = {
		messages: en.messages,
		messagesLatest: en.messagesLatest,
		messagesLoadingEarlier: en.messagesLoadingEarlier
	};

	// Distance (px) from the end that still counts as reading the latest message.
	const EDGE = 24;
</script>

<script lang="ts">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import { useRenLocale } from '../../i18n';
	import type { MessageListProps } from './types';

	const {
		'aria-label': ariaLabel,
		busy = false,
		loading = false,
		onloadmore,
		class: className = '',
		children
	}: MessageListProps = $props();

	const i18n = useRenLocale(COPY);

	let viewport: HTMLDivElement | undefined = $state();
	let content: HTMLDivElement | undefined = $state();
	let sentinel: HTMLDivElement | undefined = $state();
	let atEnd = $state(true);

	// Plain fields: scroll bookkeeping must not re-run effects.
	let follow = true;
	let lastTop = 0;
	let anchor: { el: Element; top: number } | null = null;

	const offsetIn = (el: Element, box: HTMLElement) =>
		el.getBoundingClientRect().top - box.getBoundingClientRect().top;

	function measure(box: HTMLElement): void {
		atEnd = box.scrollHeight - box.scrollTop - box.clientHeight <= EDGE;
		if (atEnd) follow = true;
		else if (box.scrollTop < lastTop) follow = false; // the reader scrolled up
		lastTop = box.scrollTop;
	}

	/** Scroll to the newest message and keep following new ones. */
	export function scrollToEnd(behavior: ScrollBehavior = 'auto'): void {
		if (!viewport) return;
		follow = true;
		viewport.scrollTo({ top: viewport.scrollHeight, behavior });
	}

	function jumpToLatest(): void {
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		scrollToEnd(still ? 'auto' : 'smooth');
		// The button goes inert at the end; keep focus inside the transcript.
		viewport?.focus({ preventScroll: true });
	}

	// Keep the live edge in view while following; otherwise hold the reader's
	// place when earlier messages are prepended (native anchoring may already
	// have done it, in which case the measured shift is zero).
	$effect(() => {
		const box = viewport;
		if (!box || !content) return;
		box.scrollTop = box.scrollHeight;
		const observer = new ResizeObserver(() => {
			if (follow) {
				box.scrollTop = box.scrollHeight;
			} else if (anchor?.el.isConnected) {
				const shift = offsetIn(anchor.el, box) - anchor.top;
				if (Math.abs(shift) >= 1) box.scrollTop += shift;
			}
			measure(box);
		});
		observer.observe(box);
		observer.observe(content);

		// Direct input ends prepend anchoring; later shifts are the reader's own.
		const release = () => (anchor = null);
		const onScroll = () => measure(box);
		const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
		box.addEventListener('scroll', onScroll, { passive: true });
		for (const type of inputs) {
			box.addEventListener(type, release, { passive: true });
		}
		return () => {
			observer.disconnect();
			box.removeEventListener('scroll', onScroll);
			for (const type of inputs) box.removeEventListener(type, release);
		};
	});

	// Ask for history half a viewport before the reader reaches the top.
	$effect(() => {
		// Re-created when loading ends, so a still-visible top asks again.
		const box = viewport;
		if (!box || !sentinel || !content || loading) return;
		const list = content;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) return;
				const first = list.firstElementChild;
				anchor = first ? { el: first, top: offsetIn(first, box) } : null;
				onloadmore?.();
			},
			{ root: box, rootMargin: '50% 0px 0px 0px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div class={['ren-message-list', className]}>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (A scrollable region must be keyboard reachable.) -->
	<div
		bind:this={viewport}
		class="ren-message-list__viewport ren-scrollbar ren-scroll-contain"
		role="region"
		aria-label={ariaLabel || i18n.t.messages}
		tabindex="0"
	>
		{#if onloadmore}
			<div bind:this={sentinel} class="ren-message-list__sentinel"></div>
		{/if}
		<div
			bind:this={content}
			class="ren-message-list__content"
			role="log"
			aria-live="polite"
			aria-relevant="additions"
			aria-busy={busy || undefined}
		>
			{@render children?.()}
		</div>
	</div>

	<!-- Floats over the transcript so loading never shifts the reader's place. -->
	<div class="ren-message-list__status" role="status">
		{#if loading}
			<span class="ren-surface ren-message-list__pill">
				<span class="ren-spinner" aria-hidden="true"></span>
				{i18n.t.messagesLoadingEarlier}
			</span>
		{/if}
	</div>

	<button
		type="button"
		class="ren-surface ren-message-list__latest"
		class:ren-message-list__latest--visible={!atEnd}
		aria-label={i18n.t.messagesLatest}
		title={i18n.t.messagesLatest}
		inert={atEnd}
		onclick={jumpToLatest}
	>
		<ArrowDown />
	</button>
</div>

<style>
	/* Give the list a height (or a flex/grid track); it scrolls inside. */
	.ren-message-list {
		position: relative;
		display: flex;
		flex-direction: column;
		block-size: 100%;
		min-block-size: 0;
	}

	.ren-message-list__viewport {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-block-size: 0;
		overflow-y: auto;
		border-radius: inherit;
	}

	.ren-message-list__viewport:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
	}

	.ren-message-list__sentinel {
		flex: none;
		block-size: var(--ren-border-width-thin);
	}

	/* Short conversations rest at the bottom, like a chat. */
	.ren-message-list__content {
		display: flex;
		flex-direction: column;
		margin-block-start: auto;
		padding: var(--ren-space-md);
	}

	.ren-message-list__status {
		position: absolute;
		inset-block-start: var(--ren-space-sm);
		inset-inline: 0;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.ren-message-list__pill {
		--ren-surface-radius-local: var(--ren-radius-full);
		display: inline-flex;
		align-items: center;
		gap: var(--ren-space-xs);
		padding: var(--ren-space-2xs) var(--ren-space-sm);
		font-size: var(--ren-font-size-xs);
		color: var(--ren-color-text-muted);
	}

	.ren-message-list__latest {
		--ren-surface-radius-local: var(--ren-radius-full);
		position: absolute;
		inset-block-end: var(--ren-space-md);
		inset-inline: 0;
		display: grid;
		place-items: center;
		inline-size: var(--ren-control-height-sm);
		block-size: var(--ren-control-height-sm);
		margin-inline: auto;
		padding: 0;
		color: var(--ren-color-text);
		cursor: pointer;
		opacity: 0;
		scale: 0.9;
		pointer-events: none;
		transition:
			var(--ren-transition-control),
			opacity var(--ren-duration-fast) var(--ren-easing-default),
			scale var(--ren-duration-fast) var(--ren-easing-default);
	}

	.ren-message-list__latest--visible {
		opacity: 1;
		scale: 1;
		pointer-events: auto;
	}

	.ren-message-list__latest:hover {
		color: var(--ren-color-primary);
	}

	.ren-message-list__latest:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-space-2xs);
	}

	.ren-message-list__latest :global(svg) {
		inline-size: var(--ren-icon-sm);
		block-size: var(--ren-icon-sm);
	}
</style>
