import { ErrorBase } from '@orbitjs/error';

/**
 * 注册器错误代码枚举
 */
export enum RegistrarErrorCode {
    REGISTRATION_LOCKED = 'REGISTRAR_REGISTRATION_LOCKED',
    REGISTRATION_CONFLICT = 'REGISTRAR_REGISTRATION_CONFLICT',
    REGISTRATION_NOT_FOUND = 'REGISTRAR_REGISTRATION_NOT_FOUND',
    INVALID_ARGUMENT = 'REGISTRAR_INVALID_ARGUMENT',
}

/**
 * 注册器基础错误类
 */
export abstract class RegistrarError extends ErrorBase {
    constructor(message: string, code: RegistrarErrorCode, context?: Record<string, any>) {
        super(message, code, context);
    }
}

/**
 * 注册器锁定错误 - 当尝试在注册器锁定后进行注册时抛出
 */
export class RegistrarLockedError extends RegistrarError {
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
 */
export class RegistrarConflictError extends RegistrarError {
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
 */
export class RegistrarNotFoundError extends RegistrarError {
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
 */
export class RegistrarInvalidArgumentError extends RegistrarError {
    constructor(registrarName: string, argument: string, context?: Record<string, any>) {
        const message = `[${registrarName}] Invalid argument: "${argument}" is not valid.`;
        super(message, RegistrarErrorCode.INVALID_ARGUMENT, {
            ...context,
            registrarName,
            argument,
        });
    }
}
