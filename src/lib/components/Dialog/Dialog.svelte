<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { dialog: en.dialog, dialogClose: en.dialogClose };
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { portal } from '../../actions/portal';
	import { registerModal } from '../../utils/modal';
	import { CloseButton } from '../CloseButton';
	import { DURATION_BASE, motion } from '../config';
	import { useRenLocale } from '../../i18n';
	import type { DialogProps } from './types';

	let {
		open = $bindable(false),
		title = '',
		size = 'md',
		persistent = false,
		scrollable = false,
		fullScreen = false,
		hideClose = false,
		closeLabel,
		closeOnEscape = true,
		class: className,
		onclose,
		onopen,
		onafteropen,
		onafterclose,
		children,
		header,
		footer
	}: DialogProps = $props();

	const i18n = useRenLocale(COPY);
	let dialogElement: HTMLDivElement | undefined = $state();
	let pointerDownOnOverlay = false;

	const uniqueId = $props.id();
	const titleId = `ren-dialog-title-${uniqueId}`;

	function handleClose(): void {
		if (!open) return;
		open = false;
		onclose?.();
	}

	function handleOverlayPointerDown(event: PointerEvent): void {
		pointerDownOnOverlay = !persistent && event.target === event.currentTarget;
	}

	function handleOverlayClick(event: MouseEvent): void {
		const pressedOverlay = pointerDownOnOverlay;
		pointerDownOnOverlay = false;
		if (pressedOverlay && event.target === event.currentTarget) handleClose();
	}

	$effect(() => {
		if (!open || !dialogElement) return;
		untrack(() => onopen?.());
		return registerModal(dialogElement, () => {
			if (!closeOnEscape) return false;
			handleClose();
		});
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events (Backdrop dismissal is pointer-only; keyboard users close with Escape or the close button.) -->
	<div
		bind:this={dialogElement}
		use:portal={'body'}
		class={[
			'ren-dialog-overlay',
			persistent && 'ren-dialog-overlay--persistent',
			fullScreen && 'ren-dialog-overlay--full-screen'
		]}
		transition:fade={{ duration: motion(DURATION_BASE) }}
		onintroend={onafteropen}
		onoutroend={onafterclose}
		onpointerdown={handleOverlayPointerDown}
		onclick={handleOverlayClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby={title && !header ? titleId : undefined}
		aria-label={header || !title ? title || i18n.t.dialog : undefined}
		tabindex="-1"
	>
		<div
			class={[
				'ren-dialog',
				!fullScreen && `ren-dialog--${size}`,
				scrollable && 'ren-dialog--scrollable',
				fullScreen && 'ren-dialog--full-screen',
				className
			]}
			transition:scale={{ duration: motion(DURATION_BASE), start: 0.96 }}
		>
			{#if header || title || !hideClose}
				<header class="ren-dialog__header">
					<div class="ren-dialog__header-content">
						{#if header}
							{@render header()}
						{:else if title}
							<h2 id={titleId} class="ren-dialog__title">{title}</h2>
						{/if}
					</div>
					{#if !hideClose}
						<CloseButton
							class="ren-dialog__close"
							label={closeLabel ?? i18n.t.dialogClose}
							onclick={handleClose}
						/>
					{/if}
				</header>
			{/if}

			<div class="ren-dialog__content ren-scrollbar">
				{@render children?.()}
			</div>

			{#if footer}
				<footer class="ren-dialog__footer">{@render footer()}</footer>
			{/if}
		</div>
	</div>
{/if}

<style>
	/*
	 * Layout contract on the portal root. Children inherit.
	 * Tokens must not live only on `.ren-dialog` — overlay padding and
	 * size vars are consumed by the parent and would resolve as invalid.
	 */
	.ren-dialog-overlay {
		--ren-dialog-width-sm: 25rem;
		--ren-dialog-width-md: 31.25rem;
		--ren-dialog-width-lg: 43.75rem;
		--ren-dialog-width-xl: 56.25rem;
		--ren-dialog-max-height: 90dvh;
		--ren-dialog-content-max-height: 60dvh;
		--ren-dialog-full-width: 100vw;
		--ren-dialog-full-height: 100dvh;
		--ren-dialog-overlay-padding: var(--ren-space-lg);
		--ren-dialog-overlay-padding-mobile: var(--ren-space-sm);
		--ren-dialog-mobile-max-width: calc(
			100vw - (var(--ren-dialog-overlay-padding-mobile) * 2)
		);
		--ren-dialog-mobile-max-height: calc(
			100dvh -
				max(
					var(--ren-dialog-overlay-padding-mobile),
					var(--ren-safe-area-top)
				) -
				max(
					var(--ren-dialog-overlay-padding-mobile),
					var(--ren-safe-area-bottom)
				)
		);
		position: fixed;
		inset: 0;
		background: var(--ren-color-overlay);
		z-index: var(--ren-z-modal-backdrop);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: max(var(--ren-dialog-overlay-padding), var(--ren-safe-area-top))
			max(var(--ren-dialog-overlay-padding), var(--ren-safe-area-right))
			max(var(--ren-dialog-overlay-padding), var(--ren-safe-area-bottom))
			max(var(--ren-dialog-overlay-padding), var(--ren-safe-area-left));
		cursor: pointer;
		overflow-y: auto;
		overscroll-behavior: contain;
		outline: none;
	}

	.ren-dialog-overlay--full-screen {
		padding: 0;
	}

	.ren-dialog-overlay--persistent,
	/* Layers portaled into the overlay (menus, tooltips, listboxes) are not backdrop. */
	.ren-dialog-overlay > :global(:not(.ren-dialog)) {
		cursor: default;
	}

	.ren-dialog {
		--ren-surface-bg: var(--ren-color-surface-overlay);
		--ren-surface-radius-local: var(--ren-layout-floating-radius);
		--ren-surface-shadow: var(--ren-shadow-xl);
		position: relative;
		max-height: var(--ren-dialog-max-height);
		width: 100%;
		display: flex;
		flex-direction: column;
		cursor: default;
		z-index: var(--ren-z-modal);
		overflow: hidden;
	}

	.ren-dialog--sm {
		max-width: var(--ren-dialog-width-sm);
	}

	.ren-dialog--md {
		max-width: var(--ren-dialog-width-md);
	}

	.ren-dialog--lg {
		max-width: var(--ren-dialog-width-lg);
	}

	.ren-dialog--xl {
		max-width: var(--ren-dialog-width-xl);
	}

	.ren-dialog--scrollable .ren-dialog__content {
		overflow-y: auto;
		max-height: var(--ren-dialog-content-max-height);
	}

	.ren-dialog--full-screen {
		max-width: none;
		max-height: none;
		width: var(--ren-dialog-full-width);
		height: var(--ren-dialog-full-height);
		padding: var(--ren-safe-area-top) var(--ren-safe-area-right)
			var(--ren-safe-area-bottom) var(--ren-safe-area-left);
		--ren-surface-radius-local: var(--ren-radius-none);
	}

	.ren-dialog--full-screen .ren-dialog__content {
		flex: 1;
		overflow-y: auto;
	}

	.ren-dialog__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--ren-space-lg);
		border-bottom: var(--ren-border-width-thin) solid var(--ren-color-border);
		background: var(--ren-color-surface-raised);
		border-top-left-radius: var(--ren-layout-floating-radius);
		border-top-right-radius: var(--ren-layout-floating-radius);
		flex-shrink: 0;
	}

	.ren-dialog__header-content {
		flex: 1;
		min-width: 0;
	}

	.ren-dialog__title {
		margin: 0;
		font-size: var(--ren-font-size-lg);
		font-weight: var(--ren-font-weight-bold);
		color: var(--ren-color-text);
		line-height: var(--ren-line-height-tight);
		/* Long unbroken names (files, emails) wrap instead of overflowing. */
		overflow-wrap: anywhere;
	}

	.ren-dialog__header :global(.ren-dialog__close) {
		margin-inline-start: var(--ren-space-md);
	}

	.ren-dialog__content {
		flex: 1;
		padding: var(--ren-space-lg);
		color: var(--ren-color-text);
		line-height: var(--ren-line-height-normal);
		background: var(--ren-color-surface);
		overflow-x: hidden;
		overflow-y: auto;
		min-width: 0;
		min-height: 0;
		overscroll-behavior: contain;
	}

	.ren-dialog__footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--ren-space-md);
		padding: var(--ren-space-lg);
		border-top: var(--ren-border-width-thin) solid var(--ren-color-border);
		flex-shrink: 0;
		background: var(--ren-color-surface-raised);
		border-bottom-left-radius: var(--ren-layout-floating-radius);
		border-bottom-right-radius: var(--ren-layout-floating-radius);
	}

	@media (max-width: 48rem) {
		.ren-dialog-overlay {
			--ren-dialog-overlay-padding: var(--ren-dialog-overlay-padding-mobile);
			align-items: center;
		}

		.ren-dialog {
			max-width: var(--ren-dialog-mobile-max-width);
			max-height: var(--ren-dialog-mobile-max-height);
			--ren-surface-radius-local: var(--ren-layout-floating-radius-mobile);
		}

		.ren-dialog--full-screen {
			height: var(--ren-dialog-full-height);
			max-height: var(--ren-dialog-full-height);
			--ren-surface-radius-local: var(--ren-radius-none);
		}

		.ren-dialog__header {
			padding: var(--ren-space-md);
			border-top-left-radius: var(--ren-layout-floating-radius-mobile);
			border-top-right-radius: var(--ren-layout-floating-radius-mobile);
		}

		.ren-dialog__content {
			padding: var(--ren-space-md);
		}

		.ren-dialog__footer {
			padding: var(--ren-space-md);
			flex-direction: column-reverse;
			gap: var(--ren-space-sm);
			border-bottom-left-radius: var(--ren-layout-floating-radius-mobile);
			border-bottom-right-radius: var(--ren-layout-floating-radius-mobile);
		}

		.ren-dialog__footer :global(.ren-button) {
			width: 100%;
		}
	}
</style>
