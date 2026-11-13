<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = { tabs: en.tabs };
</script>

<script lang="ts">
	import '../../styles/switcher.css';
	import { useRenLocale } from '../../i18n';
	import { rovingIndex } from '../../utils/roving';
	import Icon from '../Icon/Icon.svelte';
	import type { TabsProps } from './types';

	let {
		value = $bindable(),
		tabs = [],
		color = 'primary',
		orientation = 'horizontal',
		'aria-label': ariaLabel,
		class: className = '',
		children,
		onchange
	}: TabsProps = $props();

	const i18n = useRenLocale(COPY);
	const uid = $props.id();
	const tabId = (index: number) => `ren-tabs-${uid}-tab-${index}`;
	const panelId = (index: number) => `ren-tabs-${uid}-panel-${index}`;

	// An unknown or disabled `value` falls back to the first enabled tab, so SSR
	// renders a selected tab and the tablist always keeps one tab stop.
	const active = $derived(
		tabs.some((tab) => tab.value === value && !tab.disabled)
			? value
			: tabs.find((tab) => !tab.disabled)?.value
	);
	const activeIndex = $derived(tabs.findIndex((tab) => tab.value === active));
	const managedPanels = $derived(tabs.some((tab) => tab.content));

	function selectTab(next: string | number): void {
		if (active === next) return;
		const previous = active;
		value = next;
		onchange?.(next, previous);
	}

	function handleKeydown(event: KeyboardEvent): void {
		const enabled = tabs.flatMap((tab, index) => (tab.disabled ? [] : [index]));
		const at = rovingIndex(
			event,
			enabled.indexOf(activeIndex),
			enabled.length,
			orientation === 'vertical'
		);
		if (at === undefined) return;

		event.preventDefault();
		selectTab(tabs[enabled[at]].value);
		document.getElementById(tabId(enabled[at]))?.focus();
	}
</script>

<div
	class={[
		'ren-tabs',
		`ren-tabs--${orientation}`,
		`ren-tone ren-tone--${color}`,
		className
	]}
>
	<div
		class={[
			'ren-switcher',
			'ren-tabs__nav',
			orientation === 'vertical' && 'ren-switcher--vertical'
		]}
		role="tablist"
		aria-orientation={orientation}
		aria-label={ariaLabel ?? i18n.t.tabs}
	>
		{#each tabs as tab, index (tab.value)}
			<button
				id={tabId(index)}
				type="button"
				role="tab"
				class={[
					'ren-switcher__option',
					'ren-tabs__tab',
					active === tab.value && 'ren-switcher__option--active',
					tab.disabled && 'ren-switcher__option--disabled'
				]}
				aria-controls={managedPanels || index === activeIndex
					? panelId(index)
					: undefined}
				disabled={tab.disabled}
				aria-selected={active === tab.value}
				tabindex={active === tab.value ? 0 : -1}
				onclick={() => selectTab(tab.value)}
				onkeydown={handleKeydown}
			>
				{#if tab.icon}
					<Icon icon={tab.icon} size="md" />
				{/if}
				{#if tab.label}
					<span>{tab.label}</span>
				{/if}
			</button>
		{/each}
	</div>

	<div
		id={!managedPanels && activeIndex >= 0 ? panelId(activeIndex) : undefined}
		class="ren-tabs__content"
		role={!managedPanels ? 'tabpanel' : undefined}
		aria-labelledby={!managedPanels && activeIndex >= 0
			? tabId(activeIndex)
			: undefined}
	>
		{#if managedPanels}
			{#each tabs as tab, index (tab.value)}
				<div
					id={panelId(index)}
					role="tabpanel"
					aria-labelledby={tabId(index)}
					hidden={active !== tab.value}
				>
					{@render tab.content?.()}
				</div>
			{/each}
		{:else if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	/* Nav shell, tabs and active pill come from the shared .ren-switcher recipe. */
	.ren-tabs {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.ren-tabs--horizontal .ren-tabs__nav {
		display: flex;
		width: 100%;
		min-width: 0;
	}

	.ren-tabs--horizontal .ren-tabs__tab {
		flex: 1 1 0;
	}

	.ren-tabs--vertical {
		flex-direction: row;
		gap: var(--ren-space-md);
	}

	.ren-tabs--vertical .ren-tabs__nav {
		min-width: calc(var(--ren-space-5xl) * 2 + var(--ren-space-md));
	}

	.ren-tabs__content {
		flex: 1;
		padding-top: var(--ren-space-md);
	}

	.ren-tabs--vertical .ren-tabs__content {
		padding-top: var(--ren-space-2xs);
	}

	@media (max-width: 48rem) {
		.ren-tabs--vertical {
			flex-direction: column;
		}

		.ren-tabs--vertical .ren-tabs__nav {
			min-width: auto;
			margin-bottom: var(--ren-space-sm);
		}

		.ren-tabs--vertical .ren-tabs__content {
			padding-top: var(--ren-space-sm);
		}

		.ren-tabs__tab {
			padding: var(--ren-space-xs) var(--ren-space-sm);
		}
	}
</style>
