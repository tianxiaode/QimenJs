/**
 * Manager 域配置传播测试
 *
 * 验证 DomainConfig 中的 pageSize/pagesizes 是否正确传播到 Manager 实例。
 * 此测试专门覆盖之前因测试数据与默认值一致而遗漏的 bug。
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            }))
        }
    };
});

import { RemoteCrudEntityManager, RemoteReadonlyEntityManager, LocalReadonlyEntityManager } from '@/entity/manager/managers';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { SchemaRegistrar } from '@/schema';
import type { FlatSchema, RegistrSchema } from '@/schema';
import { DOMAIN_CACHE_SYMBOL } from '@/system-abilities/types/abilities';

// ============================================
// 测试用 Schema
// ============================================

const testSchema: FlatSchema = {
    name: 'DomainConfigItem',
    domain: 'domain-config-test',
    idField: 'id',
    isTree: false,
    searchFields: ['name'],
    fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', searchable: true },
    ],
};

// ============================================
// 测试用 Manager
// ============================================

class TestCrudManager extends RemoteCrudEntityManager {
    domain = 'domain-config-test';
    entityName = 'DomainConfigItem';
    url = '/api/items';
    schema: RegistrSchema = testSchema;
}

class TestReadonlyManager extends RemoteReadonlyEntityManager {
    domain = 'domain-config-test';
    entityName = 'DomainConfigItem';
    url = '/api/items';
    schema: RegistrSchema = testSchema;
}

// ============================================
// 辅助函数
// ============================================

function registerDomain(config: { pageSize?: number; pagesizes?: number[] }): () => void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain')!;
    domainRegistrar.register('domain-config-test', {
        baseUrl: 'http://localhost:9999',
        preset: 'default',
        pageSize: config.pageSize ?? 10,
        pagesizes: config.pagesizes ?? [10, 20, 50],
    }, true);
    return () => domainRegistrar.unregister('domain-config-test');
}

/** 清除 DomainAbility 的类级别缓存，确保每个测试独立 */
function clearDomainCache(): void {
    const storage = (TestCrudManager as any)._static_storage_;
    if (storage) storage.delete(DOMAIN_CACHE_SYMBOL);
    const storage2 = (TestReadonlyManager as any)._static_storage_;
    if (storage2) storage2.delete(DOMAIN_CACHE_SYMBOL);
}

// ============================================
// 测试
// ============================================

