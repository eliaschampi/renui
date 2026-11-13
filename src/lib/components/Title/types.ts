import type { IconSource } from '../../utils/icons';
import type { RenColor, RenDisplaySize } from '../config';

export type TitleColor = RenColor | 'text';
export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TitleSize = RenDisplaySize;

export interface TitleProps {
	/** Heading id for accessible labelling */
	id?: string;

	/** Semantic heading level */
	level?: TitleLevel;

	/** Title size */
	size?: TitleSize;

	/** Title text color */
	color?: TitleColor;

	/** Icon name */
	icon?: IconSource;

	/** Icon color */
	iconColor?: TitleColor;

	/** Main title text */
	title?: string;

	/** Subtitle text */
	subtitle?: string;

	/** Custom class */
	class?: string;
}
