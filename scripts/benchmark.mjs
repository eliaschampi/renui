// Compare a clean baseline checkout with the current library in one Chromium process.
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/benchmark.mjs /path/to/baseline
// The baseline and current directory must have dependencies installed.
import {
	realpathSync,
	mkdtempSync,
	writeFileSync,
	rmSync,
	symlinkSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build, preview } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

if (!process.argv[2] || !process.env.PLAYWRIGHT_MODULE) {
	throw new Error(
		'Provide baseline directory and PLAYWRIGHT_MODULE (Playwright module path).'
	);
}
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const root = realpathSync(mkdtempSync(join(tmpdir(), 'ren-benchmark-')));
const servers = [];
let browser;
try {
	symlinkSync(resolve('node_modules'), join(root, 'node_modules'), 'dir');
	writeFileSync(
		join(root, 'index.html'),
		'<html><head></head><body><main id="app"></main><script type="module" src="/entry.js"></script></body></html>'
	);
	writeFileSync(
		join(root, 'Fixture.svelte'),
		`
<script>
import { Button, Chip, Card, Progress, Slider } from '@renui/svelte';
let { value = 25 } = $props();
const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
</script>
<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:16px">
{#each Array(60) as _, i}
<Card><Button color={colors[i%6]}>Action {i}</Button><Chip color={colors[i%6]}>Status</Chip><Progress {value} color={colors[i%6]} /><Slider {value} label="Level" color={colors[i%6]} /></Card>
{/each}
</div>`
	);
	writeFileSync(
		join(root, 'entry.js'),
		`
import { mount, unmount, flushSync } from 'svelte';
import Fixture from './Fixture.svelte';
import '@renui/styles';
window.measure = async () => {
 const target = document.getElementById('app');
 const start = performance.now();
 const component = mount(Fixture, { target });
 flushSync();
 target.getBoundingClientRect();
 const mounted = performance.now();
 for (const input of target.querySelectorAll('input[type=range]')) {
  input.value = '75'; input.dispatchEvent(new Event('input', { bubbles: true }));
 }
 flushSync(); target.getBoundingClientRect();
 const updated = performance.now();
 await unmount(component);
 return { mount: mounted-start, update: updated-mounted, unmount: performance.now()-updated };
};
window.ready = true;`
	);
	for (const source of [resolve(process.argv[2]), process.cwd()]) {
		const outDir = join(root, `out-${servers.length}`);
		await build({
			root,
			configFile: false,
			logLevel: 'silent',
			plugins: [svelte({ configFile: false })],
			resolve: {
				alias: {
					'@renui/svelte': join(source, 'src/lib/index.ts'),
					'@renui/styles': join(source, 'src/lib/styles/index.css')
				}
			},
			build: { outDir, emptyOutDir: true }
		});
		servers.push(
			await preview({
				root,
				configFile: false,
				logLevel: 'silent',
				build: { outDir },
				preview: { port: 0 }
			})
		);
	}
	browser = await chromium.launch({
		headless: true,
		executablePath: process.env.CHROMIUM_PATH
	});
	const pages = await Promise.all(
		servers.map(async (server) => {
			const page = await browser.newPage({
				viewport: { width: 1440, height: 1000 },
				reducedMotion: 'reduce'
			});
			await page.goto(server.resolvedUrls.local[0]);
			await page.waitForFunction(() => window.ready);
			return page;
		})
	);
	const output = {};
	for (const theme of ['light', 'dark']) {
		for (const page of pages)
			await page.evaluate(
				(theme) => (document.documentElement.dataset.theme = theme),
				theme
			);
		const samples = [[], []];
		for (let i = 0; i < 40; i++) {
			// Alternate order to reduce warmup/thermal bias; discard ten warmup rounds.
			for (const index of i % 2 ? [1, 0] : [0, 1]) {
				const result = await pages[index].evaluate(() => window.measure());
				if (i >= 10) samples[index].push(result);
			}
		}
		output[theme] = samples.map((values) =>
			Object.fromEntries(
				['mount', 'update', 'unmount'].map((metric) => {
					const sorted = values.map((v) => v[metric]).sort((a, b) => a - b);
					return [
						metric,
						{
							medianMs: sorted[Math.floor(sorted.length / 2)],
							p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1]
						}
					];
				})
			)
		);
	}
	console.log(
		JSON.stringify(
			{
				browser: await browser.version(),
				rows: 60,
				components: 300,
				samples: 30,
				order: ['baseline', 'current'],
				results: output
			},
			null,
			2
		)
	);
} finally {
	await browser?.close();
	for (const server of servers)
		await new Promise((resolve) => server.httpServer.close(resolve));
	rmSync(root, { recursive: true, force: true });
}
