import type { RenColor, RenCompactSize } from '../config';
import type { RenChoiceOption } from '../../types/choice';

export type ToggleGroupValue = string | number;

export interface ToggleGroupProps {
	/** Pressed option values (bindable) */
	value?: ToggleGroupValue[];

	/** Options rendered as toggle buttons */
	options: RenChoiceOption[];

	/** Accent of pressed options
	 * @default "primary"
	 */
	color?: RenColor;

	/** @default "md" */
	size?: RenCompactSize;

	/** @default "horizontal" */
	orientation?: 'horizontal' | 'vertical';

	/** Disable every option */
	disabled?: boolean;

	/** Stretch options to the available width */
	fullWidth?: boolean;

	/** Accessible group name */
	'aria-label'?: string;

	class?: string;

	/** Called with the new pressed values after each toggle */
	onchange?: (value: ToggleGroupValue[]) => void;
}
