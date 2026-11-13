/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import {
	formatDate,
	formatNumber,
	getIcon,
	getInitials,
	hasIcon,
	registerIcons
} from '../src/lib';
import { renIcons } from '../src/lib/icons';

describe('icons', () => {
	it('starts empty and resolves names once registered', () => {
		expect(getIcon('search')).toBeNull();
		registerIcons({ search: renIcons.search });
		expect(hasIcon('search')).toBe(true);
		expect(getIcon('search')).toBe(renIcons.search);
	});
});

describe('format', () => {
	it('keeps date-only strings on their calendar day in any zone', () => {
		expect(
			formatDate('2024-05-01', { locale: 'en-US', timeZone: 'America/Lima' })
		).toBe('5/1/2024');
	});

	it('formats currency with cached formatters', () => {
		const text = formatNumber(1250.5, {
			locale: 'es-PE',
			style: 'currency',
			currency: 'PEN'
		});
		expect(text).toMatch(/S\/\s?1[,.]250[.,]50/);
	});

	it('builds initials from letters and digits only', () => {
		expect(getInitials('Ada Lovelace')).toBe('AL');
		expect(getInitials('(ada) love')).toBe('AL');
		expect(getInitials(null)).toBe('');
	});
});

const SOURCES = import.meta.glob<string>('../src/lib/**/*.{css,svelte,ts}', {
	query: '?raw',
	import: 'default',
	eager: true
});
const sourcesOf = (extension: RegExp) =>
	Object.fromEntries(
		Object.entries(SOURCES).filter(([path]) => extension.test(path))
	);

describe('packaging', () => {
	it('imports stylesheets only from .svelte components, never from .ts modules', () => {
		const sources = sourcesOf(/\.ts$/);
		const offenders = Object.keys(sources).filter((path) =>
			/import\s+['"][^'"]+\.css['"]/.test(sources[path])
		);
		expect(Object.keys(sources).length).toBeGreaterThan(20);
		expect(offenders).toEqual([]);
	});

	it('reads only --ren-* tokens RenUI declares, unless the read names a fallback', () => {
		const text = Object.values(SOURCES).join('\n');
		const declared = new Set(
			[...text.matchAll(/(--ren-[\w-]*\w)\s*:|style:(--ren-[\w-]*\w)/g)].map(
				([, property, directive]) => property ?? directive
			)
		);
		const undeclared = [
			...new Set(
				[...text.matchAll(/var\((--ren-[\w-]*\w)\)/g)].map(([, name]) => name)
			)
		].filter((name) => !declared.has(name));
		expect(declared.size).toBeGreaterThan(300);
		expect(undeclared).toEqual([]);
	});

	it('keeps no Lumi UI name', () => {
		const offenders = Object.keys(SOURCES).filter((path) =>
			/lumi(?![n\P{ASCII}])/iu.test(SOURCES[path])
		);
		expect(offenders).toEqual([]);
	});

	it('gives the table pagination a flex basis, because a container has no intrinsic width', () => {
		const table = import.meta.glob<string>(
			'../src/lib/components/Table/Table.svelte',
			{ query: '?raw', import: 'default', eager: true }
		)['../src/lib/components/Table/Table.svelte'];
		expect(table).toMatch(
			/\.ren-table__pagination\) \{\s*(?:\/\*.*?\*\/\s*)?flex: 1 1 \d+rem;/s
		);
	});

	it('keeps plain overscroll containment on overlays only', () => {
		const sources = sourcesOf(/\.(css|svelte)$/);
		const offenders = Object.keys(sources)
			.filter((path) => /overscroll-behavior: contain;/.test(sources[path]))
			.map((path) => path.replace('../src/lib/', ''));
		expect(offenders.sort()).toEqual([
			'components/Dialog/Dialog.svelte',
			'components/Select/Select.svelte',
			'styles/base.css',
			'styles/layout.css'
		]);
	});

	it('declares -webkit-backdrop-filter first, or Lightning CSS drops the standard one', () => {
		const sources = sourcesOf(/\.(css|svelte)$/);
		const offenders = Object.keys(sources).filter((path) =>
			/(?<!-webkit-)backdrop-filter:[^;]+;\s*-webkit-backdrop-filter:/.test(
				sources[path]
			)
		);
		expect(Object.keys(sources).length).toBeGreaterThan(20);
		expect(offenders).toEqual([]);
	});
});
