"use strict";
// 对外入口函数：用户只传 value 和 rule
Object.defineProperty(exports, "__esModule", { value: true });
exports.doValidate = void 0;
exports.createContext = createContext;
const ValidatorRegistrar_1 = require("./ValidatorRegistrar");
const executor_1 = require("./executor");
/**
 * 上下文构造工厂
 */
function createContext(value, rule, partial = {}) {
    return {
        // 核心数据
        value,
        rawValue: value,
        rule,
        path: partial.path || 'root',
        // 状态控制
        terminate: false,
        // 收集桶
        errors: [],
        steps: [], // 执行日志记录
        status: {
            isUndefined: false,
            isNull: false,
            isNaN: false,
            isEmpty: false,
            isModified: false,
        },
        // 运行时元数据（可以存放临时计算结果，供下游处理器使用）
        metadata: {},
        // 混入外部传入的参数（如全局配置、多语言 i18n 等）
        ...partial,
    };
}
/**
 * 验证函数
 *
 * @description 使用统一的 pipeline 执行器
 *
 * @param value 要验证的值
 * @param rule 验证规则
 * @param partialContext 部分上下文（可选）
 * @returns 验证结果
 */
const doValidate = async (value, rule, partialContext = {}) => {
    // 1. 构造验证上下文
    const context = createContext(value, rule, partialContext);
    // 2. 获取验证器注册表
    const validator = ValidatorRegistrar_1.ValidatorRegistrar.getInstance();
    // 3. 根据 rule.type 获取处理器列表
    const processors = validator.get(rule.type);
    // 4. 使用统一的执行器执行验证管道
    const result = await executor_1.validationExecutor.execute(context, processors, rule.type);
    // 5. 合并执行步骤到 context
    context.steps = result.steps;
    // 6. 返回验证结果
    return {
        isValid: result.isSuccess && context.errors.length === 0,
        errors: context.errors,
        value: context.value,
        context: result.context,
    };
};
exports.doValidate = doValidate;
//# sourceMappingURL=validate.js.map