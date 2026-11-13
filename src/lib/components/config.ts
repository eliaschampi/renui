/**
 * Shared semantic scales and motion constants. Every value is a named export,
 * so a component bundles only what it reads.
 */

export type RenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type RenColor =
	'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type RenCompactSize = Extract<RenSize, 'sm' | 'md'>;
export type RenControlSize = Extract<RenSize, 'sm' | 'md' | 'lg'>;
export type RenDisplaySize = Extract<RenSize, 'sm' | 'md' | 'lg' | 'xl'>;
export type RenExtendedSize = Extract<
	RenSize,
	'xs' | 'sm' | 'md' | 'lg' | 'xl'
>;

/** JS transition durations (ms), mirroring the `--ren-duration-*` tokens. */
export const DURATION_FAST = 150;
export const DURATION_BASE = 220;

/**
 * A JS transition duration that honors `prefers-reduced-motion`. Svelte
 * transitions run through the Web Animations API, which the global
 * reduced-motion CSS cannot reach; transition params are read when each
 * transition starts, so `{ duration: motion(DURATION_BASE) }` stays current.
 */
export function motion(ms: number): number {
	return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
		? 0
		: ms;
}
