"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCalendarView = generateCalendarView;
exports.getWeeksInMonth = getWeeksInMonth;
exports.getWeekNumberInMonth = getWeekNumberInMonth;
exports.getCalendarMatrix = getCalendarMatrix;
exports.getWeekRange = getWeekRange;
const calculation_1 = require("./calculation");
/**
 * 生成指定月份的日历视图，包含前后月份的补充日期
 * @param year 年份
 * @param month 月份 (1-12)
 * @param startDayOfWeek 一周开始的星期，默认为0（星期日）
 * @returns 42天的日期数组（6行7列）
 */
function generateCalendarView(year, month, startDayOfWeek = 0) {
    const targetDate = new Date(year, month - 1, 1);
    const firstDayOfMonth = (0, calculation_1.getFirstDayOfMonth)(targetDate);
    const lastDayOfMonth = (0, calculation_1.getLastDayOfMonth)(targetDate);
    // 获取当月第一天是星期几
    const firstDayWeekday = firstDayOfMonth.getDay();
    // 计算日历开始日期（需要向前补充的天数）
    const startOffset = (firstDayWeekday - startDayOfWeek + 7) % 7;
    // 获取日历开始日期
    const calendarStart = (0, calculation_1.addDays)(firstDayOfMonth, -startOffset);
    // 生成42天（6行7列）的日历数组
    const calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 重置时间部分，只比较日期
    for (let i = 0; i < 42; i++) {
        const date = (0, calculation_1.addDays)(calendarStart, i);
        const dateWithoutTime = new Date(date);
        dateWithoutTime.setHours(0, 0, 0, 0);
        calendarDays.push({
            date,
            isCurrentMonth: date.getMonth() === targetDate.getMonth() &&
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
function getWeeksInMonth(year, month, startDayOfWeek = 0) {
    var _a, _b;
    const days = generateCalendarView(year, month, startDayOfWeek);
    const firstDay = (_a = days.find(day => day.isCurrentMonth)) === null || _a === void 0 ? void 0 : _a.date;
    const lastDay = (_b = [...days].reverse().find(day => day.isCurrentMonth)) === null || _b === void 0 ? void 0 : _b.date;
    const firstWeekNum = getWeekNumberInMonth(firstDay);
    const lastWeekNum = getWeekNumberInMonth(lastDay);
    return lastWeekNum - firstWeekNum + 1;
}
/**
 * 获取日期在月份中的周数
 * @param date 日期
 * @returns 该日期在月份中的周数
 */
function getWeekNumberInMonth(date) {
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
function getCalendarMatrix(year, month, startDayOfWeek = 0) {
    const days = generateCalendarView(year, month, startDayOfWeek);
    const matrix = [];
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
function getWeekRange(date, startDayOfWeek = 0) {
    const dayOfWeek = date.getDay();
    const startOffset = (dayOfWeek - startDayOfWeek + 7) % 7;
    const start = (0, calculation_1.addDays)(date, -startOffset);
    const end = (0, calculation_1.addDays)(start, 6);
    return {
        start,
        end,
    };
}
//# sourceMappingURL=calendar.js.map