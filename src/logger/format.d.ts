import { LogEntry, LoggerOptions } from './types';
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
export declare function format(entry: LogEntry, options: LoggerOptions): string;
//# sourceMappingURL=format.d.ts.map