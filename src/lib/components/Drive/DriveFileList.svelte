<script module lang="ts">
	import { renDriveEn } from '../../i18n/drive';

	const COPY = renDriveEn;
</script>

<script lang="ts">
	import { Icon } from '../Icon';
	import { useRenLocale } from '../../i18n';
	import { Table } from '../Table';
	import {
		driveTagColorCssVar,
		formatFileSize,
		formatDriveDate,
		getDriveTagByHash,
		getDriveTypeLabel,
		getFileColor,
		getFileIcon,
		type DriveDateFormatter
	} from '../../utils/drive';
	import type { DriveFileItem } from './types';

	interface Props {
		files: DriveFileItem[];
		selectedFiles: string[];
		isTrash?: boolean;
		onfileclick?: (file: DriveFileItem) => void;
		onfiledblclick?: (file: DriveFileItem) => void;
		onfilecontextmenu?: (event: MouseEvent, file: DriveFileItem) => void;
		onfiledragstart?: (event: DragEvent, file: DriveFileItem) => void;
		onfiledragend?: () => void;
		onfiledrop?: (event: DragEvent, file: DriveFileItem) => void;
		formatDate?: DriveDateFormatter;
	}

	const {
		files,
		selectedFiles,
		isTrash = false,
		onfileclick,
		onfiledblclick,
		onfilecontextmenu,
		onfiledragstart,
		onfiledragend,
		onfiledrop,
		formatDate
	}: Props = $props();

	const i18n = useRenLocale(COPY);

	const selectedFileSet = $derived(new Set(selectedFiles));
	const selectedRows = $derived(
		files.filter((file) => selectedFileSet.has(file.code))
	);

	function getRowKey(file: DriveFileItem): string {
		return file.code;
	}

	function handleDragStart(event: DragEvent, file: DriveFileItem) {
		if (isTrash) return;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('application/json', JSON.stringify(file));
		}
		onfiledragstart?.(event, file);
	}

	function handleDragOver(event: DragEvent, file: DriveFileItem) {
		event.preventDefault();
		if (file.type === 'dir' && !isTrash && event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(event: DragEvent, file: DriveFileItem) {
		event.preventDefault();
		if (file.type !== 'dir' || isTrash) {
			return;
		}
		onfiledrop?.(event, file);
	}
</script>

<Table
	data={files}
	rowKey={getRowKey}
	selected={selectedRows}
	layout="fixed"
	hover
	onrowclick={onfileclick}
	onrowdblclick={onfiledblclick}
	onrowcontextmenu={onfilecontextmenu}
>
	{#snippet thead()}
		<th class="ren-table-column--main">{i18n.t.driveColumnName}</th>
		<th class="ren-table-column--compact">{i18n.t.driveColumnType}</th>
		<th class="ren-table-column--compact">{i18n.t.driveColumnSize}</th>
		<th class="ren-table-column--compact">{i18n.t.driveColumnModified}</th>
	{/snippet}

	{#snippet row({ row })}
		{@const file = row}
		{@const tagOption = getDriveTagByHash(file.tag, i18n.t)}
		<td
			class="ren-table-column--main"
			draggable={!isTrash}
			ondragstart={(event) => handleDragStart(event, file)}
			ondragend={() => onfiledragend?.()}
			ondragover={(event) => handleDragOver(event, file)}
			ondrop={(event) => handleDrop(event, file)}
		>
			<div class="ren-drive-file-list__name-content">
				<Icon
					icon={getFileIcon(file.type)}
					size="sm"
					color={getFileColor(file.type)}
				/>
				<span class="ren-drive-file-list__name-text" title={file.name}
					>{file.name}</span
				>
				{#if tagOption}
					<span
						class="ren-drive-file-list__tag"
						style:--drive-tag-color={driveTagColorCssVar(tagOption.color)}
					></span>
				{/if}
			</div>
		</td>
		<td>
			<span class="ren-drive-file-list__meta"
				>{getDriveTypeLabel(file.type, i18n.t)}</span
			>
		</td>
		<td>
			<span class="ren-drive-file-list__meta">
				{file.type === 'dir' ? '—' : formatFileSize(file.size)}
			</span>
		</td>
		<td>
			<span class="ren-drive-file-list__meta"
				>{formatDate
					? formatDate(file.updated_at)
					: formatDriveDate(file.updated_at, i18n)}</span
			>
		</td>
	{/snippet}
</Table>

<style>
	.ren-drive-file-list__name-content {
		display: flex;
		align-items: center;
		gap: var(--ren-space-xs);
		width: 100%;
		min-width: 0;
		padding: var(--ren-space-2xs);
		border: none;
		background: transparent;
		color: var(--ren-color-text);
		text-align: left;
		font: inherit;
	}

	.ren-drive-file-list__name-text {
		flex: 1 1 auto;
		min-width: 0;
		display: -webkit-box;
		overflow: hidden;
		overflow-wrap: anywhere;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.ren-drive-file-list__meta {
		color: var(--ren-color-text-muted);
		font-size: var(--ren-font-size-sm);
	}

	.ren-drive-file-list__tag {
		width: var(--ren-drive-tag-dot-size);
		height: var(--ren-drive-tag-dot-size);
		border-radius: var(--ren-radius-full);
		flex-shrink: 0;
		background: var(--drive-tag-color, var(--ren-color-border));
	}
</style>
