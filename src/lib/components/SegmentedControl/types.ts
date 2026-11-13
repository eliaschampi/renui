import type { RenChoiceOption } from '../../types/choice';
import type { RenColor, RenCompactSize } from '../config';

/** One segment; shares its shape with ToggleGroup options. */
export type SegmentedControlOption = RenChoiceOption;

export type SegmentedControlColor = RenColor;

export interface SegmentedControlProps {
	/** Selected value (bindable); `''` when cleared */
	value?: string | number;
	options: SegmentedControlOption[];
	/** Accent of the active segment @default 'primary' */
	color?: SegmentedControlColor;
	/** @default 'md' */
	size?: RenCompactSize;
	disabled?: boolean;
	/** Stretch segments across the available width */
	fullWidth?: boolean;
	/** @default 'horizontal' */
	orientation?: 'horizontal' | 'vertical';
	/** Compact padding for icon-only options */
	iconOnly?: boolean;
	/** Activating the selected option again clears it */
	clearable?: boolean;
	class?: string;
	/** Accessible group name */
	'aria-label'?: string;
	onchange?: (value: string | number) => void;
}
