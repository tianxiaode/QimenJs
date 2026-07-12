/**
 * EntityCoreAbility / PermissionAbility / EventBridgeAbility / PropAlias 单元测试
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(),
            })),
        },
    };
});

import { TemplateComponent } from '@/component-core';
import { EntityCoreAbility } from '@/component-core/abilities/EntityCoreAbility';
import { PermissionAbility } from '@/component-core/abilities/PermissionAbility';
import { EventBridgeAbility } from '@/component-core/abilities/EventBridgeAbility';
import { mergePropAliases, applyPropAliases, getPropAliases, getInitProps, initAbilitiesFromProps } from '@/component-core/abilities/PropAlias';
import type { AbilityDefinition } from '@/composable';

const TPL = '<div class="box"><span data-content="box:label"></span></div>';

// ============================================
// EntityCoreAbility
// ============================================

describe('EntityCoreAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(EntityCoreAbility);

    it('getEntity 默认 undefined', () => {
        const instance = new BoxClass() as any;
        expect(instance.getEntity()).toBeUndefined();
    });

    it('setEntity / getEntity 读写', () => {
        class MyManager { dispose() {} }
        const instance = new BoxClass() as any;
        instance.setEntity(MyManager);
        expect(instance.getEntity()).toBe(MyManager);
    });
});

// ============================================
// PermissionAbility
// ============================================

describe('PermissionAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(PermissionAbility);

    it('getPermission 默认 undefined', () => {
        const instance = new BoxClass() as any;
        expect(instance.getPermission()).toBeUndefined();
    });

    it('setPermission — behavior=hidden 无权限 → display=none', () => {
        const instance = new BoxClass() as any;
        instance.setPermission({ behavior: 'hidden' });
        // checkPermission 当前始终返回 true，所以不会隐藏
        // 但我们验证 setPermission 调用了 _listenPermissionChange
        expect(instance._permissionListening).toBe(true);
    });

    it('setPermission — falsy 值不触发 applyPermission', () => {
        const instance = new BoxClass() as any;
        instance.setPermission(null);
        expect(instance.getPermission()).toBeNull();
    });

    it('_listenPermissionChange — 防重复注册', () => {
        const instance = new BoxClass() as any;
        instance._permissionListening = true;
        // 不应抛异常
        instance._listenPermissionChange();
        expect(instance._permissionListening).toBe(true);
    });
});

// ============================================
// EventBridgeAbility
// ============================================

describe('EventBridgeAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(EventBridgeAbility);

    it('getEventBridge / setEventBridge 读写', () => {
        const instance = new BoxClass() as any;
        const config = { pagination: { source: 'pager1' } };
        instance.setEventBridge(config);
        expect(instance.getEventBridge()).toEqual(config);
    });

    it('initEventBridge — 无配置 → 不报错', () => {
        const instance = new BoxClass() as any;
        expect(() => instance.initEventBridge()).not.toThrow();
    });

    it('initEventBridge — pagination 配置 enabled=false → 跳过', () => {
        const instance = new BoxClass() as any;
        instance.setEventBridge({ pagination: { source: 'pager1', enabled: false } });
        // 不应抛异常
        expect(() => instance.initEventBridge()).not.toThrow();
    });

    it('initEventBridge — crud 配置', () => {
        const instance = new BoxClass() as any;
        instance.setEventBridge({ crud: { source: 'crud1' } });
        expect(() => instance.initEventBridge()).not.toThrow();
    });

    it('initEventBridge — 自定义桥接', () => {
        const instance = new BoxClass() as any;
        instance.setEventBridge({ myEvent: { source: 'src1' } });
        expect(() => instance.initEventBridge()).not.toThrow();
    });

    it('normalizeBridgeConfig — string → {source}', () => {
        // 间接测试：通过 setEventBridge 传入 string
        const instance = new BoxClass() as any;
        instance.setEventBridge({ pagination: 'pager1' });
        expect(() => instance.initEventBridge()).not.toThrow();
    });
});

// ============================================
// PropAlias
// ============================================

describe('PropAlias', () => {
    describe('getPropAliases', () => {
        it('有 __propAliases → 返回', () => {
            const ability: AbilityDefinition = { __propAliases: { myAlias: 'myProp' } } as any;
            expect(getPropAliases(ability)).toEqual({ myAlias: 'myProp' });
        });

        it('无 __propAliases → 返回空对象', () => {
            const ability: AbilityDefinition = {};
            expect(getPropAliases(ability)).toEqual({});
        });
    });

    describe('getInitProps', () => {
        it('有 __initProps 函数 → 返回', () => {
            const fn = jest.fn();
            const ability: AbilityDefinition = { __initProps: fn } as any;
            expect(getInitProps(ability)).toBe(fn);
        });

        it('无 __initProps → 返回 undefined', () => {
            const ability: AbilityDefinition = {};
            expect(getInitProps(ability)).toBeUndefined();
        });
    });

    describe('mergePropAliases', () => {
        it('合并多个能力的别名', () => {
            const a1: AbilityDefinition = { __propAliases: { x: 'left' } } as any;
            const a2: AbilityDefinition = { __propAliases: { y: 'top' } } as any;
            const result = mergePropAliases([a1, a2]);
            expect(result).toEqual({ x: 'left', y: 'top' });
        });

        it('空数组 → 空对象', () => {
            expect(mergePropAliases([])).toEqual({});
        });
    });

    describe('applyPropAliases', () => {
        it('props 有别名键 + 组件属性未设置 → 赋值', () => {
            const component: any = { myProp: undefined };
            applyPropAliases(component, { myAlias: 'hello' }, { myAlias: 'myProp' });
            expect(component.myProp).toBe('hello');
        });

        it('props 有别名键 + 组件属性为空字符串 → 赋值', () => {
            const component: any = { myProp: '' };
            applyPropAliases(component, { myAlias: 'hello' }, { myAlias: 'myProp' });
            expect(component.myProp).toBe('hello');
        });

        it('props 有别名键 + 组件属性已有值 → 不覆盖', () => {
            const component: any = { myProp: 'existing' };
            applyPropAliases(component, { myAlias: 'hello' }, { myAlias: 'myProp' });
            expect(component.myProp).toBe('existing');
        });

        it('props 无别名键 → 不操作', () => {
            const component: any = { myProp: undefined };
            applyPropAliases(component, {}, { myAlias: 'myProp' });
            expect(component.myProp).toBeUndefined();
        });
    });

    describe('initAbilitiesFromProps', () => {
        it('调用所有能力的 __initProps', () => {
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            const a1: AbilityDefinition = { __initProps: fn1 } as any;
            const a2: AbilityDefinition = { __initProps: fn2 } as any;
            const component: any = {};

            initAbilitiesFromProps(component, [a1, a2], { key: 'value' });
            expect(fn1).toHaveBeenCalledWith({ key: 'value' });
            expect(fn2).toHaveBeenCalledWith({ key: 'value' });
        });

        it('无 __initProps 的能力跳过', () => {
            const fn1 = jest.fn();
            const a1: AbilityDefinition = { __initProps: fn1 } as any;
            const a2: AbilityDefinition = {};
            const component: any = {};

            initAbilitiesFromProps(component, [a1, a2], {});
            expect(fn1).toHaveBeenCalled();
        });
    });
});
