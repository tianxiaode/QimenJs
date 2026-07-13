/**
 * 控制台日志输出处理器
 *
 * 根据日志级别将格式化后的日志文本输出到相应的控制台方法。
 * 不同的日志级别会使用不同的控制台方法以提供视觉区分和过滤能力。
 *
 * @param text - 已格式化的日志文本
 * @param level - 日志级别，用于确定使用哪种控制台方法
 *
 * @example
 * ```typescript
 * // 输出错误日志到 console.error
 * consoleSink('2023-01-01T12:00:00.000Z ERROR Some error occurred', 'error');
 *
 * // 输出警告日志到 console.warn
 * consoleSink('2023-01-01T12:00:00.000Z WARN  Something unexpected', 'warn');
 *
 * // 输出信息或调试日志到 console.log
 * consoleSink('2023-01-01T12:00:00.000Z INFO  Application started', 'info');
 * ```
 */
export function consoleSink(text: string, level: string, ...data: any[]) {
    // 根据日志级别选择适当的控制台方法
    if (level === 'error') {
        // 错误级别日志使用 console.error 输出
        console.error(text, ...data);
    } else if (level === 'warn') {
        // 警告级别日志使用 console.warn 输出
        console.warn(text, ...data);
    } else {
        // 其他级别（info/debug）使用 console.log 输出
        console.log(text, ...data);
    }
}
