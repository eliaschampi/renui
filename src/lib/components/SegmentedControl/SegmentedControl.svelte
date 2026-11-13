<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { options: en.options };
</script>

<script lang="ts">
	import '../../styles/switcher.css';
	import '../../styles/switcher-group.css';
	import { useRenLocale } from '../../i18n';
	import Icon from '../Icon/Icon.svelte';
	import type { SegmentedControlProps } from './types';

	let {
		value = $bindable(),
		options,
		color = 'primary',
		size = 'md',
		disabled = false,
		fullWidth = false,
		orientation = 'horizontal',
		iconOnly = false,
		clearable = false,
		class: className = '',
		'aria-label': ariaLabel,
		onchange
	}: SegmentedControlProps = $props();

	let root: HTMLDivElement | undefined = $state();

	const i18n = useRenLocale(COPY);
	const uid = $props.id();
	const name = `ren-sc-${uid}`;

	function select(next: string | number): void {
		value = next;
		onchange?.(next);
	}

	function handleClick(event: MouseEvent, optionValue: string | number): void {
		if (!clearable || value !== optionValue) return;
		event.preventDefault();
		select('');
	}

	// Keep the active segment visible inside an overflowing track only;
	// scrollIntoView would also scroll the page.
	$effect(() => {
		void value;
		const track = root;
		const option = track?.querySelector<HTMLElement>(
			'.ren-switcher__option--active'
		);
		if (!track || !option || track.scrollWidth <= track.clientWidth) return;
		const box = option.getBoundingClientRect();
		const offset = box.left - track.getBoundingClientRect().left;
		track.scrollTo({
			left: track.scrollLeft + offset - (track.clientWidth - box.width) / 2
		});
	});
</script>

<div
	bind:this={root}
	class={[
		'ren-switcher',
		'ren-segmented-control',
		size === 'sm' && 'ren-switcher--sm',
		orientation === 'vertical' && 'ren-switcher--vertical',
		disabled && 'ren-switcher--disabled',
		fullWidth && 'ren-switcher--full',
		iconOnly && 'ren-segmented-control--icon-only',
		`ren-tone ren-tone--${color}`,
		className
	]}
	role="radiogroup"
	aria-label={ariaLabel ?? i18n.t.options}
	aria-orientation={orientation}
>
	{#each options as option (option.value)}
		<label
			class={[
				'ren-switcher__option',
				value === option.value && 'ren-switcher__option--active',
				option.disabled && 'ren-switcher__option--disabled'
			]}
		>
			<input
				type="radio"
				class="ren-sr-only"
				{name}
				value={option.value}
				checked={value === option.value}
				disabled={disabled || option.disabled}
				aria-label={option.ariaLabel ??
					(option.label ? undefined : String(option.value))}
				onclick={(event) => handleClick(event, option.value)}
				onchange={() => select(option.value)}
			/>
			{#if option.icon}
				<Icon icon={option.icon} size="sm" />
			{/if}
			{#if option.label}
				<span class="ren-switcher__label">{option.label}</span>
			{/if}
		</label>
	{/each}
</div>

<style>
	/* Shell, options and active pill come from the shared .ren-switcher recipe. */
	.ren-segmented-control--icon-only > .ren-switcher__option {
		padding: var(--ren-segmented-control-icon-only-padding);
	}

	@media (max-width: 48rem) {
		.ren-segmented-control.ren-switcher--full:not(.ren-switcher--vertical)
			> .ren-switcher__option {
			flex: 1 0 max-content;
			min-width: max-content;
			padding: var(--ren-space-xs) var(--ren-space-sm);
		}
	}
</style>
