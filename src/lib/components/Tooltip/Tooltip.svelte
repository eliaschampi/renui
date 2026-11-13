<script lang="ts">
	import { fade } from 'svelte/transition';
	import { portal } from '../../actions/portal';
	import { createFloating } from '../../utils/floating.svelte';
	import { DURATION_FAST, motion } from '../config';
	import type { TooltipPlacement, TooltipProps } from './types';

	const {
		text = '',
		color = 'primary',
		placement = 'top',
		delay = 0,
		class: className,
		children,
		content
	}: TooltipProps = $props();

	const instanceId = $props.id();
	const tooltipId = `ren-tooltip-${instanceId}`;
	const FOCUSABLE =
		'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

	let visible = $state(false);
	let showTimer: ReturnType<typeof setTimeout> | undefined;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;
	let triggerRef: HTMLSpanElement | undefined = $state();
	let bubbleRef: HTMLDivElement | undefined = $state();
	let arrowRef: HTMLSpanElement | undefined = $state();

	// The wrapper stretches in a grid or flex column while its child stays at the
	// start, so a lone child is the anchor: the tooltip belongs to what is visible.
	function anchor(): Element | undefined {
		const child = triggerRef?.firstElementChild;
		return child &&
			triggerRef?.childElementCount === 2 &&
			child.getClientRects().length
			? child
			: triggerRef;
	}

	const floating = createFloating(
		anchor,
		() => bubbleRef,
		() => ({
			placement,
			offset: 10,
			maxHeight: 300,
			viewportPadding: 8,
			zIndex: 'var(--ren-z-tooltip)',
			arrow: arrowRef ? { element: arrowRef, padding: 12 } : undefined
		})
	);

	const side = $derived(
		floating.resolvedPlacement.split('-')[0] as TooltipPlacement
	);

	// The description lives in the DOM from SSR on. It is attached to the
	// first focusable element inside, else to a focusable ancestor, else the
	// wrapper becomes focusable. Re-attached when the child rewrites its ids.
	function attach(): void {
		if (!triggerRef) return;
		const target =
			triggerRef.querySelector<HTMLElement>(FOCUSABLE) ??
			triggerRef.parentElement?.closest<HTMLElement>(FOCUSABLE);
		if (!target) {
			// Writing an unchanged value would still notify the observer.
			if (triggerRef.getAttribute('aria-describedby') === tooltipId) return;
			triggerRef.tabIndex = 0;
			triggerRef.setAttribute('aria-describedby', tooltipId);
			return;
		}
		const ids = target.getAttribute('aria-describedby');
		if (!ids?.split(' ').includes(tooltipId))
			target.setAttribute(
				'aria-describedby',
				ids ? `${ids} ${tooltipId}` : tooltipId
			);
	}

	$effect(() => {
		if (!triggerRef) return;
		attach();
		const observer = new MutationObserver(attach);
		observer.observe(triggerRef, {
			subtree: true,
			childList: true,
			attributeFilter: ['aria-describedby']
		});
		return () => observer.disconnect();
	});

	function show(): void {
		clearTimeout(hideTimer);
		if (visible) return;
		clearTimeout(showTimer);
		showTimer = setTimeout(() => {
			visible = true;
			floating.open();
		}, delay);
	}

	// A short grace period lets the pointer travel onto the bubble (WCAG 1.4.13).
	function hide(now = false): void {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		const close = () => {
			visible = false;
			floating.close();
		};
		if (now) close();
		else hideTimer = setTimeout(close, 100);
	}

	$effect(() => {
		if (!visible) return;
		// Capture phase runs before an enclosing dialog's Escape handler.
		// An open menu or listbox owns its Escape; the tooltip yields to it.
		const onkeydown = (event: KeyboardEvent) => {
			const target = event.target as Element;
			if (
				event.key !== 'Escape' ||
				target.closest?.('[role="menu"], [role="listbox"]') ||
				target.getAttribute?.('aria-expanded') === 'true'
			)
				return;
			event.preventDefault();
			event.stopPropagation();
			hide(true);
		};
		document.addEventListener('keydown', onkeydown, true);
		return () => document.removeEventListener('keydown', onkeydown, true);
	});

	$effect(() => () => {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
	});
