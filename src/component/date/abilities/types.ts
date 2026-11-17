import type { DateTimeValue } from '@/utils/date';

export type DigitPosition = 'thousands' | 'hundreds' | 'tens' | 'ones';

export type PanelView = 'date' | 'year' | 'month' | 'hour' | 'minute' | 'second';

export type DigitPart = 'tens' | 'ones';

export interface YearPanelState {
    digits: Record<DigitPosition, number>;
    currentPosition: DigitPosition;
    value: DateTimeValue;
    container: HTMLElement | null;
    rules: any[];
}

export interface MonthPanelState {
    value: DateTimeValue;
    container: HTMLElement | null;
    rules: any[];
}

export interface HourPanelState {
    value: DateTimeValue;
    container: HTMLElement | null;
    rules: any[];
}

export interface DigitPanelState {
    value: DateTimeValue;
    fieldName: 'minute' | 'second';
    tensSelected: number;
    onesSelected: number;
    selectingTens: boolean;
    container: HTMLElement | null;
    rules: any[];
}

export interface DayGridState {
    year: number;
    month: number;
    selectedDay: number | undefined;
    startDayOfWeek: number;
    weekdayCells: HTMLElement[];
    dayCells: HTMLElement[];
    rules: any[];
}
