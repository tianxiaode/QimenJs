import type { AbilityDefinition } from '@/composable';

/**
 * DomainPagingAbility - 域分页配置能力
 *
 * 从 DomainConfig 中读取 pageSize 和 pagesizes 配置，
 * 覆盖 Manager 上的默认值。
 *
 * 使用 getter/setter + 惰性初始化模式：
 * - 首次读取时从 domainConfig 获取值并缓存到实例属性
 * - 后续读写直接操作实例属性
 * - 避免在构造函数中访问尚未初始化的子类属性（如 domain）
 */
export const DomainPagingAbility: AbilityDefinition = {
    pageSize: {
        get(): number {
            const config = this.domainConfig;
            const value = config?.pageSize ?? 20;
            Object.defineProperty(this, 'pageSize', {
                value,
                writable: true,
                configurable: true,
                enumerable: true,
            });
            return value;
        },
        set(v: number) {
            Object.defineProperty(this, 'pageSize', {
                value: v,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        },
        configurable: true,
        enumerable: true,
    },
    pageSizes: {
        get(): number[] {
            const config = this.domainConfig;
            const value = config?.pagesizes ?? [10, 20, 50];
            Object.defineProperty(this, 'pageSizes', {
                value,
                writable: true,
                configurable: true,
                enumerable: true,
            });
            return value;
        },
        set(v: number[]) {
            Object.defineProperty(this, 'pageSizes', {
                value: v,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        },
        configurable: true,
        enumerable: true,
    },
};
