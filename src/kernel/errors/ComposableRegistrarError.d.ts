import { KernelErrorCode } from "./codes";
import { KernelError } from "./KernelError";
/**
 * Composable注册器相关错误类
 *
 * 用于处理可组合项注册过程中的错误，如找不到可组合项、注册冲突等
 * 继承自KernelError，提供特定于可组合项注册的错误处理能力
 *
 * @example
 * ```ts
 * try {
 *   registrar.register('myComposable', myComposable);
 * } catch (error) {
 *   throw new ComposableRegistrarError(
 *     '无法注册可组合项: myComposable',
 *     KernelErrorCode.COMPOSABLE_NOT_FOUND,
 *     { name: 'myComposable', registrationPoint: 'app' }
 *   );
 * }
 * ```
 */
export declare class ComposableRegistrarError extends KernelError {
    /**
     * 构造函数
     *
     * @param message - 错误描述信息
     * @param code - 错误代码，来自KernelErrorCode枚举
     * @param context - 可选的上下文信息，用于提供更多关于错误的详细信息
     */
    constructor(message: string, code: KernelErrorCode, context?: Record<string, any>);
}
//# sourceMappingURL=ComposableRegistrarError.d.ts.map