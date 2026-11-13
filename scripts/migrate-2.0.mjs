#!/usr/bin/env node
// Lumi UI 1.x (`@lumi-ui/svelte`) → RenUI 2.0 (`@renui/svelte`); see docs/UPGRADE.md.
//   node scripts/migrate-2.0.mjs <app-dir>                 dry run: report every change and problem
//   node scripts/migrate-2.0.mjs <app-dir> --write         rewrite files and move renamed paths
//   node scripts/migrate-2.0.mjs <app-dir> --list          also list each rewritten file
// Run it from a RenUI checkout: RenUI's own source is the ground truth for which
// tokens exist, and its package.json for the version 1.x pins move to.
// Idempotent; exits 1 while anything still needs a decision.
import { execFileSync } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmdirSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const CHECKOUT = resolve(dirname(SELF), '..');
const LIB = join(CHECKOUT, 'src/lib');
const { version: VERSION } = JSON.parse(
	readFileSync(join(CHECKOUT, 'package.json'), 'utf8')
);

// 1. Rename, most specific first. Every rule needs a delimiter around the old
// name, so words such as `Illuminate`, `luminous`, `Lumen` or `Lumière` never
// match.
const RENAMES = [
	// Package spec pinned to 1.x: `"@lumi-ui/svelte": "^1.2.1"`, `@lumi-ui/svelte@1.2.1`.
	[
		/@lumi-ui\/svelte(@|":\s*")([\^~]?)1\.\d+\.\d+/g,
		`@renui/svelte$1$2${VERSION}`
	],
	[/@lumi-ui\/svelte/g, '@renui/svelte'],
	[/@lumi-ui(?![\w-])/g, '@renui'],
	// Repositories and sites.
	[/(?<![\w-])lumi-ui(?!\w)/g, 'renui'],
	[/(?<![\w-])lumi-web(?!\w)/g, 'renweb'],
	[/(?<=eliaschampi(?:\/|\.github\.io\/))lumi(?![\w-])/g, 'renweb'],
	[/Lumi UI/g, 'RenUI'],
	// Custom properties, classes, storage keys, file names, cascade layers.
	[/(?<![A-Za-z0-9_])lumi(?=[-_])/g, 'ren'],
	[
		/(?<![A-Za-z0-9_])lumi(?=\.(?:tokens|base|components|layout|patterns|utilities)\b)/g,
		'ren'
	],
	// TypeScript names: LumiColor, useLumiLocale, lumiEn, LUMI_TAGS.
	[/Lumi(?=[A-Z0-9])/g, 'Ren'],
	[/(?<![A-Za-z0-9_$])lumi(?=[A-Z0-9])/g, 'ren'],
	[/(?<![A-Za-z0-9])LUMI(?=_|\b)/g, 'REN'],
	// Prose.
	[/(?<![\p{L}\p{N}_])Lumi(?![\p{L}\p{N}_])/gu, 'RenUI']
];

// 2. Tokens removed in 2.0 with a one-to-one replacement. Only uses are
// rewritten; an app's own declaration of a removed token is reported instead.
const TOKENS = {
	'--ren-control-radius': '--ren-radius-control',
	'--ren-color-border-glass': '--ren-color-border',
	'--ren-gradient-app': '--ren-color-background',
	'--ren-gradient-card': '--ren-color-surface-card',
	'--ren-gradient-card-hover': '--ren-color-surface-card-hover',
	'--ren-floating-surface-bg': '--ren-color-surface-raised',
	'--ren-floating-surface-border': '--ren-color-border',
	'--ren-floating-surface-shadow': '--ren-shadow-md'
};

// Removed tokens that need a design decision (docs/UPGRADE.md).
const SURFACE = 'choose the owning --ren-color-surface-* role';
const REMOVE = 'remove it: the decorative layer is gone';
const HINTS = {
	'--ren-color-surface-glass':
		'--ren-color-surface or --ren-color-surface-raised',
	'--ren-color-surface-glass-strong':
		'--ren-color-surface or --ren-color-surface-raised',
	'--ren-color-primary-50':
		'--ren-color-primary-bg for soft semantic containers',
	'--ren-color-gray-400': '--ren-color-text-muted for secondary content',
	'--ren-gradient-subtle': SURFACE,
	'--ren-gradient-glass-sidebar': SURFACE,
	'--ren-gradient-sidebar-header': SURFACE,
	'--ren-state-bg-strength':
		'--ren-color-{role}-bg, or .ren-tone with --ren-tone-soft / --ren-tone-strong',
	'--ren-border-width-accent': 'a token from the thin/base/thick border scale',
	'--ren-gradient-card-sheen': REMOVE,
	'--ren-card-sheen-opacity': REMOVE,
	'--ren-sidebar-header-veil': REMOVE,
	'--ren-app-background-accent': 'remove it: canvas decoration is app-owned',
	'--ren-app-pattern-size': 'remove it: canvas decoration is app-owned',
	'--ren-app-pattern-line-color': 'remove it: canvas decoration is app-owned',
	'--ren-blur-sm':
		'remove it: cards keep the optional --ren-surface-blur-filter hook',
	'--ren-surface-saturation':
		'remove it: cards keep the optional --ren-surface-blur-filter hook'
};

