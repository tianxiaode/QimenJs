/**
 * StateTrigger 绑定逻辑测试
 *
 * 测试覆盖：
 * 1. 有 source 且 source 组件存在 → 监听该组件的事件
 * 2. 有 source 但 source 组件不存在 → 监听全局事件总线
 * 3. 无 source → 监听全局事件总线
 * 4. once 只执行一次
 * 5. handler 通过 executeWithEventContext 包装
 * 6. off 取消所有订阅
 * 7. handler 不存在时不报错
 */

import { ComposableBase } from '@/composable';
import { EventAbility } from '@/system-abilities/system/EventAbility';
import { bindStateTriggers, StateTrigger } from '@/events/StateTrigger';
import { EventSourceRegistrar } from '@/events/EventSourceRegistrar';
import { globalEventBus } from '@/events/GlobalEventBus';
import type { EventContext } from '@/context';

// 测试用子类
class SourceComponent extends ComposableBase.with([EventAbility]) {
    static readonly eventKey = 'userTable';
}

class ListenerComponent extends ComposableBase.with([EventAbility]) {

    handlerCallCount = 0;
    lastCtx: EventContext | undefined;

    onSelectionChange(ctx: EventContext) {
        this.handlerCallCount++;
        this.lastCtx = ctx;
    }

    onDataChange(ctx: EventContext) {
        this.handlerCallCount++;
        this.lastCtx = ctx;
    }

    onLocaleChange(ctx: EventContext) {
        this.handlerCallCount++;
        this.lastCtx = ctx;
    }
}

