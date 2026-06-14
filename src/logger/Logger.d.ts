import { ILogger, LogEntry, LoggerOptions } from './types';
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
export declare class Logger {
    private readonly options;
    private static children;
    /**
     * 构造一个新的日志记录器实例
     *
     * @param options - 日志记录器选项，包括最低日志级别和颜色设置等
     */
    constructor(options?: LoggerOptions);
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
    static for(target: string | Function): ILogger;
    /**
     * 根日志记录器实例（由 index.ts 初始化）
     * 所有子记录器都基于此根实例工作
     */
    static root: Logger;
    /**
     * 发出日志条目
     *
     * 此方法会检查日志级别过滤条件，格式化日志内容，
     * 并将其发送到适当的输出目标。
     *
     * @param entry - 要发出的日志条目
     */
    emit(entry: LogEntry): void;
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
    private shouldLog;
}
//# sourceMappingURL=Logger.d.ts.map