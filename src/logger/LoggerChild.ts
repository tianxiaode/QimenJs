// logger/LoggerChild.ts
import { Logger } from './Logger';
import { ILogger, LogLevel } from './types';

/**
 * 子日志记录器类
 * 
 * 提供针对特定类别（category）的日志记录功能。
 * 这些实例通常通过 [Logger.for()](file://d:\Workspace\projects\QimenJs\src\utils\logger\Logger.ts#L60-L72) 方法创建，与主日志记录器关联。
 * 
 * @example
 * ```typescript
 * // 获取一个子记录器
 * const logger = Logger.for('UserService');
 * 
 * // 记录不同级别的日志
 * logger.debug('Debug information');
 * logger.info('User logged in', userId);
 * logger.warn('Unexpected input', inputData);
 * logger.error(new Error('Something went wrong'));
 * ```
 */
export class LoggerChild implements ILogger {
  /**
   * 创建一个新的子日志记录器实例
   * 
   * @param parent - 父级日志记录器实例
   * @param category - 日志类别名称，用于标识日志来源
   */
  constructor(
    private readonly parent: Logger,
    private readonly category: string
  ) {}

  /**
   * 记录指定级别的日志
   * 
   * 这是一个内部方法，用于向父级日志记录器发送日志条目。
   * 
   * @param level - 日志级别
   * @param message - 日志消息主体
   * @param data - 附加的数据参数
   */
  private log(level: LogLevel, message?: any, ...data: any[]) {
    this.parent.emit({
      timestamp: Date.now(),
      level,
      category: this.category,
      message,
      data
    });
  }

  /**
   * 记录调试级别日志
   * 
   * 用于记录调试信息，仅在日志级别设为 'debug' 或更低时才会输出。
   * 
   * @param message - 要记录的消息
   * @param data - 附加的数据参数
   * 
   * @example
   * ```typescript
   * logger.debug('Processing user data', userData);
   * logger.debug('Current state:', currentState);
   * ```
   */
  debug(message?: any, ...data: any[]) {
    this.log('debug', message, ...data);
  }

  /**
   * 记录信息级别日志
   * 
   * 用于记录一般信息，默认情况下会被输出。
   * 
   * @param message - 要记录的消息
   * @param data - 附加的数据参数
   * 
   * @example
   * ```typescript
   * logger.info('Application started');
   * logger.info('User authenticated', userId, ipAddress);
   * ```
   */
  info(message?: any, ...data: any[]) {
    this.log('info', message, ...data);
  }

  /**
   * 记录警告级别日志
   * 
   * 用于记录潜在的问题或不寻常但不影响程序运行的情况。
   * 
   * @param message - 要记录的消息
   * @param data - 附加的数据参数
   * 
   * @example
   * ```typescript
   * logger.warn('Deprecated API used', apiName);
   * logger.warn('High memory usage detected', currentUsage);
   * ```
   */
  warn(message?: any, ...data: any[]) {
    this.log('warn', message, ...data);
  }

  /**
   * 记录错误级别日志
   * 
   * 用于记录错误信息。如果传入的是 Error 实例，会特别处理其堆栈跟踪信息。
   * 
   * @param err - 错误对象或错误消息
   * @param data - 附加的数据参数
   * 
   * @example
   * ```typescript
   * logger.error(new Error('Database connection failed'));
   * logger.error('Invalid user input', userInput);
   * logger.error(new TypeError('Unexpected type'), variableValue);
   * ```
   */
  error(err: Error | any, ...data: any[]) {
    if (err instanceof Error) {
      // 对于 Error 实例，单独处理以保留错误堆栈信息
      this.parent.emit({
        timestamp: Date.now(),
        level: 'error',
        category: this.category,
        error: err,
        data
      });
    } else {
      // 对于其他类型的错误信息，作为普通消息处理
      this.log('error', err, ...data);
    }
  }
}