import { ErrorBase } from "@/error";
/**
 * 验证错误类
 * 在数据验证失败时抛出此错误，包含详细的验证错误信息
 */
export declare class ValidationError extends ErrorBase {
    /**
     * 存储具体的验证错误列表
     * 每个错误项包含字段名和错误消息
     */
    readonly errors: Array<{
        field: string;
        message: string;
    }>;
    /**
     * 构造一个新的验证错误实例
     *
     * @param message - 错误的主要描述信息
     * @param code - 错误代码，默认为 'VALIDATION_FAILED'
     * @param errors - 验证错误详情数组，默认为空数组
     * @param context - 额外的上下文信息（可选）
     */
    constructor(message: string, code?: string | number, errors?: Array<any>, context?: Record<string, any>);
    /**
     * 添加单个错误详情到错误列表中
     *
     * @param field - 出错的字段名
     * @param message - 字段验证失败的具体消息
     * @returns 返回当前实例以支持链式调用
     */
    addError(field: string, message: string): this;
    /**
     * 检查当前错误实例是否包含任何验证错误
     *
     * @returns 如果有错误返回 true，否则返回 false
     */
    hasErrors(): boolean;
    /**
     * 将错误信息转换为简化对象格式
     * 格式为 { fieldName: [message1, message2, ...] }
     *
     * @returns 按字段分组的错误消息对象
     */
    toSimpleObject(): Record<string, string[]>;
}
//# sourceMappingURL=ValidationError.d.ts.map