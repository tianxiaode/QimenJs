/**
 * 为指定日期添加月份
 * @param date 基准日期
 * @param months 要添加的月数
 * @returns 添加月份后的新日期
 */
export declare function addMonths(date: Date | string, months: number): Date;
/**
 * 获取指定年月的天数
 * @param year 年份
 * @param month 月份（从0开始）
 * @returns 该年月的天数
 */
export declare function getDaysInMonth(year: number, month: number): number;
/**
 * 获取指定日期所在月份的第一天
 * @param date 指定日期
 * @returns 该月第一天的日期对象
 */
export declare function getFirstDayOfMonth(date: Date | string): Date;
/**
 * 获取指定日期所在月份的最后一天
 * @param date 指定日期
 * @returns 该月最后一天的日期对象
 */
export declare function getLastDayOfMonth(date: Date | string): Date;
//# sourceMappingURL=months.d.ts.map