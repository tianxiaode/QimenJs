"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = format;
const color_1 = require("./color");
/**
 * 格式化日志条目为字符串
 *
 * @param entry - 要格式化的日志条目
 * @param options - 日志记录器选项，包括是否启用颜色等
 * @returns 格式化后的日志字符串
 *
 * @example
 * ```typescript
 * const entry: LogEntry = {
 *   timestamp: Date.now(),
 *   level: 'info',
 *   category: 'App',
 *   message: 'Application started'
 * };
 * const options: LoggerOptions = { color: true };
 * const formatted = format(entry, options);
 * ```
 */
function format(entry, options) {
    var _a;
    // 将时间戳转换为 ISO 格式的字符串
    const time = new Date(entry.timestamp).toISOString();
    // 获取并填充日志级别的原始文本（用于无颜色模式）
    const rawLevel = entry.level.toUpperCase();
    // 根据选项决定是否对日志级别着色，并保持固定宽度
    const coloredOrRawLevel = (0, color_1.colorLevel)(rawLevel, !!options.color);
    const level = coloredOrRawLevel.padEnd(coloredOrRawLevel.length + Math.max(0, 5 - rawLevel.length));
    // 如果存在分类，则填充到固定宽度，否则为空字符串
    const category = entry.category ? entry.category.padEnd(16) : '';
    // 处理消息内容：如果是错误对象则显示堆栈或消息，否则转换为字符串
    let message = '';
    if (entry.error instanceof Error) {
        message = entry.error.stack || entry.error.message;
    }
    else {
        message = String((_a = entry.message) !== null && _a !== void 0 ? _a : '');
    }
    // 组合并返回格式化的日志字符串
    return `${time} ${level} ${category} ${message}`;
}
//# sourceMappingURL=format.js.map