/**
 * 获取当前时间
 * @returns 当前时间的Date对象
 */
export declare function now(): Date;
/**
 * 获取今天日期（时间部分归零）
 * @returns 今天日期的Date对象，时间部分为00:00:00.000
 */
export declare function today(): Date;
/**
 * 获取昨天日期（时间部分归零）
 * @returns 昨天日期的Date对象，时间部分为00:00:00.000
 */
export declare function yesterday(): Date;
/**
 * 获取明天日期（时间部分归零）
 * @returns 明天日期的Date对象，时间部分为00:00:00.000
 */
export declare function tomorrow(): Date;
/**
 * 获取本周开始日期（时间部分归零）
 * @returns 本周开始日期的Date对象，时间部分为00:00:00.000
 */
export declare function thisWeek(): Date;
/**
 * 获取本月开始日期（时间部分归零）
 * @returns 本月开始日期的Date对象，时间部分为00:00:00.000
 */
export declare function thisMonth(): Date;
/**
 * 获取本年开始日期（时间部分归零）
 * @returns 本年开始日期的Date对象，时间部分为00:00:00.000
 */
export declare function thisYear(): Date;
/**
 * 计算年龄
 * @param dateOfBirth 出生日期
 * @returns 年龄
 */
export declare const calculateAge: (dateOfBirth: string | Date) => number;
/**
 * 将时间跨度字符串解析为秒数
 * @param timeSpan 时间跨度字符串，格式为 d.hh:mm:ss 或 hh:mm:ss
 * @returns 对应的总秒数
 */
export declare function parseTimeSpanToSeconds(timeSpan: string): number;
/**
 * 将秒数转换为时间跨度字符串
 * @param seconds 总秒数
 * @returns 时间跨度字符串，格式为 d.hh:mm:ss
 */
export declare function convertSecondsToTimeSpan(seconds: number): string;
//# sourceMappingURL=utils.d.ts.map