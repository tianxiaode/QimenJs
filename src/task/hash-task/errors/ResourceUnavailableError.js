"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceUnavailableError = void 0;
/**
 * ResourceUnavailableError 是一个自定义错误类，
 * 用于在系统资源不可用时抛出错误。
 * 该错误通常在任务执行过程中检测到关键资源（如内存或工作线程）不足时触发。
 */
const error_1 = require("@orbitjs/error");
/**
 * 资源不可用错误类
 * 当指定类型的资源不可用时抛出此错误
 */
class ResourceUnavailableError extends error_1.ErrorBase {
    /**
     * 构造函数
     * @param resource - 不可用的资源类型，可以是 'memory'（内存）、'worker'（工作线程）或 'all'（全部资源）
     * @param context - 可选的上下文信息，包含与错误相关的额外数据
     */
    constructor(resource, context) {
        super(`${resource} unavailable`, 'RESOURCE_UNAVAILABLE', { resource, ...context });
    }
}
exports.ResourceUnavailableError = ResourceUnavailableError;
//# sourceMappingURL=ResourceUnavailableError.js.map