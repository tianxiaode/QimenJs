/**
 * 为指定日期添加天数
 * @param date 基准日期
 * @param days 要添加的天数
 * @returns 添加天数后的新日期
 */
export declare function addDays(date: Date | string, days: number): Date;
/**
 * 获取指定日期在年内的周数
 * @param date 指定日期
 * @returns 该日期在年内的周数
 */
export declare function getWeekNumber(date: Date | string): number;
/**
 * 获取指定日期的ISO周数
 * @param date 指定日期
 * @returns ISO周数
 */
export declare function getISOWeek(date: Date | string): number;
/**
 * 获取指定日期所在年的ISO周数总数
 * @param date 指定日期
 * @returns 该年ISO周数总数
 */
export declare function getISOWeeksInYear(date: Date | string): number;
/**
 * 获取指定日期所在周的第一天（周日为一周的开始）
 * @param date 指定日期
 * @returns 该周第一天的日期对象
 */
export declare function getFirstDayOfWeek(date: Date | string): Date;
//# sourceMappingURL=days.d.ts.map