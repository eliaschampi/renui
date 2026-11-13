<script lang="ts">
	import { Dropdown, DropdownItem, SidebarItem } from '../../src/lib';

	let { current = false }: { current?: boolean } = $props();
</script>

<Dropdown placement="right-start">
	{#snippet trigger(props)}
		<SidebarItem {...props} collapsed {current}>
			{#snippet icon()}<span data-glyph></span>{/snippet}
			Workspace
		</SidebarItem>
	{/snippet}
	<DropdownItem href="/workspace/files">Files</DropdownItem>
</Dropdown>
