// 导入基础错误类，用于扩展自定义错误类型
import { ErrorBase } from '@/error';

/**
 * 验证错误类
 * 在数据验证失败时抛出此错误，包含详细的验证错误信息
 */
export class ValidationError extends ErrorBase {
    /**
     * 存储具体的验证错误列表
     * 每个错误项包含字段名和错误消息
     */
    public readonly errors: Array<{ field: string; message: string }>;

    /**
     * 构造一个新的验证错误实例
     *
     * @param message - 错误的主要描述信息
     * @param code - 错误代码，默认为 'VALIDATION_FAILED'
     * @param errors - 验证错误详情数组，默认为空数组
     * @param context - 额外的上下文信息（可选）
     */
    constructor(
        message: string,
        code: string | number = 'VALIDATION_FAILED',
        errors: Array<any> = [],
        context?: Record<string, any>
    ) {
        // 将 errors 添加到上下文中以便统一访问
        const extendedContext = context ? { ...context, errors } : { errors };

        // 调用基类构造函数
        super(message, code, extendedContext);
        this.name = 'ValidationError';
        this.errors = errors;
    }

    /**
     * 添加单个错误详情到错误列表中
     *
     * @param field - 出错的字段名
     * @param message - 字段验证失败的具体消息
     * @returns 返回当前实例以支持链式调用
     */
    addError(field: string, message: string): this {
        this.errors.push({ field, message });
        // 同步更新上下文中的 errors 保证数据一致性
        if (this.context) {
            this.context.errors = this.errors;
        }
        return this;
    }

    /**
     * 检查当前错误实例是否包含任何验证错误
     *
     * @returns 如果有错误返回 true，否则返回 false
     */
    hasErrors(): boolean {
        return this.errors.length > 0;
    }

    /**
     * 将错误信息转换为简化对象格式
     * 格式为 { fieldName: [message1, message2, ...] }
     *
     * @returns 按字段分组的错误消息对象
     */
    toSimpleObject(): Record<string, string[]> {
        const result: Record<string, string[]> = {};

        this.errors.forEach(error => {
            if (!result[error.field]) {
                result[error.field] = [];
            }
            result[error.field].push(error.message);
        });

        return result;
    }
}
