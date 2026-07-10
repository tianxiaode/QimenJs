/**
 * EventAbility UI 扩展测试
 *
 * 测试覆盖：
 * 1. eventKey 初始化和注册（通过 eventScope 惰性触发）
 * 2. emitUI 事件发射（eventKey:type 拼接、source/sourceType 填充）
 * 3. emitUI 深拷贝 data
 * 4. executeWithEventContext 和 chain 构建
 * 5. dispose 时注销 eventKey
 */

import { ComposableBase } from '@/composable';
import { EventAbility } from '@/system-abilities/system/EventAbility';
import { EventSourceRegistrar } from '@/events/EventSourceRegistrar';
import type { EventContext } from '@/context';

// 测试用子类
class TestToolbar extends ComposableBase {
    static readonly abilities = [EventAbility];
    static readonly eventKey = 'testToolbar';
}

class TestTable extends ComposableBase {
    static readonly abilities = [EventAbility];
    static readonly eventKey = 'testTable';
}

class NoEventKeyHost extends ComposableBase {
    static readonly abilities = [EventAbility];
}

describe('EventAbility UI 扩展', () => {
    let registrar: EventSourceRegistrar;

    beforeEach(() => {
        registrar = EventSourceRegistrar.getInstance();
        registrar.clear();
    });

    // === eventKey 初始化和注册 ===

    test('eventKey 从静态属性初始化', () => {
        const toolbar = new TestToolbar();
        // eventScope 首次访问时触发 _initEventKey
        expect(toolbar.eventScope).toBeDefined();
        expect(toolbar.eventKey).toBe('testToolbar');
    });

    test('eventKey 自动注册到 EventSourceRegistrar', () => {
        const toolbar = new TestToolbar();
        expect(toolbar.eventScope).toBeDefined(); // 触发初始化
        expect(registrar.has('testToolbar')).toBe(true);
        expect(registrar.getComponent('testToolbar')).toBe(toolbar);
    });

    test('无 eventKey 的宿主不注册', () => {
        const host = new NoEventKeyHost();
        expect(host.eventScope).toBeDefined();
        expect(host.eventKey).toBeUndefined();
    });

    test('重复 eventKey 报错', () => {
        const toolbar1 = new TestToolbar();
        expect(toolbar1.eventScope).toBeDefined();
        expect(() => {
            const toolbar2 = new TestToolbar();
            toolbar2.eventScope; // 触发 _initEventKey，重复注册
        }).toThrow();
    });

    // === emitUI 事件发射 ===

    test('emitUI 拼接 eventKey:type 作为事件名', () => {
        const toolbar = new TestToolbar();
        let receivedCtx: EventContext | undefined;

        toolbar.on('testToolbar:add', (ctx: any) => { receivedCtx = ctx; });
        toolbar.emitUI('add', { key: 'add' });

        expect(receivedCtx).toBeDefined();
        expect(receivedCtx!.event).toBe('testToolbar:add');
        expect(receivedCtx!.type).toBe('add');
    });

    test('emitUI 填充 source 和 sourceType', () => {
        const table = new TestTable();
        let receivedCtx: EventContext | undefined;

        table.on('testTable:selectionChange', (ctx: any) => { receivedCtx = ctx; });
        table.emitUI('selectionChange', { rows: [] });

        expect(receivedCtx!.source).toBe('testTable');
        expect(receivedCtx!.sourceType).toBe('TestTable');
    });

    test('无 eventKey 时事件名无前缀', () => {
        const host = new NoEventKeyHost();
        let receivedCtx: EventContext | undefined;

        host.on('click', (ctx: any) => { receivedCtx = ctx; });
        host.emitUI('click', {});

        expect(receivedCtx!.event).toBe('click');
        expect(receivedCtx!.source).toBe('');
    });

    // === 深拷贝 data ===

    test('emitUI 深拷贝 data，脱离原始引用', () => {
        const table = new TestTable();
        let receivedCtx: EventContext | undefined;

        table.on('testTable:dataChange', (ctx: any) => { receivedCtx = ctx; });

        const originalData = { items: [1, 2, 3], name: 'test' };
        table.emitUI('dataChange', originalData);

        // 修改原始数据不影响 EventContext
        originalData.items.push(4);
        originalData.name = 'changed';

        expect(receivedCtx!.data.items).toEqual([1, 2, 3]);
        expect(receivedCtx!.data.name).toBe('test');
    });

    // === chain 构建 ===

    test('executeWithEventContext 构建 chain', () => {
        const toolbar = new TestToolbar();
        const dialog = new (class TestDialog extends ComposableBase {
            static readonly abilities = [EventAbility];
            static readonly eventKey = 'testDialog';
        })();

        let toolbarCtx: EventContext | undefined;
        let dialogCtx: EventContext | undefined;

        toolbar.on('testToolbar:add', (ctx: any) => {
            toolbarCtx = ctx;
            // 模拟 handler 中 dialog emitUI
            dialog.executeWithEventContext(() => {
                dialog.emitUI('dataChange', { action: 'create' });
            }, ctx);
        });

        dialog.on('testDialog:dataChange', (ctx: any) => {
            dialogCtx = ctx;
        });

        toolbar.emitUI('add', { key: 'add' });

        // toolbar 的 chain 为空
        expect(toolbarCtx!.chain).toBeUndefined();

        // dialog 的 chain 包含 toolbar:add
        expect(dialogCtx!.chain).toEqual([
            { event: 'testToolbar:add', type: 'add', source: 'testToolbar', sourceType: 'TestToolbar' },
        ]);
    });

    // === dispose ===

    test('dispose 注销 eventKey', () => {
        const toolbar = new TestToolbar();
        expect(toolbar.eventScope).toBeDefined();
        expect(registrar.has('testToolbar')).toBe(true);

        toolbar.dispose();
        expect(registrar.has('testToolbar')).toBe(false);
    });

    test('dispose 后 emitUI 不报错', () => {
        const toolbar = new TestToolbar();
        toolbar.dispose();

        // dispose 后 eventScope 已销毁，emitUI 内部 globalEventBus.emit 仍可工作
        expect(() => {
            toolbar.emitUI('add', {});
        }).not.toThrow();
    });
});
