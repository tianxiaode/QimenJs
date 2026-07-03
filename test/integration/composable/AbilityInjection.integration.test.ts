/**
 * ComposableBase Ability 注入与覆盖规则集成测试
 *
 * 验证 ComposableBase 的 Ability 注入机制：
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
            }))
        }
    };
});

import { ComposableBase, type AbilityDefinition } from '@/composable';
import { RemoteCrudEntityManager } from '@/entity/manager/managers';
import { SchemaRegistrar } from '@/schema';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import type { FlatSchema, RegistrSchema } from '@/schema';

// ============================================
// 自定义 Ability（扁平对象，方法直接定义在顶层）
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
// 测试用 Manager
// ============================================

class TestOverrideManager extends ComposableBase {
    static readonly abilities: readonly AbilityDefinition[] = [AbilityA, AbilityB];
}

class TestHostDisposeManager extends ComposableBase {
    static readonly abilities: readonly AbilityDefinition[] = [AbilityWithDispose];

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

describe('ComposableBase Ability 注入与覆盖规则集成测试', () => {

    describe('同名方法覆盖', () => {
        it('后注入的 Ability 的同名方法覆盖先注入的', () => {
            const manager = new TestOverrideManager();

            // AbilityB 后注入，getData 应返回 AbilityB 的结果
            expect((manager as any).getData()).toBe('from-ability-b');
            expect((manager as any).sharedMethod()).toBe('shared-b');
        });
    });

    describe('宿主自身方法优先', () => {
        it('宿主自身定义的 dispose 不被 Ability 的同名方法覆盖', () => {
            const manager = new TestHostDisposeManager();

            // 宿主自身的 dispose 应优先
            expect(manager.isDisposed()).toBe(false);
            manager.dispose();
            expect(manager.isDisposed()).toBe(true);
        });

        it('Ability 注入的其他方法仍可正常调用', () => {
            const manager = new TestHostDisposeManager();

            expect((manager as any).customAction()).toBe('custom-action');

            manager.dispose();
        });
    });

    describe('重命名解决冲突', () => {
        it('RemoteCrudEntityManager 中 updateSourceData 和 updateData 均存在', () => {
            // 注册测试域和 Schema
            const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
            domainRegistrar.register('test-ability-rename', {
                baseUrl: 'https://test-api.example.com',
                preset: 'default',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            }, true);

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

            const manager = new TestRenameManager();

            // 验证两个方法都存在
            expect(typeof manager.updateData).toBe('function');
            expect(typeof (manager as any).updateSourceData).toBe('function');

            manager.dispose();
            domainRegistrar.unregister('test-ability-rename');
            schemaRegistrar.unregister('TestRenameUser');
        });
    });

    describe('Ability 注入验证', () => {
        it('Ability 方法通过 Object.defineProperty 注入到宿主实例', () => {
            const manager = new TestOverrideManager();

            // 验证方法存在
            expect(typeof (manager as any).getData).toBe('function');
            expect(typeof (manager as any).sharedMethod).toBe('function');

            // 验证方法可调用
            expect((manager as any).getData()).toBe('from-ability-b');
            expect((manager as any).sharedMethod()).toBe('shared-b');
        });

        it('多个 Ability 方法共存（非同名方法）', () => {
            const manager = new TestOverrideManager();

            // AbilityA 和 AbilityB 的非同名方法都应存在
            // 但由于 AbilityB 覆盖了 getData 和 sharedMethod
            // 只有 AbilityB 的版本存在
            expect((manager as any).getData()).toBe('from-ability-b');
        });
    });
});
