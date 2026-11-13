<script module lang="ts">
	import { renDriveEn } from '../../i18n/drive';

	const COPY = renDriveEn;
</script>

<script lang="ts">
	import { Icon } from '../Icon';
	import { useRenLocale } from '../../i18n';
	import { Image } from '../Image';
	import {
		driveTagColorCssVar,
		formatFileSize,
		getDriveServeUrl,
		getDriveTagByHash,
		getDriveTypeLabel,
		getFileColor,
		getFileIcon,
		type DriveServeUrlResolver
	} from '../../utils/drive';
	import type { DriveFileItem } from './types';

	interface Props {
		file: DriveFileItem;
		selected?: boolean;
		isTrash?: boolean;
		onclick?: (file: DriveFileItem) => void;
		ondblclick?: (file: DriveFileItem) => void;
		oncontextmenu?: (event: MouseEvent, file: DriveFileItem) => void;
		ondragstart?: (event: DragEvent, file: DriveFileItem) => void;
		ondragend?: () => void;
		ondrop?: (event: DragEvent, file: DriveFileItem) => void;
		serveUrl?: DriveServeUrlResolver;
	}

	const {
		file,
		selected = false,
		isTrash = false,
		onclick,
		ondblclick,
		oncontextmenu,
		ondragstart,
		ondragend,
		ondrop,
		serveUrl = getDriveServeUrl
	}: Props = $props();

	const i18n = useRenLocale(COPY);
	let isDragging = $state(false);
	let isDropTarget = $state(false);
	let dragCounter = $state(0);
	let longPressTimer: ReturnType<typeof setTimeout> | undefined;
	let longPressTriggered = false;
	const tagOption = $derived(getDriveTagByHash(file.tag, i18n.t));
	const previewUrl = $derived(
		file.type === 'img' ? serveUrl(file.code, { variant: 'thumb' }) : ''
	);
	const typeLabel = $derived(getDriveTypeLabel(file.type, i18n.t));

	const cardClasses = $derived([
		'ren-drive-file-card',
		selected && 'ren-drive-file-card--selected',
		isDragging && 'ren-drive-file-card--dragging',
		isDropTarget && file.type === 'dir' && 'ren-drive-file-card--drop-target'
	]);

	function handleClick() {
		if (longPressTriggered) {
			longPressTriggered = false;
			return;
		}
		onclick?.(file);
	}

	function handleDblClick() {
		ondblclick?.(file);
	}

	function handleContextMenu(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		oncontextmenu?.(event, file);
	}

	function handleDragStart(event: DragEvent) {
		if (isTrash) return;
		isDragging = true;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('application/json', JSON.stringify(file));
		}
		ondragstart?.(event, file);
	}

	function handleDragEnd() {
		isDragging = false;
		isDropTarget = false;
		dragCounter = 0;
		ondragend?.();
	}

	function handleDragEnter() {
		if (file.type === 'dir' && !isTrash && !isDragging) {
			dragCounter += 1;
			isDropTarget = true;
		}
	}

	function handleDragLeave() {
		if (file.type === 'dir' && !isTrash) {
			dragCounter -= 1;
			if (dragCounter <= 0) {
				dragCounter = 0;
				isDropTarget = false;
			}
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();

		if (!event.dataTransfer) {
			return;
		}

		if (file.type === 'dir' && !isTrash && !isDragging) {
			event.dataTransfer.dropEffect = 'move';
		} else {
			event.dataTransfer.dropEffect = 'none';
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();

		if (file.type !== 'dir' || isTrash || isDragging) {
			return;
		}

		dragCounter = 0;
		isDropTarget = false;
		ondrop?.(event, file);
	}

	function handleTouchStart(event: TouchEvent) {
		if (isTrash) return;

		longPressTriggered = false;
		longPressTimer = setTimeout(() => {
			longPressTriggered = true;
			const touch = event.touches[0];
			if (!touch) return;

			const syntheticEvent = new MouseEvent('contextmenu', {
				bubbles: true,
				cancelable: true,
				clientX: touch.clientX,
				clientY: touch.clientY
			});

			oncontextmenu?.(syntheticEvent, file);
		}, 600);
	}

	function clearLongPress() {
		if (longPressTimer !== undefined) {
			clearTimeout(longPressTimer);
			longPressTimer = undefined;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleDblClick();
		}
	}
</script>

<button
	type="button"
	class={cardClasses}
	aria-pressed={selected}
	draggable={!isTrash}
	onclick={handleClick}
	ondblclick={handleDblClick}
	oncontextmenu={handleContextMenu}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
	ondragover={handleDragOver}
	ondrop={handleDrop}
	ontouchstart={handleTouchStart}
	ontouchend={clearLongPress}
	ontouchmove={clearLongPress}
	onkeydown={handleKeydown}
>
	<div class="ren-drive-file-card__preview">
		{#if file.type === 'img'}
			<Image
				class="ren-drive-file-card__image"
				src={previewUrl}
				alt={file.name}
				loading="lazy"
				fetchpriority="low"
				radius="none"
				errorLabel={file.name}
			/>
		{:else}
			<div class="ren-drive-file-card__icon-scene">
				<Icon
					icon={getFileIcon(file.type)}
					size="var(--ren-drive-file-icon-size)"
					color={getFileColor(file.type)}
				/>
			</div>
		{/if}
		<span class="ren-drive-file-card__kind">{typeLabel}</span>
		{#if tagOption}
			<span class="ren-drive-file-card__tag">
				<span
					class="ren-drive-file-card__tag-dot"
					style:--drive-tag-color={driveTagColorCssVar(tagOption.color)}
				></span>
			</span>
		{/if}
	</div>

	<div class="ren-drive-file-card__content">
		<div class="ren-drive-file-card__name" title={file.name}>
			{file.name}
		</div>
		<div class="ren-drive-file-card__meta">
			<span class="ren-drive-file-card__type">{typeLabel}</span>
			{#if file.type !== 'dir'}
				<span class="ren-drive-file-card__separator">•</span>
				<span class="ren-drive-file-card__size"
					>{formatFileSize(file.size)}</span
				>
			{/if}
		</div>
	</div>
</button>

<style>
	.ren-drive-file-card {
		--drive-file-card-padding: var(--ren-drive-file-card-padding);
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--ren-space-xs);
		width: 100%;
		min-width: 0;
		padding: var(--drive-file-card-padding);
		background: var(--ren-color-surface-card);
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		border-radius: var(--ren-surface-radius);
		cursor: pointer;
		transition:
			transform var(--ren-duration-fast) var(--ren-easing-default),
			box-shadow var(--ren-duration-fast) var(--ren-easing-default),
			border-color var(--ren-duration-fast) var(--ren-easing-default),
			background-color var(--ren-duration-fast) var(--ren-easing-default);
		text-align: left;
		position: relative;
		overflow: hidden;
		box-shadow: var(--ren-shadow-sm);
	}

	.ren-drive-file-card:hover {
		transform: translateY(var(--ren-interactive-lift));
		border-color: var(--ren-color-border-interactive);
		background: var(--ren-color-surface-card-hover);
		box-shadow: var(--ren-shadow-md);
	}

	.ren-drive-file-card:focus-visible {
		outline: none;
		border-color: var(--ren-color-border-interactive);
		box-shadow: var(--ren-focus-ring), var(--ren-shadow-md);
	}

	.ren-drive-file-card--selected {
		border-color: var(--ren-color-primary);
		background: var(--ren-color-primary-bg);
		box-shadow: var(--ren-shadow-md);
	}

	.ren-drive-file-card--dragging {
		opacity: 0.5;
	}

	.ren-drive-file-card--drop-target {
		border: var(--ren-border-width-thin) dashed var(--ren-color-primary);
		background: var(--ren-color-primary-bg);
		transform: scale(var(--ren-interactive-hover-scale));
	}

	.ren-drive-file-card__preview {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		aspect-ratio: var(--ren-drive-file-preview-ratio);
		border-radius: var(--ren-radius-panel);
		background: var(--ren-color-surface-inset);
		overflow: hidden;
	}

	.ren-drive-file-card__preview :global(.ren-drive-file-card__image) {
		width: 100%;
		height: 100%;
	}

	.ren-drive-file-card:hover
		.ren-drive-file-card__preview
		:global(.ren-drive-file-card__image img) {
		transform: scale(var(--ren-card-media-hover-scale));
	}

	.ren-drive-file-card__icon-scene {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ren-drive-file-card__kind {
		position: absolute;
		left: var(--ren-space-xs);
		top: var(--ren-space-xs);
		display: inline-flex;
		align-items: center;
		padding: var(--ren-space-2xs) var(--ren-space-xs);
		border-radius: var(--ren-radius-full);
		font-size: var(--ren-font-size-xs);
		font-weight: var(--ren-font-weight-medium);
		color: var(--ren-color-text-muted);
		background: var(--ren-color-surface-raised);
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
	}

	.ren-drive-file-card__tag {
		position: absolute;
		right: var(--ren-space-xs);
		bottom: var(--ren-space-xs);
		width: var(--ren-space-lg);
		height: var(--ren-space-lg);
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		background: var(--ren-color-surface-raised);
		border-radius: var(--ren-radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ren-drive-file-card__tag-dot {
		width: var(--ren-drive-tag-dot-size);
		height: var(--ren-drive-tag-dot-size);
		border-radius: var(--ren-radius-full);
		background: var(--drive-tag-color, var(--ren-color-border));
	}

	.ren-drive-file-card__content {
		padding: 0;
		min-width: 0;
	}

	.ren-drive-file-card__name {
		width: 100%;
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-medium);
		line-height: var(--ren-line-height-tight);
		color: var(--ren-color-text);
		min-height: calc(var(--ren-font-size-sm) * 2.4);
		display: -webkit-box;
		overflow: hidden;
		overflow-wrap: anywhere;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.ren-drive-file-card__meta {
		display: flex;
		align-items: center;
		gap: var(--ren-space-2xs);
	}

	.ren-drive-file-card__type,
	.ren-drive-file-card__size {
		font-size: var(--ren-font-size-xs);
		color: var(--ren-color-text-muted);
		letter-spacing: var(--ren-letter-spacing-wide);
	}

	.ren-drive-file-card__separator {
		font-size: var(--ren-font-size-xs);
		color: var(--ren-color-text-muted);
	}

	@media (max-width: 40rem) {
		.ren-drive-file-card {
			--drive-file-card-padding: var(--ren-drive-file-card-padding-mobile);
		}
	}
</style>
