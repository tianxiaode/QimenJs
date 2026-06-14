"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAge = void 0;
exports.now = now;
exports.today = today;
exports.yesterday = yesterday;
exports.tomorrow = tomorrow;
exports.thisWeek = thisWeek;
exports.thisMonth = thisMonth;
exports.thisYear = thisYear;
exports.parseTimeSpanToSeconds = parseTimeSpanToSeconds;
exports.convertSecondsToTimeSpan = convertSecondsToTimeSpan;
/**
 * 获取当前时间
 * @returns 当前时间的Date对象
 */
function now() {
    return new Date();
}
/**
 * 获取今天日期（时间部分归零）
 * @returns 今天日期的Date对象，时间部分为00:00:00.000
 */
function today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
/**
 * 获取昨天日期（时间部分归零）
 * @returns 昨天日期的Date对象，时间部分为00:00:00.000
 */
function yesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
}
/**
 * 获取明天日期（时间部分归零）
 * @returns 明天日期的Date对象，时间部分为00:00:00.000
 */
function tomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
}
/**
 * 获取本周开始日期（时间部分归零）
 * @returns 本周开始日期的Date对象，时间部分为00:00:00.000
 */
function thisWeek() {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
}
/**
 * 获取本月开始日期（时间部分归零）
 * @returns 本月开始日期的Date对象，时间部分为00:00:00.000
 */
function thisMonth() {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}
/**
 * 获取本年开始日期（时间部分归零）
 * @returns 本年开始日期的Date对象，时间部分为00:00:00.000
 */
function thisYear() {
    const d = new Date();
    d.setMonth(0);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}
/**
 * 计算年龄
 * @param dateOfBirth 出生日期
 * @returns 年龄
 */
const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDateResult = new Date(ageDifMs);
    return Math.abs(ageDateResult.getUTCFullYear() - 1970);
};
exports.calculateAge = calculateAge;
/**
 * 将时间跨度字符串解析为秒数
 * @param timeSpan 时间跨度字符串，格式为 d.hh:mm:ss 或 hh:mm:ss
 * @returns 对应的总秒数
 */
function parseTimeSpanToSeconds(timeSpan) {
    // 匹配 d.hh:mm:ss 或 hh:mm:ss 格式
    const timeSpanPattern = /^(?:(\d+)\.)?(\d{1,2}):(\d{2}):(\d{2})$/;
    const match = timeSpan.match(timeSpanPattern);
    if (!match) {
        throw new Error('Invalid TimeSpan format');
    }
    // 提取天、小时、分钟和秒的值
    const days = parseInt(match[1] || '0', 10);
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    const seconds = parseInt(match[4], 10);
    // 计算总秒数
    return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}
/**
 * 将秒数转换为时间跨度字符串
 * @param seconds 总秒数
 * @returns 时间跨度字符串，格式为 d.hh:mm:ss
 */
function convertSecondsToTimeSpan(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds %= 24 * 60 * 60;
    const hours = Math.floor(seconds / (60 * 60));
    seconds %= 60 * 60;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${days}.${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
//# sourceMappingURL=utils.js.map