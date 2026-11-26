import { flushSync, mount, tick, unmount, type Component } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Calendar, DatePicker, TimePicker } from '../src/lib';

const mounted: ReturnType<typeof mount>[] = [];

function render<Props extends Record<string, any>>(
	component: Component<Props, any, any>,
	props: Props
) {
	const target = document.body.appendChild(document.createElement('div'));
	const instance = mount(component, { target, props });
	mounted.push(instance);
	flushSync();
	return target;
}

/** jsdom has no layout, so a zero-sized viewport would clamp every surface. */
function stubViewport(): void {
	for (const [side, value] of [
		['clientWidth', 1000],
		['clientHeight', 800]
	] as const) {
		Object.defineProperty(document.documentElement, side, {
			configurable: true,
			value
		});
	}
}

afterEach(() => {
	while (mounted.length) unmount(mounted.pop()!);
	document.body.innerHTML = '';
	const root = document.documentElement as unknown as Record<string, unknown>;
	delete root.clientWidth;
	delete root.clientHeight;
});

const fullDate = new Intl.DateTimeFormat('en-US', {
	dateStyle: 'full',
	timeZone: 'UTC'
});

/** The day button of `iso`, found by the full date it is labelled with. */
function day(root: ParentNode, iso: string): HTMLButtonElement {
	const label = fullDate.format(new Date(`${iso}T00:00:00Z`));
	return root.querySelector<HTMLButtonElement>(
		`button[aria-label="${label}"]`
	)!;
}

/** The roving day: the one tab stop of the grid. */
const stop = (root: ParentNode) =>
	root.querySelector<HTMLButtonElement>('.ren-calendar__day[tabindex="0"]')!;

const title = (root: ParentNode) =>
	root.querySelector('.ren-calendar__header .ren-sr-only')!.textContent!.trim();

function press(element: Element, key: string, init: KeyboardEventInit = {}) {
	element.dispatchEvent(
		new KeyboardEvent('keydown', {
			key,
			bubbles: true,
			cancelable: true,
			...init
		})
	);
}

/** Collapses whitespace: ICU may join "9:00" and "AM" with U+202F. */
const plain = (text: string | null | undefined) =>
	(text ?? '').replace(/\s+/g, ' ').trim();

