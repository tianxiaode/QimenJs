"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryHubConflictError = exports.RegistryHubLockedError = exports.RegistryHubError = exports.RegistryHubErrorCode = void 0;
const error_1 = require("@orbitjs/error");
/**
 * RegistryHub错误的错误代码枚举
 * 定义了注册中心可能遇到的各种错误情况
 * 通过统一的错误代码便于错误分类和处理
 */
var RegistryHubErrorCode;
(function (RegistryHubErrorCode) {
    RegistryHubErrorCode["REGISTRATION_LOCKED"] = "REGISTRY_REGISTRATION_LOCKED";
    RegistryHubErrorCode["REGISTRATION_CONFLICT"] = "REGISTRY_REGISTRATION_CONFLICT";
})(RegistryHubErrorCode || (exports.RegistryHubErrorCode = RegistryHubErrorCode = {}));
/**
 * RegistryHub相关的基础错误类
 * 所有注册中心相关错误的基类
 * 提供了统一的错误处理机制和上下文信息
 */
class RegistryHubError extends error_1.ErrorBase {
    /**
     * 创建一个新的注册中心错误实例
     *
     * @param message - 错误消息描述
     * @param code - 错误代码，来自 RegistryHubErrorCode 枚举
     * @param context - 可选的错误上下文信息，提供更多错误相关数据
     */
    constructor(message, code, context) {
        super(message, code, context);
    }
}
exports.RegistryHubError = RegistryHubError;
/**
 * 注册中心锁定错误 - 当尝试在注册中心锁定后进行注册时抛出
 * 通常在应用启动完成后注册中心被锁定，此时再尝试注册会抛出此错误
 *
 * 此错误提示开发者在正确的时机进行注册操作，避免在应用运行过程中修改配置
 */
class RegistryHubLockedError extends RegistryHubError {
    /**
     * 创建一个新的注册中心锁定错误实例
     *
     * @param context - 错误上下文信息，包含更多关于错误发生时的环境信息
     */
    constructor(context) {
        const message = '[RegistryHub] Registration failed: The hub is locked. Registrations must be completed during the bootstrap phase.';
        super(message, RegistryHubErrorCode.REGISTRATION_LOCKED, {
            ...context,
            phase: 'bootstrap',
        });
    }
}
exports.RegistryHubLockedError = RegistryHubLockedError;
/**
 * 注册冲突错误 - 当尝试注册已存在的名称时抛出
 * 防止重复注册相同名称的注册器，保证注册器名称的唯一性
 *
 * 此错误有助于防止配置冲突和命名混乱，确保系统配置的准确性
 */
class RegistryHubConflictError extends RegistryHubError {
    /**
     * 创建一个新的注册冲突错误实例
     *
     * @param name - 已存在的注册器名称
     * @param context - 可选的错误上下文信息
     */
    constructor(name, context) {
        const message = `[RegistryHub] Conflict: "${name}" already exists.`;
        super(message, RegistryHubErrorCode.REGISTRATION_CONFLICT, {
            ...context,
            registrarName: name,
        });
    }
}
exports.RegistryHubConflictError = RegistryHubConflictError;
//# sourceMappingURL=errors.js.map