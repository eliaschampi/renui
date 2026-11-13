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
		'ren-icon-badge',
		`ren-icon-badge--${size}`,
		`ren-tone ren-tone--${color}`,
		className
	]}
	aria-hidden="true"
>
	<Icon {icon} {size} />
</span>

<style>
	/* Icon tile: a soft-to-strong wash of its tone, lit from the top corner like
	   every other toned surface, with the glyph in the tone ink. */
	.ren-icon-badge {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		border-radius: var(--ren-radius-tile);
		color: var(--ren-tone-ink);
		background: linear-gradient(
			145deg,
			var(--ren-tone-soft),
			var(--ren-tone-strong)
		);
	}

	/* Follows the interactive surface around it, never its own hover: the badge
	   is not a control. Transform only, so the motion stays on the compositor. */
	.ren-icon-badge :global(.ren-icon) {
		transform: translateY(
				calc(var(--ren-surface-hover) * var(--ren-interactive-lift) * 2)
			)
			rotate(calc(var(--ren-surface-hover) * var(--ren-motion-scale) * -8deg));
		transition:
			transform var(--ren-duration-base) var(--ren-easing-default),
			color var(--ren-duration-fast) var(--ren-easing-default);
	}

	.ren-icon-badge--sm {
		width: var(--ren-space-xl);
		height: var(--ren-space-xl);
	}

	.ren-icon-badge--md {
		width: var(--ren-space-2xl);
		height: var(--ren-space-2xl);
	}

	.ren-icon-badge--lg {
		width: var(--ren-space-3xl);
		height: var(--ren-space-3xl);
	}

	.ren-icon-badge--xl {
		width: var(--ren-space-4xl);
		height: var(--ren-space-4xl);
	}
</style>
