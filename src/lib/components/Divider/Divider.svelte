<script lang="ts">
	import type { DividerProps } from './types';

	const {
		orientation = 'horizontal',
		align = 'center',
		label,
		variant = 'solid',
		spacing = 'md',
		class: className
	}: DividerProps = $props();

	const classes = $derived([
		'ren-divider',
		orientation === 'vertical' && 'ren-divider--vertical',
		variant === 'dashed' && 'ren-divider--dashed',
		className
	]);
	// The default spacing lives in CSS; only a change is written inline.
	const space = $derived(
		spacing === 'md'
			? undefined
			: spacing === 'none'
				? '0'
				: `var(--ren-space-${spacing})`
	);
	const vertical = $derived(
		orientation === 'vertical' ? 'vertical' : undefined
	);
</script>

{#if label}
	<div
		class={[classes, `ren-divider--labeled ren-divider--${align}`]}
		style:--ren-divider-space={space}
		role="separator"
		aria-orientation={vertical}
		aria-label={label}
	>
		<span class="ren-divider__label">{label}</span>
	</div>
{:else}
	<hr
		class={classes}
		style:--ren-divider-space={space}
		aria-orientation={vertical}
	/>
{/if}

<style>
	.ren-divider {
		--ren-divider-line: var(--ren-border-width-thin)
			var(--ren-divider-style, solid) var(--ren-color-border);
		flex-shrink: 0;
		margin-block: var(--ren-divider-space, var(--ren-space-md));
		border: 0;
		border-block-start: var(--ren-divider-line);
		color: var(--ren-color-text-muted);
	}

	.ren-divider--dashed {
		--ren-divider-style: dashed;
	}

	.ren-divider--vertical {
		align-self: stretch;
		margin-block: 0;
		margin-inline: var(--ren-divider-space, var(--ren-space-md));
		border-block-start: 0;
		border-inline-start: var(--ren-divider-line);
	}

	/* Labeled: the line is drawn by the pseudo-elements around the label. */
	.ren-divider--labeled {
		display: flex;
		align-items: center;
		gap: var(--ren-space-sm);
		border: 0;
	}

	.ren-divider--labeled::before,
	.ren-divider--labeled::after {
		content: '';
		flex: 1;
		border-block-start: var(--ren-divider-line);
	}

	.ren-divider--start::before,
	.ren-divider--end::after {
		display: none;
	}

	.ren-divider__label {
		font-size: var(--ren-font-size-xs);
		font-weight: var(--ren-font-weight-medium);
		white-space: nowrap;
	}
</style>
