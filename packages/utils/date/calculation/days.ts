/**
 * 为指定日期添加天数
 * @param date 基准日期
 * @param days 要添加的天数
 * @returns 添加天数后的新日期
 */
export function addDays(date: Date | string, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

/**
 * 获取指定日期在年内的周数
 * @param date 指定日期
 * @returns 该日期在年内的周数
 */
export function getWeekNumber(date: Date | string): number {
    const d = new Date(date);
    const firstDayOfYear = getFirstDayOfYear(d);
    const diff = Math.round((d.getTime() - firstDayOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.ceil(diff / 7);
}

/**
 * 获取指定日期的ISO周数
 * @param date 指定日期
 * @returns ISO周数
 */
export function getISOWeek(date: Date | string): number {
    const d = new Date(date);
    const year = d.getFullYear();
    const firstDayOfYear = getFirstDayOfYear(date);
    const dayOfWeek = firstDayOfYear.getDay();
    const diff = d.getTime() - firstDayOfYear.getTime();
    const daysSinceFirstMonday = Math.floor(diff / (24 * 60 * 60 * 1000)) + (dayOfWeek === 0 ? -6 : dayOfWeek - 1);
    return Math.floor(daysSinceFirstMonday / 7) + 1;
}

/**
 * 获取指定日期所在年的ISO周数总数
 * @param date 指定日期
 * @returns 该年ISO周数总数
 */
export function getISOWeeksInYear(date: Date | string): number {
    const d = new Date(date);
    const year = d.getFullYear();
    const firstDayOfYear = getFirstDayOfYear(date);
    const dayOfWeek = firstDayOfYear.getDay();
    const diff = new Date(year + 1, 0, 1).getTime() - firstDayOfYear.getTime();
    const daysSinceFirstMonday = Math.floor(diff / (24 * 60 * 60 * 1000)) + (dayOfWeek === 0 ? -6 : dayOfWeek - 1);
    return Math.ceil(daysSinceFirstMonday / 7);
}

/**
 * 获取指定日期所在年的第一天
 * @param date 指定日期
 * @returns 该年第一天的日期对象
 */
function getFirstDayOfYear(date: Date | string): Date {
    const d = new Date(date);
    return new Date(d.getFullYear(), 0, 1);
}

/**
 * 获取指定日期所在周的第一天（周日为一周的开始）
 * @param date 指定日期
 * @returns 该周第一天的日期对象
 */
export function getFirstDayOfWeek(date: Date | string): Date {
    const d = new Date(date);
    const diff = d.getDay() === 0 ? 6 : d.getDay() - 1;
    return addDays(d, -diff);
}