describe('Calendar', () => {
	it('selects a day on click and marks its cell selected', () => {
		const onchange = vi.fn();
		const target = render(Calendar, { value: '2026-11-19', onchange });
		expect(
			day(target, '2026-11-19').closest('td')!.getAttribute('aria-selected')
		).toBe('true');

		day(target, '2026-11-20').click();
		flushSync();

		expect(onchange).toHaveBeenCalledTimes(1);
		expect(onchange).toHaveBeenCalledWith('2026-11-20');
		expect(
			day(target, '2026-11-20').closest('td')!.getAttribute('aria-selected')
		).toBe('true');
		expect(
			day(target, '2026-11-19').closest('td')!.getAttribute('aria-selected')
		).toBe('false');
	});

	it('writes the pick back to a bound value', () => {
		const props = $state({ value: '2026-11-19' });
		const target = render(Calendar, props);
		day(target, '2026-11-02').click();
		flushSync();
		expect(props.value).toBe('2026-11-02');
	});

	it('refuses days outside min and max and stops paging at their months', () => {
		const onchange = vi.fn();
		const target = render(Calendar, {
			value: '2026-11-19',
			min: '2026-11-10',
			max: '2026-11-25',
			onchange
		});

		const early = day(target, '2026-11-05');
		expect(early.getAttribute('aria-disabled')).toBe('true');
		early.click();
		day(target, '2026-11-26').click();
		flushSync();
		expect(onchange).not.toHaveBeenCalled();

		expect(day(target, '2026-11-12').hasAttribute('aria-disabled')).toBe(false);
		const step = (name: string) =>
			target.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;
		expect(step('Previous month').disabled).toBe(true);
		expect(step('Next month').disabled).toBe(true);
	});

	it('refuses days an isDateDisabled predicate rejects', () => {
		const onchange = vi.fn();
		const target = render(Calendar, {
			value: '2026-11-19',
			isDateDisabled: (date: string) => date === '2026-11-21',
			onchange
		});
		const blocked = day(target, '2026-11-21');
		expect(blocked.getAttribute('aria-disabled')).toBe('true');
		blocked.click();
		flushSync();
		expect(onchange).not.toHaveBeenCalled();
	});

	it('moves the roving day with arrows and the month with PageDown', async () => {
		const target = render(Calendar, { value: '2026-11-19' });
		expect(stop(target)).toBe(day(target, '2026-11-19'));
		expect(title(target)).toBe('November 2026');
		day(target, '2026-11-19').focus();

		press(document.activeElement!, 'ArrowRight');
		await tick();
		expect(stop(target)).toBe(day(target, '2026-11-20'));
		expect(document.activeElement).toBe(day(target, '2026-11-20'));
		expect(
			target.querySelectorAll('.ren-calendar__day[tabindex="0"]')
		).toHaveLength(1);

		press(document.activeElement!, 'PageDown');
		await tick();
		expect(title(target)).toBe('December 2026');
		expect(stop(target)).toBe(day(target, '2026-12-20'));
		expect(document.activeElement).toBe(day(target, '2026-12-20'));
	});

	it('crosses into the next month when an arrow runs off the grid row', async () => {
		const target = render(Calendar, { value: '2026-11-30' });
		day(target, '2026-11-30').focus();
		press(document.activeElement!, 'ArrowDown');
		await tick();
		expect(title(target)).toBe('December 2026');
		expect(document.activeElement).toBe(day(target, '2026-12-07'));
	});

	it('completes a range on the second click, in chronological order', () => {
		const props = $state({
			range: true,
			start: '',
			end: '',
			onchange: vi.fn()
		});
		const target = render(Calendar, props);

		day(target, '2026-11-15').click();
		flushSync();
		expect(props.onchange).not.toHaveBeenCalled();
		expect(props.start).toBe('');

		day(target, '2026-11-10').click();
		flushSync();
		expect(props.onchange).toHaveBeenCalledTimes(1);
		expect(props.onchange).toHaveBeenCalledWith('2026-11-10', '2026-11-15');
		expect([props.start, props.end]).toEqual(['2026-11-10', '2026-11-15']);

		const within = day(target, '2026-11-12').closest('td')!;
		expect(within.classList.contains('ren-calendar__cell--within')).toBe(true);
		expect(
			day(target, '2026-11-10').closest('td')!.getAttribute('aria-selected')
		).toBe('true');
	});

	it('keeps the roving day on a range end picked by keyboard', async () => {
		const props = $state({
			range: true,
			start: '2026-11-02',
			end: '2026-11-03'
		});
		const target = render(Calendar, props);
		const walk = async (steps: number) => {
			for (let i = 0; i < steps; i++) {
				press(document.activeElement!, 'ArrowRight');
				await tick();
			}
		};
		day(target, '2026-11-02').focus();
		await walk(8);
		(document.activeElement as HTMLButtonElement).click();
		flushSync();
		await walk(5);
		(document.activeElement as HTMLButtonElement).click();
		flushSync();

		expect([props.start, props.end]).toEqual(['2026-11-10', '2026-11-15']);
		expect(stop(target)).toBe(day(target, '2026-11-15'));
		await walk(1);
		expect(document.activeElement).toBe(day(target, '2026-11-16'));
	});

	it('stays on the month where a range ends, and follows an outside change', () => {
		const props = $state({
			range: true,
			start: '2026-11-02',
			end: '2026-11-03'
		});
		const target = render(Calendar, props);
		day(target, '2026-11-20').click();
		flushSync();
		target
			.querySelector<HTMLButtonElement>('button[aria-label="Next month"]')!
			.click();
		flushSync();
		day(target, '2026-12-18').click();
		flushSync();

		expect([props.start, props.end]).toEqual(['2026-11-20', '2026-12-18']);
		expect(title(target)).toBe('December 2026');

		props.start = '2027-03-05';
		props.end = '2027-03-09';
		flushSync();
		expect(title(target)).toBe('March 2027');
	});

	it('starts the week on weekStart, else on the locale first day', () => {
		const first = (root: ParentNode) =>
			root.querySelector('thead th')!.textContent!.trim();
		expect(first(render(Calendar, {}))).toBe('Sun');
		expect(first(render(Calendar, { weekStart: 1 }))).toBe('Mon');
	});
});

