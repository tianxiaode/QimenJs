import type { DateTimeValue } from '@/utils/date';

export type DigitPosition = 'thousands' | 'hundreds' | 'tens' | 'ones';

export type PanelView = 'date' | 'year' | 'month' | 'hour' | 'minute' | 'second';

export interface YearPanelState {
    digits: Record<DigitPosition, number>;
    currentPosition: DigitPosition;
    value: DateTimeValue;
    container: HTMLElement | null;
    rules: any[];
}
