/**
 * EventSourceRegistrar 单元测试
 */

import { EventSourceRegistrar } from '@/events/EventSourceRegistrar';

describe('EventSourceRegistrar', () => {
    let registrar: EventSourceRegistrar;

    beforeEach(() => {
        // 每次测试用新实例，避免单例状态互相影响
        // 通过 clear 清理单例状态
        registrar = EventSourceRegistrar.getInstance();
        registrar.clear();
    });

    test('注册 eventKey', () => {
        const component = { constructor: { name: 'UserTable' } };
        registrar.register('userTable', component);

        expect(registrar.has('userTable')).toBe(true);
        expect(registrar.getComponent('userTable')).toBe(component);
    });

    test('重复注册同一组件不报错', () => {
        const component = { constructor: { name: 'UserTable' } };
        registrar.register('userTable', component);

        // 同一组件重复注册，不报错
        expect(() => {
            registrar.register('userTable', component);
        }).not.toThrow();
    });

    test('不同组件注册相同 eventKey 报错', () => {
        const component1 = { constructor: { name: 'UserTable' } };
        const component2 = { constructor: { name: 'RoleTable' } };

        registrar.register('userTable', component1);

        expect(() => {
            registrar.register('userTable', component2);
        }).toThrow('[EventSourceRegistrar] eventKey "userTable" already registered by UserTable');
    });

    test('注销 eventKey', () => {
        const component = { constructor: { name: 'UserTable' } };
        registrar.register('userTable', component);
        registrar.unregister('userTable');

        expect(registrar.has('userTable')).toBe(false);
        expect(registrar.getComponent('userTable')).toBeUndefined();
    });

    test('注销后可重新注册', () => {
        const component1 = { constructor: { name: 'UserTable' } };
        const component2 = { constructor: { name: 'NewUserTable' } };

        registrar.register('userTable', component1);
        registrar.unregister('userTable');

        expect(() => {
            registrar.register('userTable', component2);
        }).not.toThrow();

        expect(registrar.getComponent('userTable')).toBe(component2);
    });

    test('注销不存在的 eventKey 不报错', () => {
        expect(() => {
            registrar.unregister('nonexistent');
        }).not.toThrow();
    });

    test('清空所有注册', () => {
        registrar.register('userTable', { constructor: { name: 'UserTable' } });
        registrar.register('roleTable', { constructor: { name: 'RoleTable' } });

        registrar.clear();

        expect(registrar.has('userTable')).toBe(false);
        expect(registrar.has('roleTable')).toBe(false);
    });

    test('单例模式', () => {
        const instance1 = EventSourceRegistrar.getInstance();
        const instance2 = EventSourceRegistrar.getInstance();

        expect(instance1).toBe(instance2);
    });

    test('getComponent 返回 undefined 对于未注册的 key', () => {
        expect(registrar.getComponent('nonexistent')).toBeUndefined();
    });

    test('has 返回 false 对于未注册的 key', () => {
        expect(registrar.has('nonexistent')).toBe(false);
    });
});
