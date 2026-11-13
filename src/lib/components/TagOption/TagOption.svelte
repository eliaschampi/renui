<script lang="ts">
	import type { TagOptionProps } from './types';

	const {
		label,
		color = 'primary',
		selected = false,
		disabled = false,
		class: className = '',
		onclick
	}: TagOptionProps = $props();
</script>

<button
	type="button"
	class={[
		'ren-tag-option',
		selected && 'ren-tag-option--selected',
		`ren-tone ren-tone--${color}`,
		className
	]}
	aria-pressed={selected}
	{disabled}
	{onclick}
>
	<span class="ren-tag-option__dot" aria-hidden="true"></span>
	<span class="ren-tag-option__label">{label}</span>
</button>

<style>
	.ren-tag-option {
		display: flex;
		align-items: center;
		gap: var(--ren-space-sm);
		width: 100%;
		padding: var(--ren-space-md);
		border: var(--ren-border-width-thin) solid var(--ren-color-border-light);
		border-radius: var(--ren-radius-option);
		background: transparent;
		color: var(--ren-color-text);
		font-family: inherit;
		font-size: var(--ren-font-size-sm);
		cursor: pointer;
		text-align: start;
		transition: var(--ren-transition-interactive);
	}

	.ren-tag-option:hover {
		border-color: var(--ren-color-border-strong);
		background: var(--ren-color-hover);
	}

	.ren-tag-option:active {
		transform: scale(var(--ren-interactive-press-scale));
	}

	.ren-tag-option:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
	}

	.ren-tag-option--selected {
		border-color: transparent;
		color: var(--ren-tone-ink);
		background: var(--ren-tone-soft);
	}

	.ren-tag-option--selected:hover {
		background: var(--ren-tone-strong);
	}

	.ren-tag-option:disabled {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
	}

	.ren-tag-option__dot {
		width: var(--ren-icon-xs);
		height: var(--ren-icon-xs);
		border-radius: var(--ren-radius-full);
		flex-shrink: 0;
		background: var(--ren-control-accent);
		box-shadow: 0 0 0 var(--ren-border-width-thick)
			color-mix(in srgb, var(--ren-control-accent) 20%, transparent);
	}

	.ren-tag-option__label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
