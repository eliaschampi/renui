<script lang="ts">
	import { DropdownItem } from '../Dropdown';
	import type { ContextItemProps } from './types';

	const {
		title = '',
		icon,
		shortcut = '',
		disabled = false,
		color,
		class: className = '',
		onclick
	}: ContextItemProps = $props();
</script>

<!-- Same menu-item recipe as DropdownItem; Context closes on item click. -->
<DropdownItem
	{icon}
	{color}
	{disabled}
	class="ren-context-item {className}"
	{onclick}
>
	<span class="ren-context-item__title">{title}</span>
	{#if shortcut}
		<kbd class="ren-context-item__shortcut">{shortcut}</kbd>
	{/if}
</DropdownItem>

<style>
	.ren-context-item__title {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ren-context-item__shortcut {
		color: var(--ren-color-text-muted);
		font-family: inherit;
		font-size: var(--ren-font-size-xs);
	}
</style>
