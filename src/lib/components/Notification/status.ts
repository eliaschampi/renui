import type { LumiColor } from '../config';

// Seal glyphs (24×24, round stroke), inlined so status surfaces ship no icon
// runtime. They sit on a solid disc, so each is the bare mark, drawn to fill
// the box: shape tells the status apart where color cannot.
const INFO = ['M12 19v-8', 'M12 5.5h.01'];

/** One status glyph per semantic color, shared by Alert, Notification and Toaster. */
export const STATUS_GLYPHS: Record<LumiColor, string[]> = {
	primary: [
		'M10.268 21a2 2 0 0 0 3.464 0',
		'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326'
	],
	secondary: INFO,
	success: ['m5 12.5 4.5 4.5L19 7.5'],
	warning: ['M12 5v8', 'M12 18.5h.01'],
	danger: ['m6.5 6.5 11 11', 'm17.5 6.5-11 11'],
	info: INFO
};

/** Urgent colors interrupt (`alert`); the rest wait their turn (`status`). */
export function statusRole(color: LumiColor): 'alert' | 'status' {
	return color === 'danger' || color === 'warning' ? 'alert' : 'status';
}
