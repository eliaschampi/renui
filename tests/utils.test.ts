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
import {
	addMonths,
	monthGrid,
	parseDate,
	parseTime,
	toIsoDate,
	toTime,
	weekStartOf
} from '../src/lib/utils/date';

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

describe('date utils', () => {
	const day = (iso: string) => parseDate(iso)!;

	it('rejects impossible and malformed dates, accepts leap days', () => {
		expect(parseDate('2026-02-31')).toBeUndefined();
		expect(parseDate('2026-13-01')).toBeUndefined();
		expect(parseDate('')).toBeUndefined();
		expect(toIsoDate(day('2024-02-29'))).toBe('2024-02-29');
		expect(parseDate('2026-02-29')).toBeUndefined();
	});

	it('keeps a two-digit year in the first century instead of 19xx', () => {
		const early = day('0050-06-15');
		expect(early.getUTCFullYear()).toBe(50);
		expect(toIsoDate(early)).toBe('0050-06-15');
	});

	it('clamps addMonths to the end of a shorter month', () => {
		expect(toIsoDate(addMonths(day('2026-01-31'), 1))).toBe('2026-02-28');
		expect(toIsoDate(addMonths(day('2024-01-31'), 1))).toBe('2024-02-29');
		expect(toIsoDate(addMonths(day('2026-03-15'), -12))).toBe('2025-03-15');
		expect(toIsoDate(addMonths(day('2026-12-31'), 2))).toBe('2027-02-28');
	});

	it('lays a month out as six weeks starting on the configured weekday', () => {
		for (const weekStart of [0, 1, 6]) {
			const grid = monthGrid(day('2026-11-19'), weekStart);
			expect(grid).toHaveLength(6);
			expect(grid.every((week) => week.length === 7)).toBe(true);
			expect(grid[0][0].getUTCDay()).toBe(weekStart);
			expect(grid.flat().map(toIsoDate)).toContain('2026-11-01');
		}
	});

	it('reads the first weekday of a locale and falls back to Sunday', () => {
		expect(weekStartOf('en-US')).toBe(0);
		expect(weekStartOf('es-ES')).toBe(1);
		expect(weekStartOf('not a locale!')).toBe(0);
	});

	it('converts times of day to minutes and back', () => {
		expect(parseTime('09:30')).toBe(570);
		expect(parseTime('23:59:59')).toBe(1439);
		expect(parseTime('24:00')).toBeUndefined();
		expect(parseTime('9:30')).toBeUndefined();
		expect(toTime(570)).toBe('09:30');
	});

	it('formats date-only strings by calendar day and rejects impossible ones', () => {
		expect(formatDate('2026-02-31')).toBe('');
		expect(
			formatDate('2026-11-19', { locale: 'en-US', dateStyle: 'medium' })
		).toBe('Nov 19, 2026');
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
			'components/DatePicker/DatePicker.svelte',
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
