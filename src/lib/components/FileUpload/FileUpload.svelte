<script module lang="ts">
	import * as en from '../../i18n/en';

	const COPY = {
		fileUploadTitle: en.fileUploadTitle,
		fileUploadHint: en.fileUploadHint,
		fileUploadAddMore: en.fileUploadAddMore,
		fileUploadList: en.fileUploadList,
		fileUploadRemove: en.fileUploadRemove,
		fileUploadMaxSize: en.fileUploadMaxSize,
		fileUploadType: en.fileUploadType
	};

	/** Native `accept` semantics (`.ext`, `type/*`, `type/sub`) for dropped files. */
	function accepts(file: File, accept: string | undefined): boolean {
		if (!accept) return true;
		const name = file.name.toLowerCase();
		const type = file.type.toLowerCase();
		return accept.split(',').some((token) => {
			const rule = token.trim().toLowerCase();
			if (!rule || rule === '*' || rule === '*/*') return true;
			if (rule.startsWith('.')) return name.endsWith(rule);
			if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
			return type === rule;
		});
	}

	let sequence = 0;
</script>

<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CloudUpload from '@lucide/svelte/icons/cloud-upload';
	import FileIcon from '@lucide/svelte/icons/file';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import { useRenLocale } from '../../i18n';
	import { formatFileSize } from '../../utils/file';
	import Icon from '../Icon/Icon.svelte';
	import type { FileUploadFile, FileUploadProps } from './types';

	let {
		files = $bindable([]),
		placeholderText,
		hintText,
		accept,
		multiple = false,
		maxSize = 0,
		disabled = false,
		addMoreText,
		class: className = '',
		validateFile,
		oninvalid,
		maxSizeErrorMessage,
		onchange,
		onremove
	}: FileUploadProps = $props();

	let picker: HTMLInputElement | undefined = $state();
	let dragging = $state(false);

	const i18n = useRenLocale(COPY);
	const invalid = $derived(files.some((file) => file.status === 'error'));

	function validate(file: File): string | null {
		if (!accepts(file, accept)) return i18n.t.fileUploadType(file.name);
		if (maxSize > 0 && file.size > maxSize) {
			return (
				maxSizeErrorMessage?.(file, maxSize) ??
				i18n.t.fileUploadMaxSize(formatFileSize(maxSize))
			);
		}
		return validateFile?.(file) ?? null;
	}

	function add(list: FileList | null | undefined): void {
		if (disabled || !list?.length) return;
		const next: FileUploadFile[] = [];
		for (const file of list) {
			const error = validate(file);
			if (error && oninvalid) {
				oninvalid(error, file);
				continue;
			}
			next.push({
				id: `ren-file-${++sequence}`,
				file,
				status: error ? 'error' : 'selected',
				progress: 0,
				error: error ?? undefined
			});
		}
		if (!next.length) return;
		files = multiple ? [...files, ...next] : next.slice(0, 1);
		onchange?.(files);
	}

	function remove(id: string): void {
		files = files.filter((file) => file.id !== id);
		onremove?.(id);
		onchange?.(files);
	}

	function handleDrop(event: DragEvent): void {
		event.preventDefault();
		dragging = false;
		add(event.dataTransfer?.files);
	}

	function handlePick(event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		add(input.files);
		input.value = '';
	}
</script>

<div
	class={[
		'ren-file-upload',
		dragging && 'ren-file-upload--dragging',
		disabled && 'ren-file-upload--disabled',
		invalid && 'ren-file-upload--invalid',
		className
	]}
	role="presentation"
	ondragover={(event) => {
		event.preventDefault();
		dragging = !disabled;
	}}
	ondragleave={(event) => {
		// Ignore moves between children of the zone.
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
			dragging = false;
		}
	}}
	ondrop={handleDrop}
