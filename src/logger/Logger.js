"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const format_1 = require("./format");
const console_1 = require("./sinks/console");
const LoggerChild_1 = require("./LoggerChild");
// 定义日志级别顺序，用于比较日志级别的重要性
const LEVEL_ORDER = ['debug', 'info', 'warn', 'error'];
/**
 * 主日志记录器类
 *
 * 负责管理日志配置、过滤和输出。提供创建子记录器的功能，
 * 并根据配置决定哪些日志应该被记录。
 *
 * @example
 * ```typescript
 * // 创建根记录器
 * const logger = new Logger({ level: 'info', color: true });
 *
 * // 获取特定组件的子记录器
 * const componentLogger = Logger.for('MyComponent');
 *
 * // 记录日志
 * logger.emit({
 *   timestamp: Date.now(),
 *   level: 'info',
 *   category: 'MyComponent',
 *   message: 'Application started'
 * });
 * ```
 */
class Logger {
    /**
     * 构造一个新的日志记录器实例
     *
     * @param options - 日志记录器选项，包括最低日志级别和颜色设置等
     */
    constructor(options = {}) {
        this.options = options;
    }
    /**
     * 为指定的目标（通常是类或模块）创建或获取一个子记录器
     *
     * 此方法确保每个目标只有一个唯一的子记录器实例。
     *
     * @param target - 目标名称或构造函数
     * @returns 对应目标的子记录器实例
     *
     * @example
     * ```typescript
     * // 使用字符串标识符
     * const logger = Logger.for('UserService');
     *
     * // 使用类构造函数
     * class UserService {}
     * const logger = Logger.for(UserService);
     * ```
     */
    static for(target) {
        // 确定目标的名称
        const name = typeof target === 'string' ? target : target.$ClassName || target.name;
        // 查找现有子记录器或创建新实例
        let child = this.children.get(name);
        if (!child) {
            child = new LoggerChild_1.LoggerChild(this.root, name);
            this.children.set(name, child);
        }
        return child;
    }
    /**
     * 发出日志条目
     *
     * 此方法会检查日志级别过滤条件，格式化日志内容，
     * 并将其发送到适当的输出目标。
     *
     * @param entry - 要发出的日志条目
     */
    emit(entry) {
        // 检查当前日志级别是否满足最小记录要求
        if (!this.shouldLog(entry.level))
            return;
        // 格式化日志条目
        const text = (0, format_1.format)(entry, this.options);
        // 输出到控制台
        (0, console_1.consoleSink)(text, entry.level);
    }
    /**
     * 判断给定的日志级别是否应该被记录
     *
     * 基于配置的最低日志级别进行判断。
     * 只有重要性等于或高于最低级别的日志才会被记录。
     *
     * @param level - 要检查的日志级别
     * @returns 如果应该记录该级别的日志则返回 true，否则返回 false
     *
     * @example
     * ```typescript
     * // 如果最低级别设置为 'info'
     * logger.shouldLog('debug'); // false
     * logger.shouldLog('info');  // true
     * logger.shouldLog('error'); // true
     * ```
     */
    shouldLog(level) {
        var _a;
        const min = (_a = this.options.level) !== null && _a !== void 0 ? _a : 'info';
        return LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(min);
    }
}
exports.Logger = Logger;
// 存储已创建的子记录器实例
Logger.children = new Map();
//# sourceMappingURL=Logger.js.map