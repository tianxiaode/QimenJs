import { ErrorBase } from "@/error";
/**
 * 验证器未找到错误
 * 当系统无法找到与指定规则类型相对应的验证器时抛出此错误
 *
 * 此错误通常发生在以下情况：
 * 1. 请求使用尚未注册的验证器类型
 * 2. 验证规则配置中引用了不存在的验证器
 * 3. 动态加载验证器时发生问题
 */
export declare class ValidatorNotFoundError extends ErrorBase {
    /**
     * 构造函数 - 创建一个新的验证器未找到错误实例
     *
     * @param type - 找不到的验证器类型名称
     * @param context - 可选的上下文信息对象，可用于传递额外的调试信息，
     *                  如字段名、验证规则配置等
     */
    constructor(type: string, context?: Record<string, any>);
}
//# sourceMappingURL=ValidatorNotFoundError.d.ts.map