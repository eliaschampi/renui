<script module lang="ts">
	import type { StatusIndicatorStatus } from './types';

	const NEUTRAL = 'var(--ren-color-text-light)';
	const COLORS: Record<StatusIndicatorStatus, string> = {
		default: NEUTRAL,
		inactive: NEUTRAL,
		active: 'var(--ren-color-success)',
		pending: 'var(--ren-color-warning)',
		primary: 'var(--ren-color-primary)',
		secondary: 'var(--ren-color-secondary)',
		success: 'var(--ren-color-success)',
		warning: 'var(--ren-color-warning)',
		danger: 'var(--ren-color-danger)',
		info: 'var(--ren-color-info)'
	};
</script>

<script lang="ts">
	import type { StatusIndicatorProps } from './types';

	const {
		status = 'default',
		active,
		pulse = false,
		tooltip = '',
		class: className
	}: StatusIndicatorProps = $props();
</script>

<span
	class={[
		'ren-status-indicator',
		pulse && 'ren-status-indicator--pulse',
		className
	]}
	style:--ren-control-accent={COLORS[
		active === undefined ? status : active ? 'active' : 'inactive'
	]}
	role={tooltip ? 'img' : undefined}
	aria-label={tooltip || undefined}
	aria-hidden={tooltip ? undefined : 'true'}
	title={tooltip || undefined}
></span>

<style>
	.ren-status-indicator {
		display: inline-block;
		flex-shrink: 0;
		inline-size: var(--ren-space-xs);
		block-size: var(--ren-space-xs);
		border-radius: var(--ren-radius-full);
		background: var(--ren-control-accent);
		box-shadow: 0 0 0 var(--ren-border-width-thick)
			color-mix(in srgb, var(--ren-control-accent) 18%, transparent);
		transition: background-color var(--ren-duration-fast)
			var(--ren-easing-default);
	}

	.ren-status-indicator--pulse {
		animation: ren-status-pulse var(--ren-duration-pulse)
			var(--ren-easing-in-out) infinite;
	}

	@keyframes ren-status-pulse {
		50% {
			opacity: 0.5;
		}
	}
</style>
