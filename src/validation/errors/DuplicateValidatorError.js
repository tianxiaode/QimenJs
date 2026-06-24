"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateValidatorError = void 0;
// 导入基础错误类，用于继承并创建自定义错误类型
const error_1 = require("@/error");
/**
 * 重复注册验证器错误
 * 当尝试注册一个已经存在的验证器时会抛出此错误
 */
class DuplicateValidatorError extends error_1.ErrorBase {
    /**
     * 构造函数 - 创建一个新的 DuplicateValidatorError 实例
     * @param validatorKey - 发生冲突的验证器键名（唯一标识符）
     * @param existingValidatorInfo - 已存在验证器的相关信息（可选）
     * @param context - 其他上下文信息对象（可选）
     */
    constructor(validatorKey, // 验证器键名，用于标识哪个验证器发生了重复注册
    existingValidatorInfo, // 已存在验证器的信息，提供关于已注册验证器的详细信息
    context // 上下文信息（可选），可用于传递其他相关的调试或追踪数据
    ) {
        // 根据是否存在 existingValidatorInfo 来构建不同的错误消息
        const message = existingValidatorInfo
            ? `Validator with key "${validatorKey}" is already registered. Existing validator: ${existingValidatorInfo}`
            : `Validator with key "${validatorKey}" is already registered.`;
        // 调用父类 BaseError 的构造函数，传递错误消息、错误代码和错误上下文
        super(message, 'DUPLICATE_VALIDATOR', {
            validatorKey, // 包含验证器键名
            existingValidatorInfo, // 包含已存在验证器的信息（如果有的话）
            ...context, // 展开传入的额外上下文信息
        });
    }
}
exports.DuplicateValidatorError = DuplicateValidatorError;
//# sourceMappingURL=DuplicateValidatorError.js.map