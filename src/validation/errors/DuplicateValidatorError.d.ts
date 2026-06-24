import { ErrorBase } from '@/error';
/**
 * 重复注册验证器错误
 * 当尝试注册一个已经存在的验证器时会抛出此错误
 */
export declare class DuplicateValidatorError extends ErrorBase {
    /**
     * 构造函数 - 创建一个新的 DuplicateValidatorError 实例
     * @param validatorKey - 发生冲突的验证器键名（唯一标识符）
     * @param existingValidatorInfo - 已存在验证器的相关信息（可选）
     * @param context - 其他上下文信息对象（可选）
     */
    constructor(validatorKey: string, // 验证器键名，用于标识哪个验证器发生了重复注册
    existingValidatorInfo?: string, // 已存在验证器的信息，提供关于已注册验证器的详细信息
    context?: Record<string, any>);
}
//# sourceMappingURL=DuplicateValidatorError.d.ts.map