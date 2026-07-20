import { RegistrarBase } from '@/registry/registrars/RegistrarBase';
import {
    PERMISSION_CHANGE_EVENT,
    PERMISSION_SEPARATOR,
    type PermissionChangePayload,
    type PermissionEntry,
} from './types';
import type { GlobalEventBus } from '@/events/GlobalEventBus';
import { EventContextBuilder } from '@/context';

/**
 * 权限注册器名称
 */
const PermissionRegistrarName = 'permission' as const;

/**
 * 权限注册器
 *
 * 管理权限码的注册、存储和查询。权限码按域分组存储，
 * 格式为 域:权限码（如 system:user:create）。
 *
 * 权限数据变更时自动通过 GlobalEventBus 触发 permission:change 事件，
 * 组件的 PermissionAbility 监听此事件后自行判断权限状态。
 *
 * @example
 * ```ts
 * const registrar = PermissionRegistrar.getInstance();
 * registrar.initEventBus(globalEventBus);
 *
 * // 批量注册
 * registrar.registerBatch([
 *     { domain: 'system', codes: ['user:create', 'user:delete'] },
 *     { domain: 'business', codes: ['order:approve'] },
 * ]);
 *
 * // 查询
 * registrar.has('system:user:create'); // true
 * registrar.has('system:user:export'); // false
 * ```
 */
export class PermissionRegistrar extends RegistrarBase<Map<string, Set<string>>> {
    public readonly name = PermissionRegistrarName;

    protected storage = new Map<string, Set<string>>();

    private eventBus?: GlobalEventBus;

    /**
     * 注入全局事件总线
     *
     * 必须在注册权限之前调用，否则权限变更不会触发事件。
     * 由于 RegistrarBase 单例模式要求无参构造，EventBus 通过此方法注入。
     *
     * @param eventBus - 全局事件总线实例
     */
    initEventBus(eventBus: GlobalEventBus): void {
        this.eventBus = eventBus;
    }

    /**
     * 批量注册权限
     *
     * 一次性注册多个域的权限码，全部写入后只触发一次 permission:change 事件。
     *
     * @param entries - 权限注册项列表
     */
    registerBatch(entries: PermissionEntry[]): void {
        this.checkLock();

        const changedDomains: string[] = [];

        for (const { domain, codes } of entries) {
            let set = this.storage.get(domain);
            if (!set) {
                set = new Set();
                this.storage.set(domain, set);
            }
            for (const code of codes) {
                set.add(code);
            }
            changedDomains.push(domain);
        }

        if (changedDomains.length > 0) {
            this.emitChange({ domains: changedDomains, type: 'register' });
        }
    }

    /**
     * 注册单个域的权限
     *
     * @param domain - 域名称
     * @param codes - 权限码列表
     */
    register(domain: string, ...codes: string[]): void {
        this.registerBatch([{ domain, codes }]);
    }

    /**
     * 批量注销权限
     *
     * 一次性注销多个域的权限码，全部删除后只触发一次 permission:change 事件。
     *
     * @param entries - 权限注销项列表
     */
    unregisterBatch(entries: PermissionEntry[]): void {
        this.checkLock();

        const changedDomains: string[] = [];

        for (const { domain, codes } of entries) {
            const set = this.storage.get(domain);
            if (!set) continue;

            for (const code of codes) {
                set.delete(code);
            }

            // 域下无权限时移除整个域
            if (set.size === 0) {
                this.storage.delete(domain);
            }

            changedDomains.push(domain);
        }

        if (changedDomains.length > 0) {
            this.emitChange({ domains: changedDomains, type: 'unregister' });
        }
    }

    /**
     * 注销单个域的权限
     *
     * @param domain - 域名称
     * @param codes - 要注销的权限码列表
     */
    unregister(domain: string, ...codes: string[]): void {
        this.unregisterBatch([{ domain, codes }]);
    }

    /**
     * 查询是否拥有指定权限
     *
     * 权限码格式为 域:权限码，如 'system:user:create'。
     * 自动按分隔符拆分域和权限码进行查询。
     *
     * @param code - 完整权限码（域:权限码）
     * @returns 是否拥有该权限
     */
    has(code: string): boolean {
        const separatorIndex = code.indexOf(PERMISSION_SEPARATOR);
        if (separatorIndex === -1) return false;

        const domain = code.substring(0, separatorIndex);
        const permission = code.substring(separatorIndex + 1);

        return this.storage.get(domain)?.has(permission) ?? false;
    }

    /**
     * 查询是否拥有全部指定权限
     *
     * @param codes - 权限码列表
     * @returns 是否全部拥有
     */
    hasAll(codes: string[]): boolean {
        return codes.every(code => this.has(code));
    }

    /**
     * 查询是否拥有任一指定权限
     *
     * @param codes - 权限码列表
     * @returns 是否拥有任一
     */
    hasAny(codes: string[]): boolean {
        return codes.some(code => this.has(code));
    }

    /**
     * 获取指定域的所有权限码
     *
     * @param domain - 域名称
     * @returns 权限码数组，域不存在时返回空数组
     */
    get(domain: string): string[] {
        return this.getByDomain(domain);
    }

    /**
     * 获取指定域的所有权限码
     *
     * @param domain - 域名称
     * @returns 权限码数组，域不存在时返回空数组
     */
    getByDomain(domain: string): string[] {
        const set = this.storage.get(domain);
        return set ? Array.from(set) : [];
    }

    /**
     * 清除指定域的所有权限
     *
     * @param domain - 域名称
     */
    clearDomain(domain: string): void {
        this.checkLock();

        if (this.storage.delete(domain)) {
            this.emitChange({ domains: [domain], type: 'clear' });
        }
    }

    /**
     * 获取所有已注册的域名称
     *
     * @returns 域名称数组
     */
    getDomains(): string[] {
        return Array.from(this.storage.keys());
    }

    /**
     * 获取指定域的权限数量
     *
     * @param domain - 域名称
     * @returns 权限数量
     */
    getDomainSize(domain: string): number {
        return this.storage.get(domain)?.size ?? 0;
    }

    /**
     * 触发权限变更事件
     *
     * @param payload - 事件载荷
     */
    private emitChange(payload: PermissionChangePayload): void {
        const ctx = EventContextBuilder.create()
            .withEvent(PERMISSION_CHANGE_EVENT)
            .withType(PERMISSION_CHANGE_EVENT)
            .withSource('permission')
            .withData(payload)
            .build();
        this.eventBus?.emit(PERMISSION_CHANGE_EVENT, ctx);
    }

    /**
     * 输出权限注册器状态信息
     */
    protected doInspect(): void {
        console.group('🔐 Permission Registry Status');
        if (this.storage.size === 0) {
            console.log('(empty)');
        } else {
            this.storage.forEach((codes, domain) => {
                console.group(`Domain: ${domain} (${codes.size})`);
                console.table(Array.from(codes));
                console.groupEnd();
            });
        }
        console.groupEnd();
    }
}
