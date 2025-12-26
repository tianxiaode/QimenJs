/**
 * 日志级别枚举
 * 定义了四种日志等级，从低到高依次为: debug < info < warn < error
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 日志条目接口
 * 定义单条日志记录的数据结构
 */
export interface LogEntry {
    /**
     * 时间戳
     * 记录日志产生的时间（毫秒时间戳）
     */
    timestamp: number;
    
    /**
     * 日志级别
     * 指定该条日志的等级
     */
    level: LogLevel;
    
    /**
     * 日志分类（可选）
     * 用于标识日志来源或模块
     */
    category?: string;
    
    /**
     * 日志消息（可选）
     * 日志的主要内容，可以是任意类型
     */
    message?: any;
    
    /**
     * 错误对象（可选）
     * 当记录错误日志时，包含具体的错误信息
     */
    error?: Error;
    
    /**
     * 附加数据（可选）
     * 与日志相关的额外数据数组
     */
    data?: any[];
}

/**
 * 日志记录器配置选项接口
 * 定义创建Logger实例时可用的配置参数
 */
export interface LoggerOptions {
    /**
     * 最低日志级别（可选）
     * 只有等于或高于此级别的日志才会被记录
     * 默认值通常根据具体实现而定
     */
    level?: LogLevel;
    
    /**
     * 是否启用颜色输出（可选）
     * 控制控制台输出是否使用颜色标记不同级别的日志
     * 默认值通常为true
     */
    color?: boolean;
}

export interface ILogger {
  debug(message?: any, ...data: any[]): void;
  info(message?: any, ...data: any[]): void;
  warn(message?: any, ...data: any[]): void;
  error(err: Error | any, ...data: any[]): void;
}