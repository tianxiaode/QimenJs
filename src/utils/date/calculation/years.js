"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addYears = addYears;
exports.getFirstDayOfYear = getFirstDayOfYear;
exports.getLastDayOfYear = getLastDayOfYear;
/**
 * 为指定日期添加年份
 * @param date 基准日期
 * @param years 要添加的年数
 * @returns 添加年份后的新日期
 */
function addYears(date, years) {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth();
    const originalYear = d.getFullYear();
    const targetYear = originalYear + years;
    // 创建目标年份的新日期，但要检查是否是2月29日的情况
    const result = new Date(d);
    result.setFullYear(targetYear);
    // 检查是否是闰年的2月29日，且目标年份不是闰年
    // 这种情况下，JavaScript会自动将日期调整到3月1日
    if (month === 1 && day === 29 && isLeapYear(originalYear) && !isLeapYear(targetYear)) {
        // 如果原始日期是闰年的2月29日，但目标年份不是闰年，
        // 则将日期调整为2月28日（目标年2月的最后一天）
        result.setMonth(1); // 2月
        result.setDate(28); // 28日
    }
    return result;
}
/**
 * 判断是否为闰年
 * @param year 年份
 * @returns 是否为闰年
 */
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
/**
 * 获取指定日期所在年的第一天
 * @param date 指定日期
 * @returns 该年第一天的日期对象
 */
function getFirstDayOfYear(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), 0, 1);
}
/**
 * 获取指定日期所在年的最后一天
 * @param date 指定日期
 * @returns 该年最后一天的日期对象
 */
function getLastDayOfYear(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), 11, 31);
}
//# sourceMappingURL=years.js.map