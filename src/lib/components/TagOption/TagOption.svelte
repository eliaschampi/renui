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
		'lumi-tag-option',
		selected && 'lumi-tag-option--selected',
		`lumi-tone lumi-tone--${color}`,
		className
	]}
	aria-pressed={selected}
	{disabled}
	{onclick}
>
	<span class="lumi-tag-option__dot" aria-hidden="true"></span>
	<span class="lumi-tag-option__label">{label}</span>
</button>

<style>
	.lumi-tag-option {
		display: flex;
		align-items: center;
		gap: var(--lumi-space-sm);
		width: 100%;
		padding: var(--lumi-space-md);
		border: var(--lumi-border-width-thin) solid var(--lumi-color-border-light);
		border-radius: var(--lumi-radius-option);
		background: transparent;
		color: var(--lumi-color-text);
		font-family: inherit;
		font-size: var(--lumi-font-size-sm);
		cursor: pointer;
		text-align: start;
		transition: var(--lumi-transition-interactive);
	}

	.lumi-tag-option:hover {
		border-color: var(--lumi-color-border-strong);
		background: var(--lumi-color-hover);
	}

	.lumi-tag-option:active {
		transform: scale(var(--lumi-interactive-press-scale));
	}

	.lumi-tag-option:focus-visible {
		outline: var(--lumi-focus-outline);
		outline-offset: var(--lumi-focus-outline-offset);
	}

	.lumi-tag-option--selected {
		border-color: transparent;
		color: var(--lumi-tone-ink);
		background: var(--lumi-tone-soft);
	}

	.lumi-tag-option--selected:hover {
		background: var(--lumi-tone-strong);
	}

	.lumi-tag-option:disabled {
		opacity: var(--lumi-opacity-disabled);
		pointer-events: none;
	}

	.lumi-tag-option__dot {
		width: var(--lumi-icon-xs);
		height: var(--lumi-icon-xs);
		border-radius: var(--lumi-radius-full);
		flex-shrink: 0;
		background: var(--lumi-control-accent);
		box-shadow: 0 0 0 var(--lumi-border-width-thick)
			color-mix(in srgb, var(--lumi-control-accent) 20%, transparent);
	}

	.lumi-tag-option__label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
