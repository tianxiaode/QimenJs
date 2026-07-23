import { KernelError } from './KernelError';
import { KernelErrorCode } from './codes';

/**
 * 组件模板错误类
 *
 * 用于组件模板编译、实例化过程中的错误
 * 继承自 KernelError，提供统一的错误处理机制
 *
 * @example
 * ```ts
 * throw new ComponentError('没有匹配的模板变体', KernelErrorCode.COMPONENT_TPL_KEY_NOT_FOUND, {
 *     props: { labelPosition: 'top' },
 * });
 * ```
 */
export class ComponentError extends KernelError {
    constructor(message: string, code: KernelErrorCode, context?: Record<string, any>) {
        super(message, code, context);
        Object.setPrototypeOf(this, ComponentError.prototype);
    }
}
