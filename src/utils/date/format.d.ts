/**
 * 格式化日期为指定格式的字符串
 * @param date 日期对象或日期字符串
 * @param format 日期格式字符串，支持以下占位符：
 * - yyyy: 四位年份
 * - yy: 两位年份
 * - MM: 两位月份
 * - M: 月份
 * - dd: 两位日期
 * - d: 日期
 * - HH: 两位小时（24小时制）
 * - H: 小时（24小时制）
 * - hh: 两位小时（12小时制）
 * - h: 小时（12小时制）
 * - mm: 两位分钟
 * - m: 分钟
 * - ss: 两位秒
 * - s: 秒
 * @returns 格式化后的日期字符串
 */
export declare function formatDate(date: Date | string, format: string): string;
/**
 * 根据指定格式解析日期字符串为Date对象
 * @param date 日期字符串
 * @param format 日期格式字符串
 * @returns 解析后的Date对象，如果解析失败则返回null
 */
export declare function parse(date: string, format: string): Date | null;
//# sourceMappingURL=format.d.ts.map