import { ErrorBase } from '@qimenjs/error';

/**
 * 注册器错误代码枚举
 * 定义了注册器系统中可能出现的各种错误类型
 * 通过统一的错误代码便于错误分类、处理和调试
 */
export enum RegistrarErrorCode {
    REGISTRATION_LOCKED = 'REGISTRAR_REGISTRATION_LOCKED',
    REGISTRATION_CONFLICT = 'REGISTRAR_REGISTRATION_CONFLICT',
    REGISTRATION_NOT_FOUND = 'REGISTRAR_REGISTRATION_NOT_FOUND',
    INVALID_ARGUMENT = 'REGISTRAR_INVALID_ARGUMENT',
}

/**
 * 注册器基础错误类
 * 所有注册器相关错误的基类
 * 继承自ErrorBase，提供统一的错误处理机制
 */
export abstract class RegistrarError extends ErrorBase {
    /**
     * 创建一个新的注册器错误实例
     * 
     * @param message - 错误消息描述
     * @param code - 错误代码，来自RegistrarErrorCode枚举
     * @param context - 可选的错误上下文信息，提供更多错误相关数据
     */
    constructor(message: string, code: RegistrarErrorCode, context?: Record<string, any>) {
        super(message, code, context);
    }
}

/**
 * 注册器锁定错误 - 当尝试在注册器锁定后进行注册时抛出
 * 
 * 当注册器被锁定后，不能再进行任何修改操作（注册、注销等）
 * 这种设计确保了系统在启动后的配置稳定性
 */
export class RegistrarLockedError extends RegistrarError {
    /**
     * 创建一个新的注册器锁定错误实例
     * 
     * @param registrarName - 发生错误的注册器名称
     * @param context - 可选的错误上下文信息
     */
    constructor(registrarName: string, context?: Record<string, any>) {
        const message = `[${registrarName}] Registration failed: The registrar is locked. Modifications must be completed during the bootstrap phase.`;
        super(message, RegistrarErrorCode.REGISTRATION_LOCKED, {
            ...context,
            registrarName,
            phase: 'bootstrap',
        });
    }
}

/**
 * 注册冲突错误 - 当尝试注册已存在的名称时抛出
 * 
 * 确保注册器中每个名称都是唯一的，防止意外覆盖已有的注册项
 * 这种保护机制有助于避免配置错误和命名冲突
 */
export class RegistrarConflictError extends RegistrarError {
    /**
     * 创建一个新的注册冲突错误实例
     * 
     * @param registrarName - 发生错误的注册器名称
     * @param name - 已存在的注册项名称
     * @param context - 可选的错误上下文信息
     */
    constructor(registrarName: string, name: string, context?: Record<string, any>) {
        const message = `[${registrarName}] Conflict: "${name}" already exists.`;
        super(message, RegistrarErrorCode.REGISTRATION_CONFLICT, {
            ...context,
            registrarName,
            registrationName: name,
        });
    }
}

/**
 * 注册项未找到错误 - 当尝试获取不存在的注册项时抛出
 * 
 * 当使用一个不存在的键来获取注册项时会抛出此错误
 * 提醒开发者检查键名是否正确或是否已注册相应的项
 */
export class RegistrarNotFoundError extends RegistrarError {
    /**
     * 创建一个新的注册项未找到错误实例
     * 
     * @param registrarName - 发生错误的注册器名称
     * @param name - 未找到的注册项名称
     * @param context - 可选的错误上下文信息
     */
    constructor(registrarName: string, name: string, context?: Record<string, any>) {
        const message = `[${registrarName}] Not found: "${name}" does not exist.`;
        super(message, RegistrarErrorCode.REGISTRATION_NOT_FOUND, {
            ...context,
            registrarName,
            registrationName: name,
        });
    }
}

/**
 * 参数无效错误 - 当传入的参数不符合要求时抛出
 * 
 * 当传入注册器的参数类型或格式不正确时会抛出此错误
 * 用于验证输入参数的有效性，防止错误的数据进入系统
 */
export class RegistrarInvalidArgumentError extends RegistrarError {
    /**
     * 创建一个新的参数无效错误实例
     * 
     * @param registrarName - 发生错误的注册器名称
     * @param argument - 无效的参数值
     * @param context - 可选的错误上下文信息
     */
    constructor(registrarName: string, argument: string, context?: Record<string, any>) {
        const message = `[${registrarName}] Invalid argument: "${argument}" is not valid.`;
        super(message, RegistrarErrorCode.INVALID_ARGUMENT, {
            ...context,
            registrarName,
            argument,
        });
    }
}