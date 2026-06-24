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
export declare function generateCalendarView(year: number, month: number, startDayOfWeek?: number): CalendarDay[];
/**
 * 获取指定月份的周数
 * @param year 年份
 * @param month 月份 (1-12)
 * @param startDayOfWeek 一周开始的星期，默认为0（星期日）
 * @returns 该月的周数
 */
export declare function getWeeksInMonth(year: number, month: number, startDayOfWeek?: number): number;
/**
 * 获取日期在月份中的周数
 * @param date 日期
 * @returns 该日期在月份中的周数
 */
export declare function getWeekNumberInMonth(date: Date): number;
/**
 * 获取月份的天数矩阵（二维数组）
 * @param year 年份
 * @param month 月份 (1-12)
 * @param startDayOfWeek 一周开始的星期，默认为0（星期日）
 * @returns 二维数组，每行代表一周
 */
export declare function getCalendarMatrix(year: number, month: number, startDayOfWeek?: number): CalendarDay[][];
/**
 * 获取一周的日期范围
 * @param date 指定日期
 * @param startDayOfWeek 一周开始的星期，默认为0（星期日）
 * @returns 包含一周开始和结束日期的对象
 */
export declare function getWeekRange(date: Date, startDayOfWeek?: number): {
    start: Date;
    end: Date;
};
//# sourceMappingURL=calendar.d.ts.map