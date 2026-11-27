import { flushSync, mount, unmount, type Component } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DriveFilePreview } from '../src/lib';
import type { DriveFileItem } from '../src/lib';

const mounted: ReturnType<typeof mount>[] = [];

function render<Props extends Record<string, any>>(
	component: Component<Props, any, any>,
	props: Props
) {
	const target = document.body.appendChild(document.createElement('div'));
	mounted.push(mount(component, { target, props }));
	flushSync();
	return target;
}

afterEach(() => {
	while (mounted.length) unmount(mounted.pop()!);
	document.body.innerHTML = '';
	delete (navigator as unknown as Record<string, unknown>).pdfViewerEnabled;
});

const pdf: DriveFileItem = {
	code: 'f1',
	scope: 'user_private',
	name: 'report.pdf',
	type: 'doc',
	size: 1024,
	mime_type: 'application/pdf',
	parent_code: null,
	user_code: 'u1',
	deleted_at: null,
	created_at: '2026-11-20T10:00:00Z',
	updated_at: '2026-11-20T10:00:00Z'
};

const nextFrame = () =>
	new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function hasPdfViewer(value: boolean): void {
	Object.defineProperty(navigator, 'pdfViewerEnabled', {
		configurable: true,
		value
	});
}

describe('DriveFilePreview', () => {
	it('navigates the PDF frame once, after the dialog is in place', async () => {
		hasPdfViewer(true);
		// Every move of an iframe that already has a source reloads it.
		let movedLoaded = 0;
		let navigations = 0;
		const observer = new MutationObserver((records) => {
			for (const record of records) {
				if (record.type === 'attributes') navigations++;
				for (const node of record.addedNodes) {
					if (!(node instanceof Element)) continue;
					const frame = node.matches('iframe')
						? node
						: node.querySelector('iframe');
					if (frame?.hasAttribute('src')) movedLoaded++;
				}
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['src']
		});

		render(DriveFilePreview, { open: true, file: pdf });
		await nextFrame();
		await nextFrame();
		observer.disconnect();

		const frame = document.querySelector('iframe')!;
		expect(frame.getAttribute('src')).toBe('/api/drive/f1/serve');
		expect(frame.title).toBe('report.pdf');
		expect(movedLoaded).toBe(0);
		expect(navigations).toBe(1);
	});

	it('offers the PDF in a new tab, the recovery when framing is blocked', () => {
		hasPdfViewer(true);
		render(DriveFilePreview, { open: true, file: pdf });
		const link = document.querySelector<HTMLAnchorElement>(
			'a[href="/api/drive/f1/serve"]'
		)!;
		expect(link.textContent!.trim()).toBe('Open in new tab');
		expect(link.target).toBe('_blank');
		expect(link.rel).toBe('noopener');
	});

	it('shows a fallback, not a blank frame, without a PDF viewer', () => {
		hasPdfViewer(false);
		const ondownload = vi.fn();
		render(DriveFilePreview, { open: true, file: pdf, ondownload });

		expect(document.querySelector('iframe')).toBeNull();
		expect(document.querySelector('[role="status"]')!.textContent).toContain(
			'This file cannot be shown here'
		);
		expect(
			document.querySelector('a[href="/api/drive/f1/serve"]')
		).not.toBeNull();
		const download = [...document.querySelectorAll('button')].find(
			(button) => button.textContent!.trim() === 'Download'
		)!;
		download.click();
		expect(ondownload).toHaveBeenCalledWith(pdf);
	});

	it('frames by the stored MIME type, not the file name', () => {
		hasPdfViewer(true);
		render(DriveFilePreview, {
			open: true,
			file: { ...pdf, mime_type: 'application/octet-stream' }
		});
		expect(document.querySelector('iframe')).toBeNull();
		expect(document.body.textContent).toContain(
			'Preview is not available for this file type'
		);
	});

	it('replaces an image that fails to load with the fallback', () => {
		render(DriveFilePreview, {
			open: true,
			file: { ...pdf, name: 'photo.png', type: 'img', mime_type: 'image/png' }
		});
		document.querySelector('img')!.dispatchEvent(new Event('error'));
		flushSync();

		expect(document.querySelector('img')).toBeNull();
		expect(document.querySelector('[role="status"]')!.textContent).toContain(
			'This file cannot be shown here'
		);
	});
});
