import { execFileSync, spawnSync } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

// Vitest runs from the checkout root.
const CODEMOD = resolve('scripts/migrate-2.0.mjs');
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const roots = [];

afterEach(() => {
	for (const root of roots.splice(0))
		rmSync(root, { recursive: true, force: true });
});

function put(root, files) {
	for (const [path, text] of Object.entries(files)) {
		mkdirSync(dirname(join(root, path)), { recursive: true });
		writeFileSync(join(root, path), text);
	}
}

/** A 1.x app: `tracked` files sit in the git index, `untracked` beside them. */
function createApp(tracked, untracked = {}) {
	const root = mkdtempSync(join(tmpdir(), 'ren-migrate-'));
	roots.push(root);
	put(root, tracked);
	execFileSync('git', ['-C', root, 'init', '-q']);
	execFileSync('git', ['-C', root, 'add', '-A']);
	put(root, untracked);
	return {
		migrate: () =>
			spawnSync(process.execPath, [CODEMOD, root, '--write'], {
				encoding: 'utf8'
			}),
		read: (path) => readFileSync(join(root, path), 'utf8'),
		has: (path) => existsSync(join(root, path))
	};
}

describe('migrate-2.0', () => {
	it('moves tracked and untracked files into renamed directories and drops the emptied ones', () => {
		const app = createApp(
			{ 'src/lumi-theme/app.css': '.x { color: var(--lumi-color-text); }\n' },
			{ 'src/lumi-extra.css': '.y {}\n' }
		);
		const { status, stdout } = app.migrate();
		expect(status, stdout).toBe(0);
		expect(app.read('src/ren-theme/app.css')).toBe(
			'.x { color: var(--ren-color-text); }\n'
		);
		expect(app.has('src/ren-extra.css')).toBe(true);
		expect(app.has('src/lumi-theme')).toBe(false);
		expect(app.has('src/lumi-extra.css')).toBe(false);
	});

	it('reports a move onto an existing file instead of overwriting it', () => {
		const app = createApp({ 'lumi-x.css': '.a {}\n', 'ren-x.css': '.b {}\n' });
		const { status, stdout } = app.migrate();
		expect(status).toBe(1);
		expect(stdout).toContain(
			'cannot move lumi-x.css → ren-x.css: the destination exists'
		);
		expect(app.read('ren-x.css')).toBe('.b {}\n');
		expect(app.has('lumi-x.css')).toBe(true);
	});

	it('stops before any write when the app pins a release older than 1.x', () => {
		const manifest = '{ "dependencies": { "@lumi-ui/svelte": "0.4.0" } }\n';
		const app = createApp({
			'package.json': manifest,
			'lumi-theme.css': ':root { --lumi-color-text: red; }\n'
		});
		const { status, stderr } = app.migrate();
		expect(status).toBe(1);
		expect(stderr).toContain('package.json pins @lumi-ui/svelte 0.4.0');
		expect(app.read('package.json')).toBe(manifest);
		expect(app.has('lumi-theme.css')).toBe(true);
	});

	it('pins 1.x to this release and keeps words that only contain Lumi', () => {
		const app = createApp({
			'package.json': '{ "dependencies": { "@lumi-ui/svelte": "^1.2.1" } }\n',
			'README.md': 'Lumi UI, Lumi, Lumière, luminous\n'
		});
		const { status, stdout } = app.migrate();
		expect(status, stdout).toBe(0);
		expect(app.read('package.json')).toContain(
			`"@renui/svelte": "^${version}"`
		);
		expect(app.read('README.md')).toBe('RenUI, RenUI, Lumière, luminous\n');
	});
});
