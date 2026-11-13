<script module lang="ts">
	import * as en from '../../i18n/en';
	import { renDriveEn } from '../../i18n/drive';

	const COPY = { ...renDriveEn, close: en.close };
</script>

<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import FileIcon from '@lucide/svelte/icons/file';
	import Music from '@lucide/svelte/icons/music';
	import { Button } from '../Button';
	import { Dialog } from '../Dialog';
	import { Icon } from '../Icon';
	import { useRenLocale } from '../../i18n';
	import {
		formatDriveDateTime,
		formatFileSize,
		getDriveServeUrl,
		getDriveTypeLabel,
		getFileColor,
		getFileIcon,
		type DriveDateFormatter,
		type DriveServeUrlResolver
	} from '../../utils/drive';
	import type { DriveFileItem } from './types';

	interface Props {
		open: boolean;
		file: DriveFileItem | null;
		ondownload?: (file: DriveFileItem) => void;
		formatDate?: DriveDateFormatter;
		serveUrl?: DriveServeUrlResolver;
	}

	let {
		open = $bindable(false),
		file,
		ondownload,
		formatDate,
		serveUrl = getDriveServeUrl
	}: Props = $props();

	const i18n = useRenLocale(COPY);

	const previewUrl = $derived.by(() => {
		if (!file) {
			return '';
		}

		if (file.type === 'img') {
			return serveUrl(file.code, { variant: 'preview' });
		}

		return serveUrl(file.code);
	});
	const isImage = $derived(file?.type === 'img');
	const isVideo = $derived(file?.type === 'vid');
	const isAudio = $derived(file?.type === 'aud');
	const isPdf = $derived(
		file?.mime_type === 'application/pdf' ||
			file?.name.toLowerCase().endsWith('.pdf')
	);
</script>

<Dialog bind:open title={file?.name || i18n.t.drivePreview} size="lg">
	<div class="ren-drive-preview">
		{#if !file}
			<div class="ren-drive-preview__empty">
				<Icon icon={FileIcon} size="2xl" color="muted" />
				<p>{i18n.t.driveNoSelection}</p>
			</div>
		{:else if isImage}
			<div class="ren-drive-preview__media-wrap">
				<img
					src={previewUrl}
					alt={file.name}
					class="ren-drive-preview__image"
					decoding="async"
				/>
			</div>
		{:else if isVideo}
			<div class="ren-drive-preview__media-wrap">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={previewUrl} controls class="ren-drive-preview__video"
				></video>
			</div>
		{:else if isAudio}
			<div class="ren-drive-preview__audio-wrap">
				<Icon icon={Music} size="var(--ren-space-4xl)" color="warning" />
				<audio src={previewUrl} controls class="ren-drive-preview__audio"
				></audio>
			</div>
		{:else if isPdf}
			<div class="ren-drive-preview__pdf-wrap">
				<iframe
					src={previewUrl}
					title={file.name}
					class="ren-drive-preview__pdf"
				></iframe>
			</div>
		{:else}
			<div class="ren-drive-preview__empty">
				<Icon icon={FileIcon} size="2xl" color="muted" />
				<p>{i18n.t.drivePreviewUnavailable}</p>
			</div>
		{/if}
	</div>

	{#if file}
		<div class="ren-drive-preview__details">
			<div class="ren-drive-preview__details-main">
				<Icon
					icon={getFileIcon(file.type)}
					size="md"
					color={getFileColor(file.type)}
				/>
				<div class="ren-drive-preview__details-text">
					<span class="ren-drive-preview__name">{file.name}</span>
					<span class="ren-drive-preview__meta">
						{getDriveTypeLabel(file.type, i18n.t)}
						{#if file.type !== 'dir'}
							• {formatFileSize(file.size)}
						{/if}
					</span>
				</div>
			</div>
			<div class="ren-drive-preview__details-meta">
				<span class="ren-drive-preview__meta"
					>{i18n.t.driveColumnModified}: {formatDate
						? formatDate(file.updated_at)
						: formatDriveDateTime(file.updated_at, i18n)}</span
				>
				{#if file.mime_type}
					<span class="ren-drive-preview__meta">{file.mime_type}</span>
				{/if}
			</div>
		</div>
	{/if}

	{#snippet footer()}
		<Button variant="border" onclick={() => (open = false)}
			>{i18n.t.close}</Button
		>
		{#if file}
			<Button
				variant="filled"
				icon={Download}
				onclick={() => ondownload?.(file)}>{i18n.t.driveDownload}</Button
			>
		{/if}
	{/snippet}
</Dialog>

<style>
	.ren-drive-preview__name {
		font-weight: var(--ren-font-weight-medium);
	}

	.ren-drive-preview__meta {
		color: var(--ren-color-text-muted);
		font-size: var(--ren-font-size-xs);
	}

	.ren-drive-preview {
		min-height: var(--ren-drive-preview-min-height);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--ren-space-sm);
		border: var(--ren-border-width-thin) solid var(--ren-color-border-light);
		border-radius: var(--ren-radius-panel);
		background: var(--ren-color-surface-inset);
	}

	.ren-drive-preview__media-wrap {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.ren-drive-preview__image {
		max-width: 100%;
		max-height: 70vh;
		object-fit: contain;
		border-radius: var(--ren-radius-tile);
		box-shadow: var(--ren-shadow-md);
	}

	.ren-drive-preview__video {
		width: 100%;
		max-height: 70vh;
		border-radius: var(--ren-radius-tile);
		box-shadow: var(--ren-shadow-md);
	}

	.ren-drive-preview__audio-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--ren-space-lg);
		padding: var(--ren-space-xl);
		width: 100%;
	}

	.ren-drive-preview__audio {
		width: 100%;
		max-width: var(--ren-drive-preview-audio-max-width);
	}

	.ren-drive-preview__pdf-wrap {
		width: 100%;
		height: 70vh;
	}

	.ren-drive-preview__pdf {
		width: 100%;
		height: 100%;
		border: var(--ren-border-width-thin) solid var(--ren-color-border-light);
		border-radius: var(--ren-radius-tile);
		background: var(--ren-color-surface);
	}

	.ren-drive-preview__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--ren-space-sm);
		color: var(--ren-color-text-muted);
		text-align: center;
	}

	.ren-drive-preview__details {
		margin-top: var(--ren-space-sm);
		padding: var(--ren-space-sm) var(--ren-space-md);
		border: var(--ren-border-width-thin) solid var(--ren-color-border-light);
		border-radius: var(--ren-radius-tile);
		background: var(--ren-color-surface);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ren-space-md);
		flex-wrap: wrap;
	}

	.ren-drive-preview__details-main {
		display: flex;
		align-items: center;
		gap: var(--ren-space-sm);
		min-width: 0;
	}

	.ren-drive-preview__details-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.ren-drive-preview__details-text span:first-child {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: var(--ren-drive-preview-title-max-width);
	}

	.ren-drive-preview__details-meta {
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-2xs);
		text-align: right;
	}

	@media (max-width: 48rem) {
		.ren-drive-preview {
			min-height: var(--ren-drive-preview-min-height-mobile);
		}

		.ren-drive-preview__details-meta {
			text-align: left;
		}
	}
</style>
