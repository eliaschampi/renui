<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = {
		loading: en.loading,
		noData: en.noData,
		noResults: en.noResults,
		search: en.search,
		tableSelectAll: en.tableSelectAll,
		tableSelectRow: en.tableSelectRow,
		paginationRange: en.paginationRange
	};

	const SKELETON_ROWS = 3;
	const INTERACTIVE =
		'.ren-table__td--select, button, a, label, input, select, textarea, summary, [role="button"], [role="link"], [contenteditable]:not([contenteditable="false"])';

	/** Whether an event started inside a nested control that owns it. */
	function fromControl(event: Event): boolean {
		return (
			event.target instanceof Element && !!event.target.closest(INTERACTIVE)
		);
	}

	function toInteger(value: unknown, min: number, fallback: number): number {
		return typeof value === 'number' && Number.isFinite(value)
			? Math.max(min, Math.floor(value))
			: fallback;
	}
</script>

<script lang="ts" generics="TRow extends object">
	import Inbox from '@lucide/svelte/icons/inbox';
	import Search from '@lucide/svelte/icons/search';
	import '../../styles/skeleton.css';
	import { useRenLocale } from '../../i18n';
	import Checkbox from '../Checkbox/Checkbox.svelte';
	import Icon from '../Icon/Icon.svelte';
	import Input from '../Input/Input.svelte';
	import Pagination from '../Pagination/Pagination.svelte';
	import type { TableProps } from './types';

	let {
		layout = 'auto',
		compact = false,
		stripe = false,
		hover = false,
		search = false,
		selectable = false,
		pagination = false,
		paginationMode = 'client',
		noDataText,
		noResultsText,
		searchPlaceholder,
		data,
		itemsPerPage = 10,
		currentPage = 1,
		totalItems,
		loading = false,
		rowKey,
		selected = $bindable([]),
		class: className = '',
		'aria-label': ariaLabel,
		onrowclick,
		onrowdblclick,
		onrowcontextmenu,
		onrowselect,
		onsearch,
		onpagechange,
		children,
		header,
		thead,
		row
	}: TableProps<TRow> = $props();

	const i18n = useRenLocale(COPY);
	let query = $state('');
	let localPage = $state(1);

	const server = $derived(pagination && paginationMode === 'server');
	const pageSize = $derived(toInteger(itemsPerPage, 1, 1));

	function identity(item: TRow): string | number | TRow {
		const custom = rowKey?.(item);
		if (custom != null) return custom;
		for (const field of ['id', 'key']) {
			const candidate = Reflect.get(item, field);
			if (typeof candidate === 'string' || typeof candidate === 'number') {
				return candidate;
			}
		}
		return item;
	}

	const filtered = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		if (!data || !needle || !search || server) return data ?? [];
		return data.filter((item) =>
			Object.values(item).some((cell) =>
				String(cell).toLowerCase().includes(needle)
			)
		);
	});
	const total = $derived(
		server && totalItems != null ? toInteger(totalItems, 0, 0) : filtered.length
	);
	const pages = $derived(Math.ceil(total / pageSize));
	const page = $derived(
		Math.min(
			Math.max(1, toInteger(server ? currentPage : localPage, 1, 1)),
			Math.max(1, pages)
		)
	);
	const rows = $derived(
		pagination && !server
			? filtered.slice((page - 1) * pageSize, page * pageSize)
			: filtered
	);

	const selectedKeys = $derived(new Set(selected.map(identity)));
	const isSelected = (item: TRow) => selectedKeys.has(identity(item));
	const pageSelected = $derived(
		selectable ? rows.filter(isSelected).length : 0
	);

	const primaryAction = $derived(onrowclick ?? onrowdblclick);
	const keyboardRows = $derived(!!primaryAction || !!onrowcontextmenu);
	const emptyText = $derived(
		search && query.trim()
			? (noResultsText ?? i18n.t.noResults)
			: (noDataText ?? i18n.t.noData)
	);

	function goTo(next: number): void {
		if (!server) localPage = next;
		onpagechange?.(next);
	}

	function handleSearch(): void {
		onsearch?.(query.trim());
		if (pagination && page !== 1) goTo(1);
	}

	function toggleAll(checked: boolean): void {
		const changed = rows.filter((item) => isSelected(item) !== checked);
		if (checked) {
			selected = [...selected, ...changed];
		} else {
			const keys = new Set(changed.map(identity));
			selected = selected.filter((item) => !keys.has(identity(item)));
		}
		for (const item of changed) onrowselect?.(item, checked);
	}

	function toggleRow(item: TRow, checked: boolean): void {
		const key = identity(item);
		selected = checked
			? [...selected, item]
			: selected.filter((entry) => identity(entry) !== key);
		onrowselect?.(item, checked);
	}

	function handleRowKeydown(event: KeyboardEvent, item: TRow, index: number) {
		if (event.defaultPrevented || fromControl(event)) return;
		if (
			onrowcontextmenu &&
			(event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))
		) {
			event.preventDefault();
			const target = event.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();
			target.dispatchEvent(
				new MouseEvent('contextmenu', {
					bubbles: true,
					cancelable: true,
					clientX: rect.left,
					clientY: rect.bottom
				})
			);
		} else if (primaryAction && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			primaryAction(item, index);
		}
	}

	function handleContextMenu(event: MouseEvent, item: TRow, index: number) {
		if (!onrowcontextmenu || event.defaultPrevented || fromControl(event)) {
			return;
		}
		event.preventDefault();
		onrowcontextmenu(event, item, index);
	}

	// Server pages beyond the end (e.g. last row deleted) request the last one.
	$effect(() => {
		if (server && pages > 0 && page !== toInteger(currentPage, 1, 1)) {
			onpagechange?.(page);
		}
	});

	// Keep local paging inside the range as data shrinks.
	$effect(() => {
		if (pagination && !server && localPage !== page) localPage = page;
	});