>
	<input
		bind:this={picker}
		type="file"
		hidden
		{accept}
		{multiple}
		{disabled}
		onchange={handlePick}
	/>

	{#if files.length === 0}
		<button
			type="button"
			class="ren-file-upload__placeholder"
			{disabled}
			onclick={() => picker?.click()}
		>
			<span class="ren-file-upload__glyph" aria-hidden="true">
				<Icon icon={CloudUpload} size="xl" />
			</span>
			<span class="ren-file-upload__title">
				{placeholderText ?? i18n.t.fileUploadTitle}
			</span>
			<span class="ren-file-upload__hint">
				{hintText ?? i18n.t.fileUploadHint}
			</span>
		</button>
	{:else}
		<ul class="ren-file-upload__list" aria-label={i18n.t.fileUploadList}>
			{#each files as item (item.id)}
				<li class="ren-file-upload__item ren-file-upload__item--{item.status}">
					<span class="ren-file-upload__file-icon" aria-hidden="true">
						<Icon icon={FileIcon} size="md" />
					</span>
					<span class="ren-file-upload__details">
						<span class="ren-file-upload__name" title={item.file.name}>
							{item.file.name}
						</span>
						<span class="ren-file-upload__meta">
							{item.status === 'error'
								? item.error
								: formatFileSize(item.file.size)}
						</span>
					</span>
					{#if item.status === 'uploading'}
						<span
							class="ren-spinner ren-file-upload__spinner"
							aria-hidden="true"
						></span>
					{:else if item.status === 'success'}
						<Icon icon={CircleCheck} color="success" size="md" />
					{:else if !disabled}
						<button
							type="button"
							class="ren-file-upload__remove"
							aria-label={i18n.t.fileUploadRemove(item.file.name)}
							onclick={() => remove(item.id)}
						>
							<Icon icon={X} size="sm" />
						</button>
					{/if}
					{#if item.status === 'uploading' || item.status === 'success'}
						{@const inProgress = item.status === 'uploading'}
						<span
							class="ren-file-upload__progress"
							style:inline-size="{item.progress}%"
							role={inProgress ? 'progressbar' : undefined}
							aria-label={inProgress ? item.file.name : undefined}
							aria-valuenow={inProgress ? item.progress : undefined}
							aria-valuemin={inProgress ? 0 : undefined}
							aria-valuemax={inProgress ? 100 : undefined}
						></span>
					{/if}
				</li>
			{/each}
		</ul>

		{#if multiple}
			<button
				type="button"
				class="ren-file-upload__add"
				{disabled}
				onclick={() => picker?.click()}
			>
				<Icon icon={Plus} size="sm" />
				{addMoreText ?? i18n.t.fileUploadAddMore}
			</button>
		{/if}
	{/if}
</div>

<style>
	.ren-file-upload {
		--ren-control-accent: var(--ren-color-primary);
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-sm);
		inline-size: 100%;
		min-block-size: calc(var(--ren-space-6xl) + var(--ren-space-4xl));
		padding: var(--ren-space-md);
		font-family: var(--ren-font-family-sans);
		background: var(--ren-color-surface);
		border: var(--ren-border-width-thick) dashed var(--ren-color-border);
		border-radius: var(--ren-radius-panel);
		transition: var(--ren-transition-interactive);
	}

	.ren-file-upload:hover,
	.ren-file-upload:focus-within,
	.ren-file-upload--dragging {
		border-color: var(--ren-control-accent);
	}

	.ren-file-upload--dragging {
		background: var(--ren-color-primary-bg);
		transform: scale(var(--ren-interactive-hover-scale));
	}

	.ren-file-upload--invalid {
		--ren-control-accent: var(--ren-color-danger);
		border-color: var(--ren-color-danger);
	}

	.ren-file-upload--disabled {
		opacity: var(--ren-opacity-disabled);
		pointer-events: none;
		border-style: solid;
	}

	/* Empty state: the whole zone is one button. */
	.ren-file-upload__placeholder {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ren-space-xs);
		padding: var(--ren-space-lg);
		font: inherit;
		color: var(--ren-color-text-muted);
		text-align: center;
		background: transparent;
		border: 0;
		border-radius: var(--ren-radius-control);
		cursor: pointer;
	}

	.ren-file-upload__placeholder:focus-visible,
	.ren-file-upload__remove:focus-visible,
	.ren-file-upload__add:focus-visible {
		outline: var(--ren-focus-outline);
		outline-offset: var(--ren-focus-outline-offset);
	}

	.ren-file-upload__glyph {
		display: grid;
		place-items: center;
		inline-size: var(--ren-space-3xl);
		block-size: var(--ren-space-3xl);
		margin-block-end: var(--ren-space-xs);
		background: var(--ren-color-background-secondary);
		border-radius: var(--ren-radius-full);
		transition: var(--ren-transition-interactive);
	}

	.ren-file-upload__placeholder:hover .ren-file-upload__glyph {
		color: var(--ren-control-accent);
		background: var(--ren-color-primary-bg);
		transform: scale(var(--ren-interactive-zoom-scale));
	}

	.ren-file-upload__title {
		font-size: var(--ren-font-size-lg);
		font-weight: var(--ren-font-weight-medium);
		color: var(--ren-color-text);
	}

	.ren-file-upload__hint {
		font-size: var(--ren-font-size-sm);
	}

	.ren-file-upload__list {
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-sm);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.ren-file-upload__item {
		position: relative;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--ren-space-md);
		padding: var(--ren-space-sm) var(--ren-space-md);
		background: var(--ren-color-background);
		border: var(--ren-border-width-thin) solid var(--ren-color-border);
		border-radius: var(--ren-radius-control);
		overflow: hidden;
		transition: var(--ren-transition-control);
	}

	.ren-file-upload__item--success {
		--ren-file-tone: var(--ren-color-success);
	}

	.ren-file-upload__item--error {
		--ren-file-tone: var(--ren-color-danger);
	}

	.ren-file-upload__item--success,
	.ren-file-upload__item--error {
		color: var(--ren-file-tone);
		background: color-mix(
			in srgb,
			var(--ren-file-tone) 6%,
			var(--ren-color-surface)
		);
		border-color: color-mix(in srgb, var(--ren-file-tone) 45%, transparent);
	}

	.ren-file-upload__file-icon {
		display: grid;
		place-items: center;
		inline-size: var(--ren-space-xxl);
		block-size: var(--ren-space-xxl);
		color: inherit;
		background: color-mix(in srgb, currentColor 10%, transparent);
		border-radius: var(--ren-radius-control);
	}

	.ren-file-upload__details {
		display: flex;
		flex-direction: column;
		gap: var(--ren-space-2xs);
		min-inline-size: 0;
	}

	.ren-file-upload__name {
		overflow: hidden;
		font-size: var(--ren-font-size-sm);
		font-weight: var(--ren-font-weight-medium);
		color: var(--ren-color-text);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ren-file-upload__meta {
		font-size: var(--ren-font-size-xs);
		color: var(--ren-color-text-muted);
	}

	.ren-file-upload__item--error .ren-file-upload__meta {
		color: var(--ren-color-danger);
	}

	.ren-file-upload__spinner {
		--ren-spinner-size: var(--ren-icon-sm);
		color: var(--ren-control-accent);
	}

	.ren-file-upload__remove {
		display: grid;
		place-items: center;
		padding: var(--ren-space-xs);
		color: var(--ren-color-text-muted);
		background: transparent;
		border: 0;
		border-radius: var(--ren-radius-full);
		cursor: pointer;
		transition: var(--ren-transition-control);
	}

	.ren-file-upload__remove:hover {
		color: var(--ren-color-danger);
		background: var(--ren-color-danger-bg);
	}

	.ren-file-upload__progress {
		position: absolute;
		inset-block-end: 0;
		inset-inline-start: 0;
		block-size: var(--ren-border-width-thick);
		background: var(--ren-file-tone, var(--ren-control-accent));
		transition: inline-size var(--ren-duration-slow) var(--ren-easing-default);
	}

	.ren-file-upload__add {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--ren-space-xs);
		padding: var(--ren-space-sm);
		font: inherit;
		font-size: var(--ren-font-size-sm);
		color: var(--ren-color-text-muted);
		background: transparent;
		border: var(--ren-border-width-thin) dashed var(--ren-color-border);
		border-radius: var(--ren-radius-control);
		cursor: pointer;
		transition: var(--ren-transition-control);
	}

	.ren-file-upload__add:hover {
		color: var(--ren-control-accent);
		background: var(--ren-color-primary-bg);
		border-color: var(--ren-control-accent);
	}
</style>
