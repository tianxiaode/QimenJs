/**
 * 🎯 基础错误类
 * 提供标准化的错误接口
 */
export abstract class ErrorBase extends Error {
    /**
     * 错误代码
     */
    public readonly code: string | number;

    /**
     * 错误发生的时间戳
     */
    public readonly timestamp: Date;

    /**
     * 额外的错误上下文数据
     */
    public readonly context?: Record<string, any>;

    /**
     * 构造函数
     * @param message 错误消息
     * @param code 错误代码
     * @param context 上下文信息（可选）
     */
    constructor(
        message: string, // 错误消息
        code: string | number, // 错误代码
        context?: Record<string, any> // 上下文信息（可选）
    ) {
        super(message);

        this.name = this.constructor.name;
        this.code = code;
        this.context = context;
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
     * @returns 包含错误信息的对象
     */
    public toJSON(): Record<string, any> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            stack: this.stack,
            timestamp: this.timestamp.toISOString(),
            context: this.context,
        };
    }

    /**
     * 转换为字符串
     * @returns 格式化的错误字符串
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