describe('DatePicker', () => {
	const field = (root: ParentNode) =>
		root.querySelector<HTMLInputElement>('input[role="combobox"]')!;
	const surface = () => document.querySelector<HTMLElement>('[role="dialog"]');

	async function open(target: HTMLElement) {
		stubViewport();
		field(target).click();
		flushSync();
		await vi.waitFor(() => expect(surface()).not.toBeNull());
		return surface()!;
	}

	it('shows the formatted value, or the placeholder when empty', () => {
		const filled = render(DatePicker, { value: '2026-11-19' });
		expect(field(filled).value).toBe('Nov 19, 2026');

		const empty = render(DatePicker, { value: '' });
		expect(field(empty).value).toBe('');
		expect(field(empty).placeholder).toBe('Select a date');
		expect(empty.querySelector('button[aria-label="Clear"]')).toBeNull();
	});

	it('opens a portaled dialog on click and closes it on Escape, back to the field', async () => {
		const target = render(DatePicker, { value: '2026-11-19' });
		const input = field(target);
		expect(input.getAttribute('aria-expanded')).toBe('false');

		const dialog = await open(target);
		expect(dialog.parentElement).toBe(document.body);
		expect(target.contains(dialog)).toBe(false);
		expect(input.getAttribute('aria-expanded')).toBe('true');
		expect(input.getAttribute('aria-controls')).toBe(dialog.id);
		expect(dialog.querySelector('[role="grid"]')).not.toBeNull();

		press(dialog, 'Escape');
		flushSync();
		expect(input.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(input);
		await vi.waitFor(() => expect(surface()).toBeNull());
	});

	it('moves focus to the selected day once the surface is placed', async () => {
		const target = render(DatePicker, { value: '2026-11-19' });
		const dialog = await open(target);
		await vi.waitFor(() =>
			expect(document.activeElement).toBe(day(dialog, '2026-11-19'))
		);
	});

	it('closes and reports the date when a day is chosen', async () => {
		const onchange = vi.fn();
		const target = render(DatePicker, { value: '2026-11-19', onchange });
		const dialog = await open(target);

		day(dialog, '2026-11-24').click();
		flushSync();

		expect(onchange).toHaveBeenCalledTimes(1);
		expect(onchange.mock.calls[0][0]).toBe('2026-11-24');
		expect(field(target).getAttribute('aria-expanded')).toBe('false');
		expect(field(target).value).toBe('Nov 24, 2026');
		await vi.waitFor(() => expect(surface()).toBeNull());
	});

	it('shows a range as one formatted span and submits it as an ISO interval', () => {
		const target = render(DatePicker, {
			range: true,
			start: '2026-11-03',
			end: '2026-11-09',
			name: 'trip'
		});
		const text = field(target).value;
		expect(text).toContain('3');
		expect(text).toContain('9');
		expect(text).toContain('2026');
		expect(text.match(/Nov/g)).toHaveLength(1);
		expect(
			target.querySelector<HTMLInputElement>('input[name="trip"]')!.value
		).toBe('2026-11-03/2026-11-09');

		const empty = render(DatePicker, { range: true, name: 'trip' });
		expect(field(empty).placeholder).toBe('Select dates');
		expect(
			empty.querySelector<HTMLInputElement>('input[name="trip"]')!.value
		).toBe('');
	});

	it('keeps the surface open after a range start and closes on the end', async () => {
		const onchange = vi.fn();
		const target = render(DatePicker, { range: true, onchange });
		const dialog = await open(target);

		day(dialog, '2026-11-12').click();
		flushSync();
		expect(onchange).not.toHaveBeenCalled();
		expect(field(target).getAttribute('aria-expanded')).toBe('true');

		day(dialog, '2026-11-18').click();
		flushSync();
		expect(onchange).toHaveBeenCalledWith('2026-11-12', '2026-11-18');
		expect(field(target).getAttribute('aria-expanded')).toBe('false');
		expect(field(target).value).toContain('12');
	});

	it('clears the value and reports an empty date', () => {
		const onchange = vi.fn();
		const target = render(DatePicker, { value: '2026-11-19', onchange });

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Clear"]')!
			.click();
		flushSync();

		expect(onchange).toHaveBeenCalledTimes(1);
		expect(onchange).toHaveBeenCalledWith('');
		expect(field(target).value).toBe('');
		expect(target.querySelector('button[aria-label="Clear"]')).toBeNull();
	});
});

describe('TimePicker', () => {
	const field = (root: ParentNode) =>
		root.querySelector<HTMLInputElement>('input[role="combobox"]')!;
	const options = () => [
		...document.querySelectorAll<HTMLElement>('[role="option"]')
	];
	const labels = () =>
		options().map((o) =>
			plain(o.querySelector('.ren-select__label')!.textContent)
		);

	async function open(target: HTMLElement) {
		stubViewport();
		field(target).click();
		flushSync();
		await vi.waitFor(() =>
			expect(document.querySelector('[role="listbox"]')).not.toBeNull()
		);
	}

	it('lists a day in half hours by default', async () => {
		const target = render(TimePicker, {});
		expect(field(target).placeholder).toBe('Select a time');
		await open(target);
		const list = labels();
		expect(list).toHaveLength(48);
		expect(list[0]).toBe('12:00 AM');
		expect(list.at(-1)).toBe('11:30 PM');
	});

	it('limits the options to min and max at the given interval', async () => {
		const target = render(TimePicker, {
			interval: 60,
			min: '09:00',
			max: '12:00'
		});
		await open(target);
		expect(labels()).toEqual(['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM']);
	});

	it('keeps a value between steps as a selected option', async () => {
		const target = render(TimePicker, { value: '09:07' });
		expect(plain(field(target).value)).toBe('9:07 AM');
		await open(target);

		const list = labels();
		expect(list).toHaveLength(49);
		expect(list.slice(18, 21)).toEqual(['9:00 AM', '9:07 AM', '9:30 AM']);
		const selected = options().filter(
			(o) => o.getAttribute('aria-selected') === 'true'
		);
		expect(selected).toHaveLength(1);
		expect(plain(selected[0].textContent)).toBe('9:07 AM');
	});

	it('reports the 24-hour value of the chosen option', async () => {
		const onchange = vi.fn();
		const target = render(TimePicker, { onchange });
		await open(target);

		options()[labels().indexOf('2:30 PM')].click();
		flushSync();

		expect(onchange).toHaveBeenCalledTimes(1);
		expect(onchange).toHaveBeenCalledWith('14:30');
		expect(plain(field(target).value)).toBe('2:30 PM');
	});
});
