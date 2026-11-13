<script lang="ts">
	// Imported by a component, not the barrel: bundlers drop CSS imported by a
	// side-effect-free re-export module.
	import './field.css';
	import type { FieldMessageProps } from './types';

	const { id, error = '', hint = '' }: FieldMessageProps = $props();

	const text = $derived(error || hint);
</script>

<!-- Always mounted so the live region announces messages as they appear. -->
<div
	class="ren-field-message"
	class:ren-field-message--visible={!!text}
	aria-live="polite"
>
	{#if text}
		<span
			{id}
			class="ren-field-message__text"
			class:ren-field-message__text--error={!!error}
		>
			{text}
		</span>
	{/if}
</div>

<style>
	.ren-field-message {
		display: grid;
		grid-template-rows: 0fr;
		margin-block-start: 0;
		overflow: hidden;
		transition:
			grid-template-rows var(--ren-duration-base) var(--ren-easing-default),
			margin-block-start var(--ren-duration-base) var(--ren-easing-default);
	}

	.ren-field-message--visible {
		grid-template-rows: 1fr;
		margin-block-start: var(--ren-space-xs);
	}

	.ren-field-message__text {
		min-height: 0;
		overflow: hidden;
		padding-block-start: var(--ren-space-2xs);
		font-size: var(--ren-font-size-xs);
		color: var(--ren-color-text-muted);
	}

	.ren-field-message__text--error {
		font-weight: var(--ren-font-weight-medium);
		color: var(--ren-color-danger);
	}
</style>
