/**
 * 🎯 基础错误类
 * 提供标准化的错误接口和扩展能力
 */
export abstract class BaseError extends Error {
  /**
   * 错误代码（可选）
   */
  public readonly code?: string | number;
  
  /**
   * 原始错误（如果有）
   */
  public readonly originalError?: Error;
  
  /**
   * 错误发生的时间戳
   */
  public readonly timestamp: Date;
  
  /**
   * 额外的错误上下文数据
   */
  public readonly context?: Record<string, any>;
  
  constructor(
    message: string,
    options: {
      name?: string;
      code?: string | number;
      originalError?: Error;
      context?: Record<string, any>;
    } = {}
  ) {
    super(message);
    
    this.name = options.name || this.constructor.name;
    this.code = options.code;
    this.originalError = options.originalError;
    this.context = options.context;
    this.timestamp = new Date();
    
    // 保持正确的原型链
    Object.setPrototypeOf(this, new.target.prototype);
    
    // 捕获堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * 转换为 JSON 格式
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      stack: this.stack,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      originalError: this.originalError
    };
  }
  
  /**
   * 转换为字符串
   */
  public toString(): string {
    const parts = [`[${this.name}]`];
    
    if (this.code) {
      parts.push(`(${this.code})`);
    }
    
    parts.push(this.message);
    
    if (this.context) {
      parts.push(JSON.stringify(this.context));
    }
    
    return parts.join(' ');
  }
}