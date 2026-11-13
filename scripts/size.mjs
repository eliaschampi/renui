// Re-measures the Lightweight Contract in README.md and fails over budget:
//   pnpm run package && pnpm run size
// Caps are the measured 1.2.0 baseline, including the full export surface.
// Fully minified Vite production ES bundles (Rolldown + Lightning CSS) with
// Svelte external; JavaScript and CSS gzip (level 9) separately, then sum.
import {
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { build } from 'vite';

const dist = resolve('dist');
const named = (...names) =>
	`export { ${names.join(', ')} } from '@lumi-ui/svelte';`;

const CSS = [
	['Global CSS (`/styles`)', ['index.css'], 7_691],
	['Lean CSS (`tokens.base` + `base`)', ['tokens.base.css', 'base.css'], 4_984]
];

const BUNDLES = [
	['Button', named('Button'), 2_754],
	['Divider', named('Divider'), 966],
	['Tooltip', named('Tooltip'), 4_121],
	['Dropdown', named('Dropdown', 'DropdownItem'), 5_560],
	['Select', named('Select'), 8_751],
	['Tabs', named('Tabs'), 3_197],
	['SegmentedControl', named('SegmentedControl'), 2_872],
	['ToggleGroup', named('ToggleGroup'), 3_021],
	['Skeleton', named('Skeleton'), 1_089],
	['Message', named('Message'), 1_585],
	['MessageList', named('MessageList'), 3_070],
	[
		'Form and table set',
		named(
			'Switch',
			'Radio',
			'Textarea',
			'Checkbox',
			'SegmentedControl',
			'Input',
			'Table'
		),
		15_156
	],
	[
		'Storefront set',
		named('Button', 'Card', 'Image', 'Chip', 'Input', 'Icon', 'Divider'),
		9_776
	],
	['All exports', `export * from '@lumi-ui/svelte';`, 74_124]
];

const gzip = (path) => gzipSync(readFileSync(path), { level: 9 }).length;

async function bundle(source) {
	const root = mkdtempSync(join(tmpdir(), 'lumi-size-'));
	const input = join(root, 'entry.js');
	const outDir = join(root, 'out');
	writeFileSync(input, source);
	await build({
		root,
		configFile: false,
		logLevel: 'silent',
		plugins: [svelte({ configFile: false })],
		resolve: {
			alias: { '@lumi-ui/svelte': join(dist, 'index.js') },
			conditions: ['svelte', 'browser', 'production', 'module', 'import']
		},
		build: {
			outDir,
			minify: true,
			cssMinify: 'lightningcss',
			cssCodeSplit: false,
			rollupOptions: {
				input,
				preserveEntrySignatures: 'strict',
				output: { format: 'es', entryFileNames: 'bundle.js' },
				external: (id) => id === 'svelte' || id.startsWith('svelte/')
			}
		}
	});
	const sizes = { js: 0, css: 0 };
	for (const { name, parentPath } of readdirSync(outDir, {
		recursive: true,
		withFileTypes: true
	})) {
		if (name.endsWith('.js')) sizes.js += gzip(join(parentPath, name));
		if (name.endsWith('.css')) sizes.css += gzip(join(parentPath, name));
	}
	rmSync(root, { recursive: true, force: true });
	return sizes;
}

const number = (value) => value.toLocaleString('en-US').padStart(8);
let over = 0;

function report(name, total, budget) {
	const exceeded = total > budget;
	if (exceeded) over++;
	const limit = budget === Infinity ? '' : ` / ${number(budget)}`;
	console.log(
		`${exceeded ? '✗' : ' '} ${name.padEnd(36)}${number(total)}${limit}`
	);
}

for (const [name, files, budget] of CSS) {
	const imports = files.map(
		(file) => `import ${JSON.stringify(join(dist, 'styles', file))};`
	);
	report(name, (await bundle(imports.join('\n'))).css, budget);
}

for (const [name, source, budget] of BUNDLES) {
	const { js, css } = await bundle(source);
	report(name, js + css, budget);
}

if (over) {
	console.error(`\n${over} surface(s) over budget.`);
	process.exit(1);
}
