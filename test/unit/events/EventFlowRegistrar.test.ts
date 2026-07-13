/**
 * EventFlowRegistrar 单元测试
 *
 * 测试覆盖：
 * 1. 定义层：registerDefinition / getDefinition / getDefinitionListeners
 * 2. 订阅层：registerSubscription / unregisterByComponent / getSubscriptions / getSubscriptionCount
 * 3. 调试：inspect
 * 4. 清理：clear
 * 5. 与 bindEventListens 的集成
 */

import { EventFlowRegistrar } from '@/events/EventFlowRegistrar';
import { bindEventListens } from '@/events/StateTrigger';
import { ComposableBase } from '@/composable';
import { EventAbility } from '@/system-abilities/system/EventAbility';
import { EventSourceRegistrar } from '@/events/EventSourceRegistrar';
import type { EventListen } from '@/layout/LayoutNode';

describe('EventFlowRegistrar', () => {
    let flowRegistrar: EventFlowRegistrar;
    let sourceRegistrar: EventSourceRegistrar;

    beforeEach(() => {
        flowRegistrar = EventFlowRegistrar.getInstance();
        flowRegistrar.clear();
        sourceRegistrar = EventSourceRegistrar.getInstance();
        sourceRegistrar.clear();
    });

    // ============================================
    // 定义层
    // ============================================

    test('registerDefinition 注册定义', () => {
        const listens: EventListen[] = [
            { source: 'userTable', events: { selectionChange: 'onSelectionChange' } },
        ];
        flowRegistrar.registerDefinition({ componentType: 'Toolbar', listens });

        const def = flowRegistrar.getDefinition('Toolbar');
        expect(def).toBeDefined();
        expect(def!.listens).toEqual(listens);
    });

    test('registerDefinition 同一类型只注册一次', () => {
        const listens1: EventListen[] = [
            { source: 'userTable', events: { selectionChange: 'onSelectionChange' } },
        ];
        const listens2: EventListen[] = [
            { source: 'roleTable', events: { selectionChange: 'onRoleSelectionChange' } },
        ];

        flowRegistrar.registerDefinition({ componentType: 'Toolbar', listens: listens1 });
        flowRegistrar.registerDefinition({ componentType: 'Toolbar', listens: listens2 });

        // 第二次注册被忽略
        const def = flowRegistrar.getDefinition('Toolbar');
        expect(def!.listens).toEqual(listens1);
    });

    test('getDefinition 不存在返回 undefined', () => {
        expect(flowRegistrar.getDefinition('NonExistent')).toBeUndefined();
    });

    test('getDefinitionListeners 查询监听某事件的组件类型', () => {
        flowRegistrar.registerDefinition({
            componentType: 'Toolbar',
            listens: [
                { source: 'userTable', events: { selectionChange: 'onSelectionChange' } },
            ],
        });
        flowRegistrar.registerDefinition({
            componentType: 'Table',
            listens: [
                { events: { dataChange: 'onDataChange' } },
            ],
        });

        const listeners = flowRegistrar.getDefinitionListeners('selectionChange');
        expect(listeners).toHaveLength(1);
        expect(listeners[0].componentType).toBe('Toolbar');
    });

    // ============================================
    // 订阅层
    // ============================================

    test('registerSubscription 注册订阅', () => {
        const component = { constructor: { name: 'Toolbar' } };
        const off = jest.fn();

        flowRegistrar.registerSubscription({
            component,
            event: 'userTable:selectionChange',
            handler: 'onSelectionChange',
            off,
        });

        expect(flowRegistrar.getSubscriptionCount('userTable:selectionChange')).toBe(1);
    });

    test('getSubscriptions 返回订阅列表', () => {
        const component = { constructor: { name: 'Toolbar' } };
        const off = jest.fn();

        flowRegistrar.registerSubscription({
            component,
            event: 'userTable:selectionChange',
            handler: 'onSelectionChange',
            off,
        });

        const subs = flowRegistrar.getSubscriptions('userTable:selectionChange');
        expect(subs).toHaveLength(1);
        expect(subs[0].handler).toBe('onSelectionChange');
    });

    test('unregisterByComponent 解绑组件的所有订阅', () => {
        const component = { constructor: { name: 'Toolbar' } };
        const off = jest.fn();

        flowRegistrar.registerSubscription({
            component,
            event: 'userTable:selectionChange',
            handler: 'onSelectionChange',
            off,
        });

        flowRegistrar.unregisterByComponent(component);

        expect(off).toHaveBeenCalled();
        expect(flowRegistrar.getSubscriptionCount('userTable:selectionChange')).toBe(0);
    });

    test('unregisterByComponent 不影响其他组件的订阅', () => {
        const component1 = { constructor: { name: 'Toolbar' } };
        const component2 = { constructor: { name: 'Table' } };
        const off1 = jest.fn();
        const off2 = jest.fn();

        flowRegistrar.registerSubscription({
            component: component1,
            event: 'userTable:selectionChange',
            handler: 'onSelectionChange',
            off: off1,
        });
        flowRegistrar.registerSubscription({
            component: component2,
            event: 'userTable:selectionChange',
            handler: 'onDataChange',
            off: off2,
        });

        flowRegistrar.unregisterByComponent(component1);

        expect(off1).toHaveBeenCalled();
        expect(off2).not.toHaveBeenCalled();
        expect(flowRegistrar.getSubscriptionCount('userTable:selectionChange')).toBe(1);
    });

    // ============================================
    // 调试
    // ============================================

    test('inspect 输出调试信息', () => {
        flowRegistrar.registerDefinition({
            componentType: 'Toolbar',
            listens: [
                { source: 'userTable', events: { selectionChange: 'onSelectionChange' } },
            ],
        });

        const output = flowRegistrar.inspect();
        expect(output).toContain('EventFlowRegistrar');
        expect(output).toContain('Toolbar');
        expect(output).toContain('selectionChange');
    });

    // ============================================
    // 清理
    // ============================================

    test('clear 清空所有定义和订阅', () => {
        flowRegistrar.registerDefinition({
            componentType: 'Toolbar',
            listens: [
                { source: 'userTable', events: { selectionChange: 'onSelectionChange' } },
            ],
        });

        const off = jest.fn();
        flowRegistrar.registerSubscription({
            component: {},
            event: 'userTable:selectionChange',
            handler: 'onSelectionChange',
            off,
        });

        flowRegistrar.clear();

        expect(flowRegistrar.getDefinition('Toolbar')).toBeUndefined();
        expect(flowRegistrar.getSubscriptionCount('userTable:selectionChange')).toBe(0);
        expect(off).toHaveBeenCalled();
    });

    // ============================================
    // 与 bindEventListens 的集成
    // ============================================

    test('bindEventListens 自动注册到 EventFlowRegistrar', () => {
        class SourceComp extends ComposableBase.with([EventAbility]) {
            static readonly eventKey = 'testSource';
        }

        const source = new SourceComp();
        expect(source.eventScope).toBeDefined();

        const listener = new (class ListenerComp extends ComposableBase.with([EventAbility]) {
            onEvent(_ctx: any) {}
        })();

        bindEventListens([
            { source: 'testSource', events: { dataChange: 'onEvent' } },
        ], listener);

        // EventFlowRegistrar 应该有订阅记录
        expect(flowRegistrar.getSubscriptionCount('testSource:dataChange')).toBe(1);

        source.dispose();
        listener.dispose();
    });
});
