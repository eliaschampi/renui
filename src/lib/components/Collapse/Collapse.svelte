<script lang="ts">
	import type { CollapseProps } from './types';

	let {
		title = '',
		open = $bindable(false),
		color = 'primary',
		size = 'md',
		disabled = false,
		class: className,
		children,
		ontoggle
	}: CollapseProps = $props();

	const instanceId = $props.id();
	const panelId = `ren-collapse-panel-${instanceId}`;

	function toggle(): void {
		open = !open;
		ontoggle?.(open);
	}
</script>

<div
	class={[
		'ren-collapse',
		size !== 'md' && `ren-collapse--${size}`,
		open && 'ren-collapse--open',
		disabled && 'ren-collapse--disabled',
		`ren-tone ren-tone--${color}`,
		className
	]}
>
	<button
		type="button"
		class="ren-collapse__trigger"
		aria-expanded={open}
		aria-controls={panelId}
		{disabled}
		onclick={toggle}
	>
		<span class="ren-collapse__title">{title}</span>
		<svg
			class="ren-collapse__icon"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>

	<!-- Always rendered: the grid row animates open in CSS and `inert` keeps
	     the closed panel out of the tab order. -->
	<div id={panelId} class="ren-collapse__content" inert={!open}>
		<div class="ren-collapse__clip">
			<div class="ren-collapse__body">{@render children?.()}</div>
		</div>
	</div>
</div>

<style>
	.ren-collapse {
		--collapse-padding: var(--ren-space-md) var(--ren-space-lg);
		--collapse-min-height: var(--ren-control-height-lg);
		--collapse-title-size: var(--ren-font-size-base);
		--collapse-body-padding: var(--ren-space-lg);
		position: relative;
		isolation: isolate;
		margin-block-end: var(--ren-space-sm);
		overflow: hidden;
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		border-radius: var(--ren-surface-radius);
		background: var(--ren-color-surface-raised);
		box-shadow: var(--ren-shadow-sm);
		transition: var(--ren-transition-control);
	}

	.ren-collapse--sm {
		--collapse-padding: var(--ren-space-sm) var(--ren-space-md);
		--collapse-min-height: var(--ren-control-height-md);
		--collapse-title-size: var(--ren-font-size-sm);
		--collapse-body-padding: var(--ren-space-md);
	}

	.ren-collapse--lg {
		--collapse-padding: var(--ren-space-lg) var(--ren-space-xl);
		--collapse-min-height: var(--ren-control-height-xl);
		--collapse-title-size: var(--ren-font-size-lg);
		--collapse-body-padding: var(--ren-space-xl);
	}

	.ren-collapse:hover:not(.ren-collapse--disabled, .ren-collapse--open) {
		border-color: var(--ren-color-border-strong);
	}

	.ren-collapse--open {
		border-color: var(--ren-color-border-interactive);
		box-shadow: var(--ren-shadow-md);
	}

	.ren-collapse--disabled {
		opacity: var(--ren-opacity-disabled);
	}

	.ren-collapse__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ren-space-md);
		inline-size: 100%;
		min-block-size: var(--collapse-min-height);
		padding: var(--collapse-padding);
		background: transparent;
		border: 0;
		color: var(--ren-color-text);
		font: inherit;
		text-align: start;
		cursor: pointer;
		transition: var(--ren-transition-control);
	}

	.ren-collapse__trigger:disabled {
		pointer-events: none;
	}

	.ren-collapse__trigger:hover,
	.ren-collapse__trigger:focus-visible {
		background: var(--ren-color-hover);
	}

	.ren-collapse__trigger:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
	}

	.ren-collapse__title {
		font-size: var(--collapse-title-size);
		font-weight: var(--ren-font-weight-medium);
	}

	.ren-collapse__icon {
		flex-shrink: 0;
		inline-size: var(--ren-icon-md);
		block-size: var(--ren-icon-md);
		color: var(--ren-color-text-muted);
		transition:
			transform var(--ren-duration-slow) var(--ren-easing-default),
			color var(--ren-duration-fast) var(--ren-easing-default);
	}

	.ren-collapse--open .ren-collapse__icon {
		color: var(--ren-control-accent);
		transform: rotate(180deg);
	}

	/* 0fr → 1fr animates to the content's real height without measuring. */
	.ren-collapse__content {
		display: grid;
		grid-template-rows: 0fr;
		border-block-start: var(--ren-border-width-thin) solid transparent;
		transition:
			grid-template-rows var(--ren-duration-slow) var(--ren-easing-default),
			border-color var(--ren-duration-slow) var(--ren-easing-default);
	}

	.ren-collapse--open .ren-collapse__content {
		grid-template-rows: 1fr;
		border-block-start-color: var(--ren-color-border);
	}

	.ren-collapse__clip {
		min-block-size: 0;
		overflow: hidden;
	}

	.ren-collapse__body {
		padding: var(--collapse-body-padding);
		color: var(--ren-color-text-muted);
		font-size: var(--ren-font-size-sm);
		line-height: var(--ren-line-height-relaxed);
	}
</style>
