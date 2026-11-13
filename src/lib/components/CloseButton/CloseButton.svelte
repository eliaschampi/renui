<script lang="ts">
	interface Props {
		/** Accessible name (localized by the owner) */
		label: string;
		onclick?: (event: MouseEvent) => void;
		class?: string;
	}

	const { label, onclick, class: className }: Props = $props();
</script>

<!-- Internal: the one dismiss control shared by Alert, Notification and Dialog. -->
<button
	type="button"
	class={['ren-close-button', className]}
	aria-label={label}
	{onclick}
>
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		aria-hidden="true"
	>
		<path d="M18 6 6 18M6 6l12 12" />
	</svg>
</button>

<style>
	.ren-close-button svg {
		inline-size: var(--ren-icon-sm);
		block-size: var(--ren-icon-sm);
	}

	.ren-close-button {
		display: inline-grid;
		flex-shrink: 0;
		place-items: center;
		inline-size: var(--ren-space-xl);
		block-size: var(--ren-space-xl);
		padding: 0;
		background: transparent;
		border: 0;
		border-radius: var(--ren-radius-full);
		/* Follows the surface it sits on: tone ink on an alert, text elsewhere. */
		color: color-mix(in srgb, currentColor 68%, transparent);
		cursor: pointer;
		transition: var(--ren-transition-interactive);
	}

	.ren-close-button:hover {
		background: var(--ren-color-hover);
		color: inherit;
	}

	.ren-close-button:active {
		transform: scale(var(--ren-interactive-press-scale));
	}

	.ren-close-button:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
	}
</style>
