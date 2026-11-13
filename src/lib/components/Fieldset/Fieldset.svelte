<script lang="ts">
	import type { FieldsetProps } from './types';

	const {
		legend = '',
		class: className = '',
		children
	}: FieldsetProps = $props();
</script>

<fieldset class={['ren-fieldset', className]}>
	{#if legend}
		<legend class="ren-fieldset__legend">{legend}</legend>
	{/if}
	<div class="ren-fieldset__content">
		{@render children?.()}
	</div>
</fieldset>

<style>
	.ren-fieldset {
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		border-radius: var(--ren-surface-radius);
		padding: var(--ren-space-md);
		margin: 0;
		min-width: 0;
		background: var(--ren-color-surface-card);
		position: relative;
	}

	.ren-fieldset__legend {
		background: var(--ren-color-surface-card);
		color: var(--ren-color-text-muted);
		padding: 0 var(--ren-space-sm);
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-medium);
		margin-inline-start: var(--ren-space-md);
		border-radius: var(--ren-radius-base);
	}

	.ren-fieldset__content {
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-md);
	}
</style>