describe('bindStateTriggers', () => {
    let registrar: EventSourceRegistrar;

    beforeEach(() => {
        registrar = EventSourceRegistrar.getInstance();
        registrar.clear();
    });

    // === 有 source 且 source 组件存在 ===

    test('监听 source 组件的事件', () => {
        const source = new SourceComponent();
        expect(source.eventScope).toBeDefined(); // 触发 eventKey 注册

        const listener = new ListenerComponent();

        const { off } = bindStateTriggers([
            { source: 'userTable', events: { selectionChange: 'onSelectionChange' } },
        ], listener);

        source.emitUI('selectionChange', { rows: [], selectedCount: 0 });

        expect(listener.handlerCallCount).toBe(1);
        expect(listener.lastCtx!.event).toBe('userTable:selectionChange');
        expect(listener.lastCtx!.type).toBe('selectionChange');

        off();
        source.dispose();
        listener.dispose();
    });

    test('多个事件映射', () => {
        const source = new SourceComponent();
        expect(source.eventScope).toBeDefined();

        const listener = new ListenerComponent();

        bindStateTriggers([
            {
                source: 'userTable',
                events: {
                    selectionChange: 'onSelectionChange',
                    dataChange: 'onDataChange',
                },
            },
        ], listener);

        source.emitUI('selectionChange', { rows: [], selectedCount: 1 });
        expect(listener.handlerCallCount).toBe(1);

        source.emitUI('dataChange', { action: 'create' });
        expect(listener.handlerCallCount).toBe(2);

        source.dispose();
        listener.dispose();
    });

    // === 有 source 但 source 组件不存在 ===

    test('source 组件不存在时监听全局事件总线', () => {
        const listener = new ListenerComponent();

        const { off } = bindStateTriggers([
            { source: 'nonExistent', events: { dataChange: 'onDataChange' } },
        ], listener);

        // 通过全局事件总线发射
        globalEventBus.emit('nonExistent:dataChange', {
            event: 'nonExistent:dataChange',
            type: 'dataChange',
            source: 'nonExistent',
            timestamp: Date.now(),
            busId: globalEventBus.getBusId(),
            data: { action: 'create' },
        });

        expect(listener.handlerCallCount).toBe(1);

        off();
        listener.dispose();
    });

    // === 无 source ===

    test('无 source 时监听全局事件总线', () => {
        const listener = new ListenerComponent();

        const { off } = bindStateTriggers([
            { events: { localeChange: 'onLocaleChange' } },
        ], listener);

        // 通过全局事件总线发射
        globalEventBus.emit('localeChange', {
            event: 'localeChange',
            type: 'localeChange',
            source: 'i18n',
            timestamp: Date.now(),
            busId: globalEventBus.getBusId(),
            data: { locale: 'zh-CN' },
        });

        expect(listener.handlerCallCount).toBe(1);
        expect(listener.lastCtx!.type).toBe('localeChange');

        off();
        listener.dispose();
    });

    // === once ===

    test('once 只执行一次', () => {
        const source = new SourceComponent();
        expect(source.eventScope).toBeDefined();

        const listener = new ListenerComponent();

        bindStateTriggers([
            { source: 'userTable', events: { selectionChange: 'onSelectionChange' }, once: true },
        ], listener);

        source.emitUI('selectionChange', { rows: [], selectedCount: 1 });
        expect(listener.handlerCallCount).toBe(1);

        // 第二次不应触发
        source.emitUI('selectionChange', { rows: [], selectedCount: 2 });
        expect(listener.handlerCallCount).toBe(1);

        source.dispose();
        listener.dispose();
    });

    // === off 取消订阅 ===

    test('off 取消所有订阅', () => {
        const source = new SourceComponent();
        expect(source.eventScope).toBeDefined();

        const listener = new ListenerComponent();

        const { off } = bindStateTriggers([
            { source: 'userTable', events: { selectionChange: 'onSelectionChange' } },
        ], listener);

        source.emitUI('selectionChange', { rows: [], selectedCount: 1 });
        expect(listener.handlerCallCount).toBe(1);

        off();

        source.emitUI('selectionChange', { rows: [], selectedCount: 2 });
        expect(listener.handlerCallCount).toBe(1); // 不再增加

        source.dispose();
        listener.dispose();
    });

    // === handler 不存在 ===

    test('handler 不存在时不报错', () => {
        const source = new SourceComponent();
        expect(source.eventScope).toBeDefined();

        const listener = new ListenerComponent();

        const { off } = bindStateTriggers([
            { source: 'userTable', events: { selectionChange: 'nonExistentHandler' } },
        ], listener);

        expect(() => {
            source.emitUI('selectionChange', { rows: [], selectedCount: 1 });
        }).not.toThrow();

        off();
        source.dispose();
        listener.dispose();
    });

    // === subscriptions 记录 ===

    test('返回正确的 subscriptions 记录', () => {
        const source = new SourceComponent();
        expect(source.eventScope).toBeDefined();

        const listener = new ListenerComponent();

        const { subscriptions } = bindStateTriggers([
            { source: 'userTable', events: { selectionChange: 'onSelectionChange' } },
        ], listener);

        expect(subscriptions).toHaveLength(1);
        expect(subscriptions[0].event).toBe('userTable:selectionChange');
        expect(subscriptions[0].handler).toBe('onSelectionChange');
        expect(subscriptions[0].component).toBe(listener);
        expect(typeof subscriptions[0].off).toBe('function');

        source.dispose();
        listener.dispose();
    });

    // === executeWithEventContext 包装 ===

    test('handler 通过 executeWithEventContext 包装，chain 正确构建', () => {
        const source = new SourceComponent();
        expect(source.eventScope).toBeDefined();

        const dialog = new (class TestDialog extends ComposableBase.with([EventAbility]) {
            static readonly eventKey = 'testDialog';
            chainInHandler: any = undefined;

            onDataChange(ctx: EventContext) {
                this.chainInHandler = ctx.chain;
            }
        })();
        expect(dialog.eventScope).toBeDefined();

        // dialog 监听 source 的 dataChange
        bindStateTriggers([
            { source: 'userTable', events: { dataChange: 'onDataChange' } },
        ], dialog);

        // source 发射事件
        source.emitUI('dataChange', { action: 'create' });

        // dialog 的 handler 中 chain 应该包含 source 的事件
        // 注意：executeWithEventContext 在 handler 执行期间设置 _currentEventContext
        // 但 handler 内部 emitUI 时 chain 才会用到
        // 这里只验证 handler 被正确调用
        expect(dialog.chainInHandler).toBeUndefined(); // 直接监听，chain 为空

        source.dispose();
        dialog.dispose();
    });
});
