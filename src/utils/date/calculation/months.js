"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMonths = addMonths;
exports.getDaysInMonth = getDaysInMonth;
exports.getFirstDayOfMonth = getFirstDayOfMonth;
exports.getLastDayOfMonth = getLastDayOfMonth;
/**
 * 为指定日期添加月份
 * @param date 基准日期
 * @param months 要添加的月数
 * @returns 添加月份后的新日期
 */
function addMonths(date, months) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + months;
    const day = Math.min(d.getDate(), getDaysInMonth(year, month));
    d.setFullYear(year, month, day);
    return d;
}
/**
 * 获取指定年月的天数
 * @param year 年份
 * @param month 月份（从0开始）
 * @returns 该年月的天数
 */
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
/**
 * 获取指定日期所在月份的第一天
 * @param date 指定日期
 * @returns 该月第一天的日期对象
 */
function getFirstDayOfMonth(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
}
/**
 * 获取指定日期所在月份的最后一天
 * @param date 指定日期
 * @returns 该月最后一天的日期对象
 */
function getLastDayOfMonth(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
//# sourceMappingURL=months.js.map