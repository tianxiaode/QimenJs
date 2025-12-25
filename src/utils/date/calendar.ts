import { addDays, getFirstDayOfMonth, getLastDayOfMonth } from './calculation';

/**
 * 日历日期接口，包含日期信息和显示状态
 */
export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
}

/**
 * 生成指定月份的日历视图，包含前后月份的补充日期
 * @param year 年份
 * @param month 月份 (1-12)
 * @param startDayOfWeek 一周开始的星期，默认为0（星期日）
 * @returns 42天的日期数组（6行7列）
 */
export function generateCalendarView(
    year: number,
    month: number,
    startDayOfWeek: number = 0
): CalendarDay[] {
    const targetDate = new Date(year, month - 1, 1);
    const firstDayOfMonth = getFirstDayOfMonth(targetDate);
    const lastDayOfMonth = getLastDayOfMonth(targetDate);

    // 获取当月第一天是星期几
    const firstDayWeekday = firstDayOfMonth.getDay();
    // 计算日历开始日期（需要向前补充的天数）
    const startOffset = (firstDayWeekday - startDayOfWeek + 7) % 7;

    // 获取日历开始日期
    const calendarStart = addDays(firstDayOfMonth, -startOffset);

    // 生成42天（6行7列）的日历数组
    const calendarDays: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 重置时间部分，只比较日期

    for (let i = 0; i < 42; i++) {
        const date = addDays(calendarStart, i);
        const dateWithoutTime = new Date(date);
        dateWithoutTime.setHours(0, 0, 0, 0);

        calendarDays.push({
            date,
            isCurrentMonth:
                date.getMonth() === targetDate.getMonth() &&
                date.getFullYear() === targetDate.getFullYear(),
            isToday: dateWithoutTime.getTime() === today.getTime(),
        });
    }

    return calendarDays;
}

/**
 * 获取指定月份的周数
 * @param year 年份
 * @param month 月份 (1-12)
 * @param startDayOfWeek 一周开始的星期，默认为0（星期日）
 * @returns 该月的周数
 */
export function getWeeksInMonth(year: number, month: number, startDayOfWeek: number = 0): number {
    const days = generateCalendarView(year, month, startDayOfWeek);
    const firstDay = days.find(day => day.isCurrentMonth)?.date;
    const lastDay = [...days].reverse().find(day => day.isCurrentMonth)?.date;

    const firstWeekNum = getWeekNumberInMonth(firstDay!);
    const lastWeekNum = getWeekNumberInMonth(lastDay!);

    return lastWeekNum - firstWeekNum + 1;
}

/**
 * 获取日期在月份中的周数
 * @param date 日期
 * @returns 该日期在月份中的周数
 */
export function getWeekNumberInMonth(date: Date): number {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayWeekday = firstDayOfMonth.getDay();

    const dayInMonth = date.getDate();
    const weekNumber = Math.ceil((dayInMonth + firstDayWeekday) / 7);

    return weekNumber;
}

/**
 * 获取月份的天数矩阵（二维数组）
 * @param year 年份
 * @param month 月份 (1-12)
 * @param startDayOfWeek 一周开始的星期，默认为0（星期日）
 * @returns 二维数组，每行代表一周
 */
export function getCalendarMatrix(
    year: number,
    month: number,
    startDayOfWeek: number = 0
): CalendarDay[][] {
    const days = generateCalendarView(year, month, startDayOfWeek);
    const matrix: CalendarDay[][] = [];

    for (let i = 0; i < 6; i++) {
        matrix.push(days.slice(i * 7, (i + 1) * 7));
    }

    return matrix;
}

/**
 * 获取一周的日期范围
 * @param date 指定日期
 * @param startDayOfWeek 一周开始的星期，默认为0（星期日）
 * @returns 包含一周开始和结束日期的对象
 */
export function getWeekRange(date: Date, startDayOfWeek: number = 0): { start: Date; end: Date } {
    const dayOfWeek = date.getDay();
    const startOffset = (dayOfWeek - startDayOfWeek + 7) % 7;

    const start = addDays(date, -startOffset);
    const end = addDays(start, 6);

    return {
        start,
        end,
    };
}
