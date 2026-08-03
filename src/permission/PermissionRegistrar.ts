import { RegistrarBase } from '@/registry/registrars/RegistrarBase';
import {
    PERMISSION_CHANGE_EVENT,
    PERMISSION_SEPARATOR,
    type PermissionChangePayload,
    type PermissionQuery,
    type DomainConfig,
    type DomainEntry,
} from './types';
import { SystemEventBus } from '@/events';
import { EventContextBuilder } from '@/context';

const PermissionRegistrarName = 'permission' as const;

/**
 * 默认域验证器 — 标准 entityKey:action 匹配
 */
function defaultValidator(query: PermissionQuery, granted: Set<string>): boolean {
    if (granted.has(query.action)) return true;

    if (query.entityKey) {
        if (granted.has(`${query.entityKey}${PERMISSION_SEPARATOR}${query.action}`)) return true;
    }

    return false;
}

/**
 * 权限注册器
 *
 * 每个域注册权限表 + 可选自定义验证函数。
 * 查询通过 hasPermission 结构化参数，零字符串拼接。
 *
 * @example
 * ```ts
 * const registrar = PermissionRegistrar.getInstance();
 *
 * // 默认域：标准匹配
 * registrar.registerDomain('default', {
 *     permissions: ['users:create', 'users:delete'],
 * });
 *
 * // ABP 域：自定义验证
 * registrar.registerDomain('abp', {
 *     permissions: ['Users.Create', 'Products.Export', 'ADMIN'],
 *     validate: (query, granted) => {
 *         if (granted.has('ADMIN')) return true;
 *         const key = capitalize(query.entityKey) + '.' + capitalize(query.action);
 *         return granted.has(key);
 *     }
 * });
 *
 * // 结构化查询
 * registrar.hasPermission({ action: 'create', entityKey: 'users' }); // true
 * registrar.hasPermission({ action: 'create', entityKey: 'users', domain: 'abp' });
 * ```
 */
export class PermissionRegistrar extends RegistrarBase<Map<string, DomainEntry>> {
    public readonly name = PermissionRegistrarName;

    protected storage = new Map<string, DomainEntry>();

    /**
     * 注册域 — 权限表 + 可选自定义验证函数
     *
     * @param domain - 域名称
     * @param config - 域配置（permissions + validate）
     */
    registerDomain(domain: string, config: DomainConfig): void {
        this.checkLock();

        const existing = this.storage.get(domain);
        const permissions = new Set(config.permissions);

        if (existing) {
            for (const code of config.permissions) {
                existing.permissions.add(code);
            }
            if (config.validate) {
                existing.validate = config.validate;
            }
        } else {
            this.storage.set(domain, {
                permissions,
                validate: config.validate,
            });
        }

        this.emitChange({ domains: [domain], type: 'register' });
    }

    /**
     * 注销域的指定权限码
     *
     * @param domain - 域名称
     * @param codes - 要注销的权限码列表
     */
    unregister(domain: string, ...codes: string[]): void {
        this.checkLock();

        const entry = this.storage.get(domain);
        if (!entry) return;

        for (const code of codes) {
            entry.permissions.delete(code);
        }

        if (entry.permissions.size === 0) {
            this.storage.delete(domain);
        }

        this.emitChange({ domains: [domain], type: 'unregister' });
    }

    /**
     * 结构化权限查询 — 零字符串拼接
     *
     * 优先级：
     * 1. 指定 domain → 使用该域的 validate 或默认验证器
     * 2. 未指定 domain → 遍历所有域，任一匹配即通过
     *
     * @param query - 结构化查询参数
     * @returns 是否拥有权限
     */
    hasPermission(query: PermissionQuery): boolean {
        if (query.domain) {
            const entry = this.storage.get(query.domain);
            if (!entry) return false;
            const validator = entry.validate ?? defaultValidator;
            return validator(query, entry.permissions);
        }

        for (const entry of this.storage.values()) {
            const validator = entry.validate ?? defaultValidator;
            if (validator(query, entry.permissions)) return true;
        }

        return false;
    }

    register(domain: string, config: DomainConfig): void {
        this.registerDomain(domain, config);
    }

    get(domain: string): string[] {
        return this.getByDomain(domain);
    }

    /**
     * 清除指定域的所有权限
     */
    clearDomain(domain: string): void {
        this.checkLock();

        if (this.storage.delete(domain)) {
            this.emitChange({ domains: [domain], type: 'clear' });
        }
    }

    /**
     * 获取指定域的所有权限码
     */
    getByDomain(domain: string): string[] {
        const entry = this.storage.get(domain);
        return entry ? Array.from(entry.permissions) : [];
    }

    /**
     * 获取所有已注册的域名称
     */
    getDomains(): string[] {
        return Array.from(this.storage.keys());
    }

    /**
     * 获取指定域的权限数量
     */
    getDomainSize(domain: string): number {
        return this.storage.get(domain)?.permissions.size ?? 0;
    }

    /**
     * 触发权限变更事件
     */
    private emitChange(payload: PermissionChangePayload): void {
        const ctx = EventContextBuilder.create()
            .withEvent(PERMISSION_CHANGE_EVENT)
            .withType(PERMISSION_CHANGE_EVENT)
            .withSource('permission')
            .withData(payload)
            .build();
        SystemEventBus.getInstance()._bridgeEmit(PERMISSION_CHANGE_EVENT, ctx);
    }

    /**
     * 输出权限注册器状态信息
     */
    protected doInspect(): void {
        console.group('🔐 Permission Registry Status');
        if (this.storage.size === 0) {
            console.log('(empty)');
        } else {
            this.storage.forEach((entry, domain) => {
                console.group(
                    `Domain: ${domain} (${entry.permissions.size})${entry.validate ? ' [custom]' : ''}`
                );
                console.table(Array.from(entry.permissions));
                console.groupEnd();
            });
        }
        console.groupEnd();
    }
}