</script>

{#snippet body()}
	{#if content}{@render content()}{:else}{text}{/if}
{/snippet}

<!-- svelte-ignore a11y_no_static_element_interactions (Hover only mirrors focus; the description is exposed through aria-describedby.) -->
<span
	bind:this={triggerRef}
	class="ren-tooltip"
	onpointerenter={show}
	onpointerleave={() => hide()}
	onfocusin={show}
	onfocusout={() => hide(true)}
>
	{@render children?.()}
	<span id={tooltipId} class="ren-sr-only">{@render body()}</span>
</span>

{#if visible}
	<!-- Visual copy; assistive tech reads the description above. -->
	<div
		bind:this={bubbleRef}
		use:portal
		class={[
			'ren-tooltip__content',
			`ren-tooltip--${side}`,
			`ren-tone ren-tone--${color}`,
			className
		]}
		style={floating.styleString}
		style:--ren-tooltip-arrow-x={floating.position.arrowX != null
			? `${floating.position.arrowX}px`
			: 'calc(50% - var(--ren-tooltip-arrow) / 2)'}
		style:--ren-tooltip-arrow-y={floating.position.arrowY != null
			? `${floating.position.arrowY}px`
			: 'calc(50% - var(--ren-tooltip-arrow) / 2)'}
		aria-hidden="true"
		onpointerenter={show}
		onpointerleave={() => hide()}
		transition:fade={{ duration: motion(DURATION_FAST) }}
	>
		{@render body()}
		<span bind:this={arrowRef} class="ren-tooltip__arrow"></span>
	</div>
{/if}

<style>
	.ren-tooltip {
		display: inline-flex;
		align-items: center;
		position: relative;
	}

	.ren-tooltip__content {
		--ren-tooltip-bg: var(--ren-color-surface-raised);
		--ren-tooltip-border: color-mix(
			in oklch,
			var(--ren-control-accent, var(--ren-color-border-strong)) 32%,
			var(--ren-color-border-strong)
		);
		--ren-tooltip-arrow: var(--ren-space-xs);
		--ren-tooltip-tuck: calc(
			(var(--ren-tooltip-arrow) / 2) + var(--ren-border-width-thin)
		);
		padding: var(--ren-space-xs) var(--ren-space-sm);
		max-width: calc(var(--ren-space-5xl) * 3);
		border: var(--ren-border-width-thin) solid var(--ren-tooltip-border);
		border-radius: var(--ren-radius-tooltip);
		background: var(--ren-tooltip-bg);
		color: var(--ren-color-text);
		box-shadow: var(--ren-shadow-md);
		font-size: var(--ren-font-size-xs);
		font-weight: var(--ren-font-weight-medium);
		line-height: var(--ren-line-height-snug);
		text-align: center;
	}

	/* Tip edges only; square tucks under the bubble so it is one shape. */
	.ren-tooltip__arrow {
		position: absolute;
		width: var(--ren-tooltip-arrow);
		height: var(--ren-tooltip-arrow);
		box-sizing: border-box;
		background: var(--ren-tooltip-bg);
		border: var(--ren-border-width-thin) solid var(--ren-tooltip-border);
		border-top-color: transparent;
		border-left-color: transparent;
	}

	.ren-tooltip--top .ren-tooltip__arrow {
		top: calc(100% - var(--ren-tooltip-tuck));
		left: var(--ren-tooltip-arrow-x);
		transform: rotate(45deg);
	}

	.ren-tooltip--bottom .ren-tooltip__arrow {
		bottom: calc(100% - var(--ren-tooltip-tuck));
		left: var(--ren-tooltip-arrow-x);
		transform: rotate(225deg);
	}

	.ren-tooltip--left .ren-tooltip__arrow {
		left: calc(100% - var(--ren-tooltip-tuck));
		top: var(--ren-tooltip-arrow-y);
		transform: rotate(-45deg);
	}

	.ren-tooltip--right .ren-tooltip__arrow {
		right: calc(100% - var(--ren-tooltip-tuck));
		top: var(--ren-tooltip-arrow-y);
		transform: rotate(135deg);
	}
</style>
