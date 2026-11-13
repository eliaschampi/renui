<script lang="ts">
	// Imported by a component, not the barrel: bundlers drop CSS imported by a
	// side-effect-free re-export module.
	import './field.css';
	import type { FieldLabelProps } from './types';

	const { for: htmlFor, label, required = false }: FieldLabelProps = $props();
</script>

<label for={htmlFor} class="ren-field-label">
	{label}
	{#if required}
		<span class="ren-field-label__required" aria-hidden="true">*</span>
	{/if}
</label>

<style>
	.ren-field-label {
		margin-block-end: var(--ren-space-xs);
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-semibold);
		color: var(--ren-color-text);
		cursor: pointer;
		transition: color var(--ren-duration-fast) var(--ren-easing-default);
	}

	/* The field root owns the accent, including the danger accent when invalid. */
	:global(:focus-within) > .ren-field-label {
		color: var(--ren-control-accent, var(--ren-color-primary));
	}

	.ren-field-label__required {
		margin-inline-start: var(--ren-space-2xs);
		color: var(--ren-color-danger);
	}
</style>