describe('Manager 域配置传播', () => {
    beforeAll(() => {
        const schemaRegistrar = SchemaRegistrar.getInstance();
        if (!schemaRegistrar.has('DomainConfigItem')) {
            schemaRegistrar.register(testSchema);
        }
    });

    afterEach(() => {
        const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
        domainRegistrar?.unregister('domain-config-test');
        clearDomainCache();
    });

    // ========================================
    // 1. RemoteCrudEntityManager - pageSize/pagesizes 传播
    // ========================================

    describe('RemoteCrudEntityManager', () => {
        it('应该从 DomainConfig 读取 pageSize 并覆盖默认值', () => {
            registerDomain({ pageSize: 25 });

            const manager = new TestCrudManager();

            expect(manager.pageSize).toBe(25);
            manager.dispose();
        });

        it('应该从 DomainConfig 读取 pagesizes 并覆盖默认值', () => {
            registerDomain({ pagesizes: [5, 10, 20, 50] });

            const manager = new TestCrudManager();

            expect(manager.pageSizes).toEqual([5, 10, 20, 50]);
            manager.dispose();
        });

        it('应该同时传播 pageSize 和 pagesizes', () => {
            registerDomain({ pageSize: 5, pagesizes: [5, 10, 20, 50] });

            const manager = new TestCrudManager();

            expect(manager.pageSize).toBe(5);
            expect(manager.pageSizes).toEqual([5, 10, 20, 50]);
            manager.dispose();
        });

        it('DomainConfig 未注册时应该使用默认值', () => {
            // 不注册域
            const manager = new TestCrudManager();

            expect(manager.pageSize).toBe(20);
            expect(manager.pageSizes).toEqual([10, 20, 50]);
            manager.dispose();
        });

        it('DomainConfig 中缺少 pagesizes 时应该保留默认值', () => {
            const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain')!;
            domainRegistrar.register('domain-config-test', {
                baseUrl: 'http://localhost:9999',
                preset: 'default',
                pageSize: 15,
            } as any, true);

            const manager = new TestCrudManager();

            expect(manager.pageSize).toBe(15);
            expect(manager.pageSizes).toEqual([10, 20, 50]); // 保留默认
            manager.dispose();
        });
    });

    // ========================================
    // 2. RemoteReadonlyEntityManager - pageSize/pagesizes 传播
    // ========================================

    describe('RemoteReadonlyEntityManager', () => {
        it('应该从 DomainConfig 读取 pageSize 并覆盖默认值', () => {
            registerDomain({ pageSize: 25 });

            const manager = new TestReadonlyManager();

            expect(manager.pageSize).toBe(25);
            manager.dispose();
        });

        it('应该从 DomainConfig 读取 pagesizes 并覆盖默认值', () => {
            registerDomain({ pagesizes: [5, 10, 20, 50] });

            const manager = new TestReadonlyManager();

            expect(manager.pageSizes).toEqual([5, 10, 20, 50]);
            manager.dispose();
        });

        it('DomainConfig 未注册时应该使用默认值', () => {
            const manager = new TestReadonlyManager();

            expect(manager.pageSize).toBe(20);
            expect(manager.pageSizes).toEqual([10, 20, 50]);
            manager.dispose();
        });
    });

    // ========================================
    // 3. LocalReadonlyEntityManager - 不受域配置影响
    // ========================================

    describe('LocalEntityManager', () => {
        it('LocalReadonlyEntityManager 不应该有 pageSize/pageSizes 属性', () => {
            const localSchema: FlatSchema = {
                name: 'LocalItem',
                domain: 'domain-config-test',
                idField: 'id',
                isTree: false,
                fields: [{ name: 'id', type: 'number' }],
            };

            class TestLocalReadonly extends LocalReadonlyEntityManager {
                domain = 'domain-config-test';
                entityName = 'LocalItem';
                url = '/api/local-items';
                schema: RegistrSchema = localSchema;
            }

            registerDomain({ pageSize: 5, pagesizes: [5, 10] });

            const manager = new TestLocalReadonly();

            // Local Manager 没有 DomainPagingAbility，所以没有 pageSize/pageSizes
            expect((manager as any).pageSize).toBeUndefined();
            expect((manager as any).pageSizes).toBeUndefined();
            manager.dispose();
        });
    });

    // ========================================
    // 4. changeSize 与 pagesizes 的联动
    // ========================================

    describe('changeSize 与 pagesizes 联动', () => {
        it('changeSize 应该使用域配置的 pagesizes 验证', async () => {
            registerDomain({ pageSize: 5, pagesizes: [5, 10, 20, 50] });

            const manager = new TestCrudManager();

            // 5 在 pagesizes 中，应该成功
            jest.spyOn(manager, 'systemConfig').mockReturnValue('production');
            const result = await manager.changeSize(5);
            expect(manager.pageSize).toBe(5);

            // 15 不在 pagesizes 中，应该失败
            const failResult = await manager.changeSize(15);
            expect(failResult).toEqual([]);

            manager.dispose();
        });

        it('changeSize 在 development 环境对无效 size 应该抛出 KernelError', async () => {
            registerDomain({ pagesizes: [5, 10, 20, 50] });

            const manager = new TestCrudManager();
            jest.spyOn(manager, 'systemConfig').mockReturnValue('development');

            const { KernelError, KernelErrorCode } = require('@/error');
            await expect(manager.changeSize(15)).rejects.toThrow(KernelError);

            manager.dispose();
        });
    });

    // ========================================
    // 5. pageSize/pageSizes 赋值后应保持
    // ========================================

    describe('pageSize/pageSizes 赋值', () => {
        it('pageSize 赋值后应该保持新值', () => {
            registerDomain({ pageSize: 10 });

            const manager = new TestCrudManager();
            expect(manager.pageSize).toBe(10);

            manager.pageSize = 20;
            expect(manager.pageSize).toBe(20);

            manager.dispose();
        });

        it('pageSizes 赋值后应该保持新值', () => {
            registerDomain({ pagesizes: [10, 20, 50] });

            const manager = new TestCrudManager();
            expect(manager.pageSizes).toEqual([10, 20, 50]);

            manager.pageSizes = [5, 10, 20];
            expect(manager.pageSizes).toEqual([5, 10, 20]);

            manager.dispose();
        });
    });
});
