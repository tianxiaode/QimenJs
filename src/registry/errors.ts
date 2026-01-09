import { ErrorBase } from '@orbitjs/error';

/**
 * RegistryHub错误的错误代码枚举
 */
export enum RegistryHubErrorCode {
    REGISTRATION_LOCKED = 'REGISTRY_REGISTRATION_LOCKED',
    REGISTRATION_CONFLICT = 'REGISTRY_REGISTRATION_CONFLICT',
}

/**
 * RegistryHub相关的基础错误类
 */
export abstract class RegistryHubError extends ErrorBase {
    constructor(message: string, code: RegistryHubErrorCode, context?: Record<string, any>) {
        super(message, code, context);
    }
}

/**
 * 注册中心锁定错误 - 当尝试在注册中心锁定后进行注册时抛出
 */
export class RegistryHubLockedError extends RegistryHubError {
    constructor(context?: Record<string, any>) {
        const message =
            '[RegistryHub] Registration failed: The hub is locked. Registrations must be completed during the bootstrap phase.';
        super(message, RegistryHubErrorCode.REGISTRATION_LOCKED, {
            ...context,
            phase: 'bootstrap',
        });
    }
}

/**
 * 注册冲突错误 - 当尝试注册已存在的名称时抛出
 */
export class RegistryHubConflictError extends RegistryHubError {
    constructor(name: string, context?: Record<string, any>) {
        const message = `[RegistryHub] Conflict: "${name}" already exists.`;
        super(message, RegistryHubErrorCode.REGISTRATION_CONFLICT, {
            ...context,
            registrarName: name,
        });
    }
}
