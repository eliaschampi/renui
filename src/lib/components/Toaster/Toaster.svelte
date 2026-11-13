<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = {
		notifications: en.notifications,
		notificationDismiss: en.notificationDismiss
	};
</script>

<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { DURATION_BASE, motion } from '../config';
	import StatusSurface from '../Notification/StatusSurface.svelte';
	import { useRenLocale } from '../../i18n';
	import { liveRegion } from '../../utils/modal';
	import type { ToasterProps } from './types';

	const {
		toaster,
		placement = 'top-end',
		class: className
	}: ToasterProps = $props();

	const i18n = useRenLocale(COPY);
</script>

<!-- One persistent polite region announces each toast once as it is added;
     it joins the top open modal so announcements stay reachable. Items
     animate here, so dismiss, clear and overflow all leave the same way. -->
<section
	use:liveRegion
	class={['ren-toaster', `ren-toaster--${placement}`, className]}
	aria-label={i18n.t.notifications}
	aria-live="polite"
>
	{#each toaster.items as toast (toast.id)}
		{@const color = toast.color ?? 'primary'}
		<div
			animate:flip={{ duration: motion(DURATION_BASE) }}
			transition:fly={{ y: 12, duration: motion(DURATION_BASE) }}
		>
			<StatusSurface
				floating
				{color}
				title={toast.title}
				message={toast.message}
				duration={toast.duration}
				closeLabel={toast.closable === false
					? undefined
					: i18n.t.notificationDismiss}
				onclose={() => toaster.dismiss(toast.id)}
				onexpire={() => toaster.dismiss(toast.id)}
			/>
		</div>
	{/each}
</section>

<style>
	.ren-toaster {
		position: fixed;
		inset-block-start: var(--ren-space-lg);
		inset-inline-end: var(--ren-space-lg);
		z-index: var(--ren-z-toast);
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-sm);
		inline-size: min(
			100vw - var(--ren-space-lg) * 2,
			var(--ren-toast-portal-max-width)
		);
		pointer-events: none;
	}

	.ren-toaster > * {
		pointer-events: auto;
	}

	.ren-toaster--bottom-end,
	.ren-toaster--bottom-center {
		inset-block: auto var(--ren-space-lg);
	}

	.ren-toaster--top-center,
	.ren-toaster--bottom-center {
		inset-inline: 0;
		margin-inline: auto;
	}

	@media (max-width: 48rem) {
		.ren-toaster {
			inset-inline: var(--ren-space-md);
			inline-size: auto;
		}
	}
</style>
