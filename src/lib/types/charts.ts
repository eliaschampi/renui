import type { RenColor } from '../components/config';

export type ChartColor = RenColor;
export type ChartValueFormat = 'number' | 'currency' | 'score' | 'ratio';

export interface ChartSeriesPoint {
	key: string;
	label: string;
	value: number;
}
