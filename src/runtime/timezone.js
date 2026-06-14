"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimezone = getTimezone;
/**
 * 获取当前环境的时区信息
 *
 * 使用 Intl.DateTimeFormat().resolvedOptions().timeZone 获取系统时区
 * 返回标准的 IANA 时区标识符，例如 "Asia/Shanghai"、"America/New_York" 等
 *
 * @returns {string} 系统时区标识符
 */
function getTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
//# sourceMappingURL=timezone.js.map