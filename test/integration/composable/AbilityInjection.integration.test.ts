/**
 * ComposableBase Ability 注入与覆盖规则集成测试
 *
 * 验证 ComposableBase 的 Ability 注入机制（with() 模式）：
 * 1. 同名方法覆盖
 * 2. 宿主自身方法优先
 * 3. 重命名解决冲突
 * 4. Ability 生命周期
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
            })),
        },
    };
});

import { ComposableBase, type AbilityDefinition } from '@/composable';
import { RemoteCrudEntityManager } from '@/entity/manager/managers';
import { SchemaRegistrar } from '@/schema';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import type { FlatSchema, RegistrSchema } from '@/schema';

// ============================================
// 自定义 Ability
// ============================================

const AbilityA: AbilityDefinition = {
    getData: function (this: any) {
        return 'from-ability-a';
    },
    sharedMethod: function (this: any) {
        return 'shared-a';
    },
};

const AbilityB: AbilityDefinition = {
    getData: function (this: any) {
        return 'from-ability-b';
    },
    sharedMethod: function (this: any) {
        return 'shared-b';
    },
};

const AbilityWithDispose: AbilityDefinition = {
    abilityDispose: function (this: any) {
        return 'ability-dispose';
    },
    customAction: function (this: any) {
        return 'custom-action';
    },
};

// ============================================
// 测试用 Manager（with() 模式）
// ============================================

const TestOverrideManagerBase = ComposableBase.with(AbilityA, AbilityB);
class TestOverrideManager extends TestOverrideManagerBase {}

const TestHostDisposeManagerBase = ComposableBase.with(AbilityWithDispose);
class TestHostDisposeManager extends TestHostDisposeManagerBase {
    private _disposed = false;

    dispose(): void {
        this._disposed = true;
        super.dispose();
    }

    isDisposed(): boolean {
        return this._disposed;
    }
}

// ============================================
// 测试
// ============================================

describe('ComposableBase Ability injection and override', () => {
    describe('same-name method override', () => {
        it('later ability overrides earlier one', () => {
            const mgr = new TestOverrideManager();

            expect((mgr as any).getData()).toBe('from-ability-b');
            expect((mgr as any).sharedMethod()).toBe('shared-b');
        });
    });

    describe('host own method priority', () => {
        it('host own dispose is not overridden by ability', () => {
            const mgr = new TestHostDisposeManager();

            expect(mgr.isDisposed()).toBe(false);
            mgr.dispose();
            expect(mgr.isDisposed()).toBe(true);
        });

        it('other ability methods still work', () => {
            const mgr = new TestHostDisposeManager();

            expect((mgr as any).customAction()).toBe('custom-action');

            mgr.dispose();
        });
    });

    describe('rename to resolve conflict', () => {
        it('RemoteCrudEntityManager has both updateSourceData and updateData', () => {
            const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
            domainRegistrar.register(
                'test-ability-rename',
                {
                    baseUrl: 'https://test-api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50],
                },
                true
            );

            const testSchema: FlatSchema = {
                name: 'TestRenameUser',
                domain: 'test-ability-rename',
                idField: 'id',
                isTree: false,
                fields: [
                    { name: 'id', type: 'string' },
                    { name: 'name', type: 'string' },
                ],
            };

            const schemaRegistrar = SchemaRegistrar.getInstance();
            schemaRegistrar.register(testSchema);

            class TestRenameManager extends RemoteCrudEntityManager {
                domain = 'test-ability-rename';
                entityName = 'TestRenameUser';
                url = '/api/test-users';
                schema: RegistrSchema = testSchema;
            }

            const mgr = new TestRenameManager();

            expect(typeof mgr.updateData).toBe('function');
            expect(typeof (mgr as any).updateSourceData).toBe('function');

            mgr.dispose();
            domainRegistrar.unregister('test-ability-rename');
            schemaRegistrar.unregister('TestRenameUser');
        });
    });

    describe('ability injection verification', () => {
        it('ability methods are injected to prototype via with()', () => {
            const mgr = new TestOverrideManager();

            expect(typeof (mgr as any).getData).toBe('function');
            expect(typeof (mgr as any).sharedMethod).toBe('function');

            expect((mgr as any).getData()).toBe('from-ability-b');
            expect((mgr as any).sharedMethod()).toBe('shared-b');
        });

        it('multiple ability methods coexist', () => {
            const mgr = new TestOverrideManager();

            expect((mgr as any).getData()).toBe('from-ability-b');
        });
    });
});