</script>

<div
	class={[
		'ren-table',
		layout === 'fixed' && 'ren-table--layout-fixed',
		compact && 'ren-table--compact',
		stripe && 'ren-table--stripe',
		hover && 'ren-table--hover',
		className
	]}
>
	{#if search || header}
		<div class="ren-table__header">
			{@render header?.()}
			{#if search}
				<Input
					bind:value={query}
					type="search"
					size="sm"
					icon={Search}
					placeholder={searchPlaceholder ?? i18n.t.search}
					class="ren-table__search"
					oninput={handleSearch}
				/>
			{/if}
		</div>
	{/if}

	<div class="ren-table__wrapper" aria-busy={loading || undefined}>
		<table class="ren-table__content" aria-label={ariaLabel}>
			{#if selectable || thead}
				<thead class="ren-table__thead">
					<tr>
						{#if selectable}
							<th class="ren-table__th ren-table__th--select" scope="col">
								<Checkbox
									aria-label={i18n.t.tableSelectAll}
									checked={pageSelected > 0 && pageSelected === rows.length}
									indeterminate={pageSelected > 0 && pageSelected < rows.length}
									size="sm"
									disabled={loading}
									onchange={toggleAll}
								/>
							</th>
						{/if}
						{@render thead?.()}
					</tr>
				</thead>
			{/if}
			<tbody class="ren-table__tbody">
				{#if loading}
					<!-- Skeleton rows render below the table, keeping column widths. -->
				{:else if data}
					{#each rows as item, index (identity(item))}
						{@const checked = isSelected(item)}
						<tr
							class={[
								'ren-table__row',
								checked && 'ren-table__row--selected',
								primaryAction && 'ren-table__row--clickable'
							]}
							tabindex={keyboardRows ? 0 : undefined}
							onclick={(event) => {
								if (!event.defaultPrevented && !fromControl(event)) {
									onrowclick?.(item, index);
								}
							}}
							ondblclick={(event) => {
								if (!event.defaultPrevented && !fromControl(event)) {
									onrowdblclick?.(item, index);
								}
							}}
							oncontextmenu={(event) => handleContextMenu(event, item, index)}
							onkeydown={(event) => handleRowKeydown(event, item, index)}
						>
							{#if selectable}
								<td class="ren-table__td ren-table__td--select">
									<Checkbox
										aria-label={i18n.t.tableSelectRow(index + 1)}
										{checked}
										size="sm"
										onchange={(next) => toggleRow(item, next)}
									/>
								</td>
							{/if}
							{#if row}
								{@render row({ row: item, index })}
							{:else}
								{#each Object.entries(item) as [field, cell] (field)}
									{#if field !== 'id' && field !== 'key'}
										<td class="ren-table__td">{cell}</td>
									{/if}
								{/each}
							{/if}
						</tr>
					{/each}
				{:else}
					{@render children?.()}
				{/if}
			</tbody>
		</table>

		{#if loading}
			<div class="ren-table__loading" role="status">
				<span class="ren-sr-only">{i18n.t.loading}</span>
				{#each { length: SKELETON_ROWS }, index (index)}
					<span class="ren-skeleton ren-skeleton--text" aria-hidden="true"
					></span>
				{/each}
			</div>
		{:else if data && total === 0}
			<div class="ren-table__empty" role="status">
				<span class="ren-table__empty-icon" aria-hidden="true">
					<Icon icon={Inbox} size="xl" />
				</span>
				{emptyText}
			</div>
		{/if}
	</div>

	{#if pagination && total > 0}
		<div class="ren-table__footer">
			<span class="ren-table__range">
				{i18n.t.paginationRange(
					(page - 1) * pageSize + 1,
					Math.min(page * pageSize, total),
					total
				)}
			</span>
			{#if pages > 1}
				<Pagination
					{page}
					{pages}
					disabled={loading}
					class="ren-table__pagination"
					onpagechange={goTo}
				/>
			{/if}
		</div>
	{/if}
</div>

<style>
	.ren-table {
		--ren-table-column-main-width: 48%;
		--ren-table-column-main-min-width: 10rem;
		--ren-table-column-actions-width: calc(
			var(--ren-space-6xl) + var(--ren-space-xl)
		);
		--ren-table-column-compact-width: calc(
			var(--ren-space-6xl) + var(--ren-space-2xs)
		);
		--ren-table-cell-padding: var(--ren-space-md) var(--ren-space-lg);
		--ren-table-cell-font: var(--ren-font-size-sm);
		--ren-table-row-hover: color-mix(
			in srgb,
			var(--ren-color-text) var(--ren-state-hover-strength),
			var(--ren-color-surface-card)
		);
		--ren-table-row-selected: var(--ren-color-primary-bg);
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-md);
		inline-size: 100%;
		min-inline-size: 0;
		font-family: var(--ren-font-family-sans);
	}

	.ren-table--compact {
		--ren-table-cell-padding: var(--ren-space-sm) var(--ren-space-md);
		--ren-table-cell-font: var(--ren-font-size-xs);
	}

	/* Header toolbar: wraps to a column on its own when space runs out. */
	.ren-table__header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--ren-space-md);
	}

	.ren-table__header :global(.ren-table__search) {
		flex: 1 1 var(--ren-min-width-md);
		max-inline-size: var(--ren-centered-card-width-sm);
	}

	.ren-table__wrapper {
		position: relative;
		inline-size: 100%;
		overflow-x: auto;
		background: var(--ren-color-surface-card);
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		border-radius: var(--ren-surface-radius);
		box-shadow: var(--ren-shadow-sm);
	}

	.ren-table__content {
		inline-size: 100%;
		border-collapse: collapse;
	}

	.ren-table--layout-fixed .ren-table__content {
		table-layout: fixed;
		/* Honor column minimums; the wrapper scrolls past 100%. */
		min-inline-size: max(100%, min-content);
	}

	.ren-table--layout-fixed :global(.ren-table-column--main) {
		inline-size: var(--ren-table-column-main-width);
		min-inline-size: var(--ren-table-column-main-min-width);
	}

	.ren-table--layout-fixed :global(th.ren-table-column--actions) {
		inline-size: var(--ren-table-column-actions-width);
	}

	.ren-table--layout-fixed :global(th.ren-table-column--compact) {
		inline-size: var(--ren-table-column-compact-width);
	}

	.ren-table__thead {
		background: var(--ren-color-surface-inset);
		border-block-end: var(--ren-border-width-thin) solid var(--ren-color-border);
	}

	.ren-table__th,
	.ren-table__thead :global(th) {
		padding: var(--ren-table-cell-padding);
		font-size: var(--ren-font-size-xs);
		font-weight: var(--ren-font-weight-semibold);
		letter-spacing: var(--ren-letter-spacing-wide);
		color: var(--ren-color-text-muted);
		text-align: start;
		white-space: nowrap;
	}

	.ren-table__td,
	.ren-table__tbody :global(td) {
		padding: var(--ren-table-cell-padding);
		font-size: var(--ren-table-cell-font);
		color: var(--ren-color-text);
		vertical-align: middle;
	}

	.ren-table__th--select,
	.ren-table__td--select {
		inline-size: var(--ren-space-3xl);
		padding-inline-end: var(--ren-space-xs);
		text-align: center;
	}

	/* Rows: hairline separators; neutral wash on hover, soft tone when selected. */
	.ren-table__row {
		border-block-end: var(--ren-border-width-thin) solid
			var(--ren-color-border-light);
		transition: var(--ren-transition-control);
	}

	.ren-table__row:last-child {
		border-block-end: 0;
	}

	.ren-table__row--clickable {
		cursor: pointer;
	}

	.ren-table__row:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: calc(var(--ren-border-width-thick) * -1);
	}

	.ren-table--hover .ren-table__row:hover {
		background: var(--ren-table-row-hover);
	}

	.ren-table--stripe .ren-table__row:nth-child(even) {
		background: color-mix(
			in srgb,
			var(--ren-color-text) 4%,
			var(--ren-color-surface-card)
		);
	}

	.ren-table .ren-table__row.ren-table__row--selected {
		background: var(--ren-table-row-selected);
	}

	.ren-table__loading {
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-md);
		padding: var(--ren-table-cell-padding);
	}

	/* Empty state */
	.ren-table__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--ren-space-md);
		padding: var(--ren-space-4xl) var(--ren-space-lg);
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-medium);
		color: var(--ren-color-text-muted);
	}

	.ren-table__empty-icon {
		display: inline-grid;
		place-items: center;
		padding: var(--ren-space-sm);
		color: var(--ren-color-primary);
		background: var(--ren-color-primary-bg);
		border-radius: var(--ren-radius-full);
	}

	/* Footer: range on the start edge, pages on the end edge; wraps naturally. */
	.ren-table__footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--ren-space-sm) var(--ren-space-md);
	}

	.ren-table__range {
		font-size: var(--ren-font-size-xs);
		color: var(--ren-color-text-muted);
	}

	/* The pagination is an inline-size container, so it has no intrinsic width
	   for `flex-wrap` to see: the basis is what sends it to its own line. */
	.ren-table__footer :global(.ren-table__pagination) {
		flex: 1 1 19rem;
		inline-size: auto;
		justify-content: flex-end;
	}
</style>
