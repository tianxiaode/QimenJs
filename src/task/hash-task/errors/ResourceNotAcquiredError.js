"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceNotAcquiredError = void 0;
/**
 * ResourceNotAcquiredError 是一个自定义错误类，
 * 用于在尝试访问尚未获取的资源时抛出错误。
 * 这种情况通常发生在资源管理或任务处理过程中，
 * 当尝试使用尚未正确初始化或获取的资源时会触发此错误。
 */
const error_1 = require("@orbitjs/error");
/**
 * 资源未获取错误类
 * 当尝试访问尚未获取的资源时抛出此错误
 */
class ResourceNotAcquiredError extends error_1.ErrorBase {
    /**
     * 构造函数
     * 创建一个 ResourceNotAcquiredError 实例
     */
    constructor() {
        super('Attempted to access resources before acquisition', 'RESOURCE_NOT_ACQUIRED');
    }
}
exports.ResourceNotAcquiredError = ResourceNotAcquiredError;
//# sourceMappingURL=ResourceNotAcquiredError.js.map