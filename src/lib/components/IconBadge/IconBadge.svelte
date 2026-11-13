<script lang="ts">
	import { Icon } from '../Icon';
	import type { IconBadgeProps } from './types';

	const {
		icon,
		color = 'primary',
		size = 'md',
		class: className
	}: IconBadgeProps = $props();
</script>

<span
	class={[
		'lumi-icon-badge',
		`lumi-icon-badge--${size}`,
		`lumi-tone lumi-tone--${color}`,
		className
	]}
	aria-hidden="true"
>
	<Icon {icon} {size} />
</span>

<style>
	/* Icon tile: a soft-to-strong wash of its tone, lit from the top corner like
	   every other toned surface, with the glyph in the tone ink. */
	.lumi-icon-badge {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		border-radius: var(--lumi-radius-tile);
		color: var(--lumi-tone-ink);
		background: linear-gradient(
			145deg,
			var(--lumi-tone-soft),
			var(--lumi-tone-strong)
		);
	}

	/* Follows the interactive surface around it, never its own hover: the badge
	   is not a control. Transform only, so the motion stays on the compositor. */
	.lumi-icon-badge :global(.lumi-icon) {
		transform: translateY(
				calc(var(--lumi-surface-hover) * var(--lumi-interactive-lift) * 2)
			)
			rotate(calc(var(--lumi-surface-hover) * var(--lumi-motion-scale) * -8deg));
		transition:
			transform var(--lumi-duration-base) var(--lumi-easing-default),
			color var(--lumi-duration-fast) var(--lumi-easing-default);
	}

	.lumi-icon-badge--sm {
		width: var(--lumi-space-xl);
		height: var(--lumi-space-xl);
	}

	.lumi-icon-badge--md {
		width: var(--lumi-space-2xl);
		height: var(--lumi-space-2xl);
	}

	.lumi-icon-badge--lg {
		width: var(--lumi-space-3xl);
		height: var(--lumi-space-3xl);
	}

	.lumi-icon-badge--xl {
		width: var(--lumi-space-4xl);
		height: var(--lumi-space-4xl);
	}
</style>
