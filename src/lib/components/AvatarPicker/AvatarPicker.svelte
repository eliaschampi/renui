<script lang="ts">
	import type { AvatarPickerProps } from './types';

	const uid = $props.id();

	let {
		options,
		value = $bindable(),
		name = `ren-avatar-${uid}`,
		'aria-label': ariaLabel,
		class: className
	}: AvatarPickerProps = $props();
</script>

<div
	class={['ren-avatar-picker', className]}
	role="radiogroup"
	aria-label={ariaLabel}
>
	{#each options as option (option.value)}
		<label class="ren-avatar-picker__option">
			<input
				type="radio"
				{name}
				value={option.value}
				checked={value === option.value}
				onchange={() => (value = option.value)}
				class="ren-sr-only"
			/>
			<span
				class="ren-avatar-picker__image"
				class:ren-avatar-picker__image--selected={value === option.value}
			>
				<img
					src={option.src}
					alt={option.label}
					loading="lazy"
					decoding="async"
				/>
			</span>
		</label>
	{/each}
</div>

<style>
	.ren-avatar-picker {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ren-space-sm);
		justify-content: center;
	}

	.ren-avatar-picker__option {
		cursor: pointer;
	}

	.ren-avatar-picker__image {
		width: var(--ren-space-4xl);
		height: var(--ren-space-4xl);
		border-radius: var(--ren-radius-full);
		overflow: hidden;
		border: var(--ren-border-width-thick) solid var(--ren-color-border);
		transition: var(--ren-transition-interactive);
		transform: scale(1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ren-avatar-picker__image:hover {
		border-color: var(--ren-color-primary);
		transform: scale(var(--ren-interactive-hover-scale));
	}

	.ren-avatar-picker__image--selected {
		border-color: var(--ren-color-primary);
		transform: scale(var(--ren-interactive-zoom-scale));
	}

	input:focus-visible + .ren-avatar-picker__image {
		box-shadow: var(--ren-control-focus-shadow);
	}

	.ren-avatar-picker__image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