const TOKEN = /--ren-[\w-]+/g;
const CLASS = /(?<![\w-])ren-[\w-]+/g;
const LEFTOVER = /lumi(?![n\P{ASCII}])/giu;
// A pin the rename cannot carry: 1.x is the only line 2.0 migrates from.
const PRE_1X_PIN = /"@lumi-ui\/svelte":\s*"([\^~]?(?!1\.)\d+\.\d+\.\d+)"/g;
const LOCKFILE =
	/(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?|composer\.lock)$/;
const FILE_NAME = /^\.(css|scss|pcss|svelte|[cm]?[jt]s|json|md)\b/;
const MAX_BYTES = 2 * 1024 * 1024;

const [target, ...flags] = process.argv.slice(2);
if (!target) {
	console.error(
		'usage: node scripts/migrate-2.0.mjs <app-dir> [--write] [--list]'
	);
	process.exit(1);
}
const root = resolve(target);
const write = flags.includes('--write');
const list = flags.includes('--list');

function rename(text) {
	let count = 0;
	for (const [pattern, replacement] of RENAMES) {
		count += text.match(pattern)?.length ?? 0;
		text = text.replace(pattern, replacement);
	}
	return { text, count };
}

// `--x: value`, `'--x': value`, `style:--x={…}` and `setProperty('--x', …)` set a token.
function isDeclaration(text, start, end) {
	return (
		/^['"]?\s*:(?!:)/.test(text.slice(end, end + 4)) ||
		/(?:style:|setProperty\(\s*['"])$/.test(text.slice(start - 16, start))
	);
}

function replaceTokens(text) {
	let count = 0;
	text = text.replace(TOKEN, (name, start) => {
		const next = TOKENS[name];
		if (!next || isDeclaration(text, start, start + name.length)) return name;
		count++;
		return next;
	});
	return { text, count };
}

function isText(buffer) {
	return !buffer.subarray(0, 8000).includes(0);
}

// Tokens and classes RenUI knows: every concrete name its source mentions,
// renamed in memory so this works before and after the library rename.
function libraryNames() {
	const tokens = new Set();
	const classes = new Set();
	const walk = (dir) => {
		for (const name of readdirSync(dir)) {
			const path = join(dir, name);
			if (statSync(path).isDirectory()) walk(path);
			else if (/\.(css|svelte|ts)$/.test(name) && !/\.test\./.test(name)) {
				const { text } = rename(readFileSync(path, 'utf8'));
				for (const [token] of text.matchAll(TOKEN))
					if (!token.endsWith('-')) tokens.add(token);
				for (const [className] of text.matchAll(CLASS))
					if (!className.endsWith('-')) classes.add(className);
			}
		}
	};
	walk(LIB);
	return { tokens, classes };
}

const known = libraryNames();
for (const replacement of Object.values(TOKENS))
	if (!known.tokens.has(replacement))
		throw new Error(`${replacement} is not a RenUI token`);
const isKnown = (set, name) =>
	name.endsWith('-')
		? [...set].some((entry) => entry.startsWith(name))
		: set.has(name);

const gitFiles = (...flags) =>
	execFileSync('git', ['-C', root, 'ls-files', '-z', ...flags], {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024
	})
		.split('\0')
		.filter(Boolean);
const tracked = new Set(gitFiles('--cached'));
const files = [...tracked, ...gitFiles('--others', '--exclude-standard')];

// Stop before any write when the app is older than 1.x.
const stalePins = files
	.filter(
		(file) => /(^|\/)package\.json$/.test(file) && existsSync(join(root, file))
	)
	.flatMap((file) =>
		[...readFileSync(join(root, file), 'utf8').matchAll(PRE_1X_PIN)].map(
			([, spec]) => `${file} pins @lumi-ui/svelte ${spec}`
		)
	);
if (stalePins.length) {
	for (const pin of stalePins) console.error(`error: ${pin}`);
	console.error(
		'  Upgrade to 1.2.1 first with the codemods at tag v1.2.1, then rerun.'
	);
	process.exit(1);
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;
const found = new Map();
function record(kind, name, where) {
	const key = `${kind}\0${name}`;
	const entry = found.get(key) ?? { kind, name, places: [] };
	entry.places.push(where);
	found.set(key, entry);
}

let rewritten = 0;
let replacements = 0;
const moves = [];
const blocked = [];
const skipped = [];

for (const file of files) {
	const path = join(root, file);
	if (path === SELF || LOCKFILE.test(file)) continue;
	let stat;
	try {
		stat = statSync(path);
	} catch {
		continue; // deleted in the working tree
	}
	if (!stat.isFile()) continue;
	const target = rename(file).text;
	// Never overwrite: an existing destination needs a decision.
	const collides = target !== file && existsSync(join(root, target));
	if (collides) blocked.push([file, target]);
	else if (target !== file) moves.push([file, target]);
	const shown = collides ? file : target;
	if (stat.size > MAX_BYTES) {
		skipped.push(file);
		continue;
	}
	const buffer = readFileSync(path);
	if (!isText(buffer)) continue;

	const source = buffer.toString('utf8');
	const renamed = rename(source);
	const tokens = replaceTokens(renamed.text);
	const text = tokens.text;
	const count = renamed.count + tokens.count;
	if (count) {
		rewritten++;
		replacements += count;
		if (list) console.log(`  rewrite  ${file} (${count})`);
		if (write) writeFileSync(path, text);
	}

	for (const match of text.matchAll(TOKEN)) {
		const [name] = match;
		const where = `${shown}:${lineOf(text, match.index)}`;
		const declared = isDeclaration(
			text,
			match.index,
			match.index + name.length
		);
		record(declared ? 'declare' : 'use', name, where);
	}
	for (const match of text.matchAll(CLASS)) {
		const [name] = match;
		const after = text.slice(match.index + name.length);
		if (!isKnown(known.classes, name) && !FILE_NAME.test(after))
			record('class', name, `${shown}:${lineOf(text, match.index)}`);
	}
	for (const match of text.matchAll(LEFTOVER)) {
		const line = text.split('\n')[lineOf(text, match.index) - 1].trim();
		record(
			'leftover',
			line.slice(0, 80),
			`${shown}:${lineOf(text, match.index)}`
		);
	}
}

if (write) {
	for (const [from, to] of moves) {
		mkdirSync(dirname(join(root, to)), { recursive: true });
		if (tracked.has(from)) execFileSync('git', ['-C', root, 'mv', from, to]);
		else renameSync(join(root, from), join(root, to));
	}
	// Drop the directories the moves emptied.
	for (const [from] of moves)
		for (
			let dir = dirname(join(root, from));
			dir !== root && existsSync(dir) && !readdirSync(dir).length;
			dir = dirname(dir)
		)
			rmdirSync(dir);
}

// Report.
const declaredByApp = new Set(
	[...found.values()].filter((e) => e.kind === 'declare').map((e) => e.name)
);
const at = (places) =>
	places.slice(0, 3).join(', ') +
	(places.length > 3 ? ` (+${places.length - 3})` : '');
const problems = {
	error: blocked.map(
		([from, to]) => `cannot move ${from} → ${to}: the destination exists`
	),
	manual: [],
	info: []
};

for (const { kind, name, places } of found.values()) {
	if (
		kind === 'use' &&
		!isKnown(known.tokens, name) &&
		!declaredByApp.has(name)
	)
		problems.error.push(
			`undefined token ${name}  ${at(places)}${HINTS[name] ? `\n      → ${HINTS[name]}` : ''}`
		);
	else if (kind === 'declare' && !isKnown(known.tokens, name))
		problems.manual.push(
			`${name} is not a RenUI token: remove the obsolete override or rename the app token  ${at(places)}` +
				(TOKENS[name]
					? `\n      → uses now read ${TOKENS[name]}`
					: HINTS[name]
						? `\n      → ${HINTS[name]}`
						: '')
		);
	else if (kind === 'leftover')
		problems.error.push(`leftover "lumi": ${name}  ${at(places)}`);
	else if (kind === 'class')
		problems.info.push(
			`class ${name} is not defined by RenUI (app-owned or removed)  ${at(places)}`
		);
}

const relRoot = relative(process.cwd(), root) || '.';
console.log(
	`RenUI ${VERSION} migration · ${relRoot} · ${write ? 'written' : 'dry run'}`
);
console.log(
	`  ${rewritten} files, ${replacements} replacements, ${moves.length} moves`
);
for (const [from, to] of moves) console.log(`  move     ${from} → ${to}`);
for (const file of skipped)
	console.log(`  skipped  ${file} (larger than 2 MB, check by hand)`);
for (const [level, lines] of Object.entries(problems))
	for (const line of lines.sort()) console.log(`${level}: ${line}`);
console.log(
	`  ${problems.error.length} errors, ${problems.manual.length} manual, ${problems.info.length} info`
);
process.exitCode = problems.error.length || problems.manual.length ? 1 : 0;
