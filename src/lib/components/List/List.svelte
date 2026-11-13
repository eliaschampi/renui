<script lang="ts">
	import type { ListProps } from './types';

	const {
		size = 'md',
		color,
		disabled = false,
		maxHeight,
		class: className,
		children
	}: ListProps = $props();
</script>

<!-- role="list" keeps list semantics in Safari once list-style is removed. -->
<ul
	class={[
		'ren-list',
		size === 'sm' && 'ren-list--sm',
		maxHeight && `ren-list--max-${maxHeight} ren-scroll-contain`,
		color && `ren-tone ren-tone--${color}`,
		className
	]}
	role="list"
	inert={disabled || undefined}
>
	{@render children?.()}
</ul>

<style>
	.ren-list {
		--ren-list-item-padding: var(--ren-space-sm) var(--ren-space-md);
		--ren-list-icon-size: var(--ren-icon-sm);
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-2xs);
		inline-size: 100%;
		padding: var(--ren-space-xs);
		list-style: none;
		background: var(--ren-color-surface-inset);
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		border-radius: var(--ren-surface-radius);
	}

	.ren-list--sm {
		--ren-list-item-padding: var(--ren-space-xs) var(--ren-space-sm);
		--ren-list-icon-size: var(--ren-icon-xs);
	}

	/* Inner scroller only when capped; unbounded lists stay in the parent. */
	.ren-list--max-sm,
	.ren-list--max-md,
	.ren-list--max-lg {
		overflow: hidden auto;
	}

	.ren-list--max-sm {
		max-block-size: calc(var(--ren-space-3xl) * 3);
	}

	.ren-list--max-md {
		max-block-size: calc(var(--ren-space-3xl) * 4);
	}

	.ren-list--max-lg {
		max-block-size: calc(var(--ren-space-3xl) * 5);
	}

	.ren-list[inert] {
		opacity: var(--ren-opacity-disabled);
	}
</style>
