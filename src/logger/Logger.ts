import { ILogger, LogEntry, LogLevel, LoggerOptions } from './types';
import { format } from './format';
import { consoleSink } from './sinks/console';
import { LoggerChild } from './LoggerChild';

// 定义日志级别顺序，用于比较日志级别的重要性
const LEVEL_ORDER: LogLevel[] = ['debug', 'info', 'warn', 'error'];

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
export class Logger {
    // 存储已创建的子记录器实例
    private static children = new Map<string, ILogger>();

    /**
     * 构造一个新的日志记录器实例
     *
     * @param options - 日志记录器选项，包括最低日志级别和颜色设置等
     */
    constructor(private readonly options: LoggerOptions = {}) {}

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
    static for(target: string | Function): ILogger {
        // 确定目标的名称
        const name =
            typeof target === 'string' ? target : (target as any).$ClassName || target.name;

        // 查找现有子记录器或创建新实例
        let child = this.children.get(name);
        if (!child) {
            child = new LoggerChild(this.root, name);
            this.children.set(name, child);
        }
        return child;
    }

    /**
     * 根日志记录器实例
     * 所有子记录器都基于此根实例工作
     */
    static root: Logger = new Logger();

    /**
     * 发出日志条目
     *
     * 此方法会检查日志级别过滤条件，格式化日志内容，
     * 并将其发送到适当的输出目标。
     *
     * @param entry - 要发出的日志条目
     */
    emit(entry: LogEntry) {
        // 检查当前日志级别是否满足最小记录要求
        if (!this.shouldLog(entry.level)) return;

        // 格式化日志条目
        const text = format(entry, this.options);

        // 输出到控制台
        consoleSink(text, entry.level, ...(entry.data ?? []));
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
    private shouldLog(level: LogLevel): boolean {
        const min = this.options.level ?? 'info';
        return LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(min);
    }
}
