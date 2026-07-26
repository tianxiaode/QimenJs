/**
 * datetime-picker.ts — 日期时间选择器面板专用计算函数
 *
 * 提供面板渲染和交互逻辑所需的纯计算函数：
 * - 流转字段判定
 * - 日期合法性修正
 * - 年份数字矩阵生成
 * - 分钟/秒十位+个位拆分
 * - 预览栏格式化
 *
 * @module utils/date/datetime-picker
 */

import { getDaysInMonth } from './calculation';

export type DateTimeField = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

export interface DateTimeValue {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

const FLOW_CHAIN: DateTimeField[] = ['year', 'month', 'day', 'hour', 'minute', 'second'];

export function getFlowChain(): DateTimeField[] {
    return FLOW_CHAIN;
}

export function getNextField(current: DateTimeField, showSeconds: boolean): DateTimeField | null {
    const idx = FLOW_CHAIN.indexOf(current);
    for (let i = idx + 1; i < FLOW_CHAIN.length; i++) {
        if (!showSeconds && FLOW_CHAIN[i] === 'second') continue;
        return FLOW_CHAIN[i];
    }
    return null;
}

export function getFlowFromEntry(entry: DateTimeField, showSeconds: boolean): DateTimeField[] {
    const idx = FLOW_CHAIN.indexOf(entry);
    return FLOW_CHAIN.slice(idx).filter(f => showSeconds || f !== 'second');
}

export function clampDay(year: number, month: number, day: number): number {
    const maxDay = getDaysInMonth(year, month - 1);
    return Math.min(day, maxDay);
}

export function fixDateTime(value: DateTimeValue): DateTimeValue {
    const fixedDay = clampDay(value.year, value.month, value.day);
    return { ...value, day: fixedDay };
}

export function createDateTimeValue(date?: Date): DateTimeValue {
    const d = date ?? new Date();
    return {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        hour: d.getHours(),
        minute: d.getMinutes(),
        second: d.getSeconds(),
    };
}

export function dateTimeValueToDate(value: DateTimeValue): Date {
    return new Date(value.year, value.month - 1, value.day, value.hour, value.minute, value.second);
}

export function generateYearDigits(_currentYear: number): {
    thousands: number[];
    hundreds: number[];
    tens: number[];
    ones: number[];
} {
    const thousands = [0, 1, 2];
    const hundreds = Array.from({ length: 10 }, (_, i) => i);
    const tens = Array.from({ length: 10 }, (_, i) => i);
    const ones = Array.from({ length: 10 }, (_, i) => i);
    return { thousands, hundreds, tens, ones };
}

export function splitToDigits(year: number): [number, number, number, number] {
    const s = String(year).padStart(4, '0');
    return [parseInt(s[0]), parseInt(s[1]), parseInt(s[2]), parseInt(s[3])];
}

export function generateMinuteSecondDigits(): {
    tens: number[];
    ones: number[];
} {
    return {
        tens: Array.from({ length: 6 }, (_, i) => i),
        ones: Array.from({ length: 10 }, (_, i) => i),
    };
}

export function formatPreview(value: DateTimeValue, showSeconds: boolean): string {
    const y = String(value.year).padStart(4, '0');
    const m = String(value.month).padStart(2, '0');
    const d = String(value.day).padStart(2, '0');
    const h = String(value.hour).padStart(2, '0');
    const min = String(value.minute).padStart(2, '0');
    const sec = String(value.second).padStart(2, '0');
    const time = showSeconds ? `${h}:${min}:${sec}` : `${h}:${min}`;
    return `${y}年${m}月${d}日 ${time}`;
}

export function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonthValue(year: number, month: number): number {
    return getDaysInMonth(year, month - 1);
}
