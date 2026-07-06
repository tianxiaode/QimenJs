/**
 * 工具栏场景测试：验证 eventKey 拼接和事件绑定
 *
 * 测试场景：
 * 1. 默认按钮（add/delete）emit 事件，验证 eventKey:type 拼接
 * 2. 扩展按钮（extraButtons）emit 事件，验证也能使用 eventKey
 * 3. 不同 eventKey 的 Toolbar，验证事件名不冲突
 * 4. 无 eventKey 的组件，验证事件名无前缀
 * 5. EventSourceRegistrar 校验 eventKey 唯一性
 * 6. 深拷贝 data 脱离原始引用
 * 7. 事件链 chain 自动构建
 * 8. StateTrigger 格式：source + events 映射
 */

import { EventBus } from '@/events/EventBus';
import { ComposableBase } from '@/composable/ComposableBase';
import { object } from '@/utils';

// ============================================
// 模拟 EventContext（简化版，验证核心逻辑）
// ============================================

interface EventChainLink {
    event: string;
    type: string;
    source: string;
    sourceType: string;
}

interface EventContext {
    event: string;
    type: string;
    source: string;
    sourceType: string;
    data: any;
    domEvent?: Event;
    chain?: EventChainLink[];
    _refCount?: number;
}

// ============================================
// 模拟 EventSourceRegistrar
// ============================================

class EventSourceRegistrar {
    private sources = new Map<string, any>();

    register(eventKey: string, component: any): void {
        const existing = this.sources.get(eventKey);
        if (existing && existing !== component) {
            throw new Error(`[EventSourceRegistrar] eventKey "${eventKey}" already registered by ${existing.constructor.name}`);
        }
        this.sources.set(eventKey, component);
    }

    unregister(eventKey: string): void {
        this.sources.delete(eventKey);
    }

    getComponent(eventKey: string): any | undefined {
        return this.sources.get(eventKey);
    }

    clear(): void {
        this.sources.clear();
    }
}

const eventSourceRegistrar = new EventSourceRegistrar();

// ============================================
// 简化版 EventBus，支持 EventContext
// 现有 EventBus.emit 内部构建 IEventContext，不适合直接传 EventContext
// 这里用一个简单的 Map 来模拟，验证核心逻辑
// ============================================

class SimpleEventBus {
    private listeners = new Map<string, Set<(ctx: EventContext) => void>>();

    on(event: string, handler: (ctx: EventContext) => void): () => void {
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        set.add(handler);
        return () => {
            set!.delete(handler);
            if (set!.size === 0) this.listeners.delete(event);
        };
    }

    once(event: string, handler: (ctx: EventContext) => void): () => void {
        const off = this.on(event, (ctx) => {
            off();
            handler(ctx);
        });
        return off;
    }

    emit(event: string, ctx: EventContext): void {
        const handlers = this.listeners.get(event);
        if (!handlers || handlers.size === 0) return;
        handlers.forEach(handler => {
            try {
                handler(ctx);
            } catch (err) {
                console.error(`[SimpleEventBus] handler error on "${event}":`, err);
            }
        });
    }
}

// ============================================
// 模拟 ComponentBase（简化版，只实现 emitUI 核心逻辑）
// ============================================

class ComponentBase extends ComposableBase {
    name?: string;
    eventKey?: string;
    private _currentEventContext?: EventContext;
    private _eventBus: SimpleEventBus;

    constructor(eventBus: SimpleEventBus) {
        super();
        this._eventBus = eventBus;
    }

    /**
     * 发射 UI 事件（核心逻辑，与设计文档一致）
     */
    emitUI(event: string, data?: any, domEvent?: Event): void {
        // 1. 自动构建 chain
        const currentCtx = this._currentEventContext;
        const chain = currentCtx
            ? [
                ...(currentCtx.chain || []),
                { event: currentCtx.event, type: currentCtx.type,
                  source: currentCtx.source, sourceType: currentCtx.sourceType },
              ]
            : undefined;

        // 2. 深拷贝 data，脱离原始引用
        const clonedData = data !== undefined ? object.clone(data) : undefined;

        // 3. 构建完整事件名（eventKey:type，保证全局唯一性）
        const fullEvent = this.eventKey ? `${this.eventKey}:${event}` : event;

        // 4. 构建 EventContext
        const ctx: EventContext = {
            event: fullEvent,
            type: event,
            source: this.eventKey ?? '',
            sourceType: this.constructor.name,
            data: clonedData,
            domEvent,
            chain,
        };

        // 5. 发射事件
        this._eventBus.emit(fullEvent, ctx);
    }

    /**
     * 监听事件（委托给 SimpleEventBus）
     */
    on(event: string, handler: (ctx: EventContext) => void): () => void {
        return this._eventBus.on(event, handler);
    }

    /**
     * 注册 eventKey
     */
    registerEventKey(eventKey: string): void {
        this.eventKey = eventKey;
        eventSourceRegistrar.register(eventKey, this);
    }

    /**
     * 注销 eventKey
     */
    unregisterEventKey(): void {
        if (this.eventKey) {
            eventSourceRegistrar.unregister(this.eventKey);
            this.eventKey = undefined;
        }
    }

    /**
     * 模拟 stateTriggers handler 执行（设置 _currentEventContext）
     */
    executeHandler(handler: (ctx: EventContext) => void, ctx: EventContext): void {
        this._currentEventContext = ctx;
        try {
            handler(ctx);
        } finally {
            this._currentEventContext = undefined;
        }
    }
}

// ============================================
// 测试
// ============================================

describe('Toolbar EventKey 场景', () => {
    let eventBus: SimpleEventBus;

    beforeEach(() => {
        eventBus = new SimpleEventBus();
        eventSourceRegistrar.clear();
    });

    test('默认按钮：eventKey 拼接到事件名', () => {
        const toolbar = new ComponentBase(eventBus);
        toolbar.registerEventKey('toolbar');

        const receivedEvents: string[] = [];

        // 监听 toolbar:add 事件
        eventBus.on('toolbar:add', (ctx) => {
            receivedEvents.push(ctx.type);
        });

        // 模拟点击"新增"按钮
        toolbar.emitUI('add', { key: 'add' });

        expect(receivedEvents).toEqual(['add']);
    });

    test('默认按钮：EventContext 字段正确', () => {
        const toolbar = new ComponentBase(eventBus);
        toolbar.registerEventKey('toolbar');

        let receivedCtx: EventContext | undefined;

        eventBus.on('toolbar:delete', (ctx) => {
            receivedCtx = ctx;
        });

        toolbar.emitUI('delete', { key: 'delete' });

        expect(receivedCtx!.event).toBe('toolbar:delete');
        expect(receivedCtx!.type).toBe('delete');
        expect(receivedCtx!.source).toBe('toolbar');
        expect(receivedCtx!.sourceType).toBe('ComponentBase');
        expect(receivedCtx!.data).toEqual({ key: 'delete' });
    });

    test('扩展按钮：也能使用 eventKey', () => {
        const toolbar = new ComponentBase(eventBus);
        toolbar.registerEventKey('toolbar');

        let receivedCtx: EventContext | undefined;

        // 监听扩展按钮事件
        eventBus.on('toolbar:assignRole', (ctx) => {
            receivedCtx = ctx;
        });

        // 模拟点击"分配角色"扩展按钮
        toolbar.emitUI('assignRole', { key: 'assignRole', custom: true });

        expect(receivedCtx!.event).toBe('toolbar:assignRole');
        expect(receivedCtx!.type).toBe('assignRole');
        expect(receivedCtx!.source).toBe('toolbar');
        expect(receivedCtx!.data).toEqual({ key: 'assignRole', custom: true });
    });

    test('不同 eventKey 的 Toolbar：事件名不冲突', () => {
        const userToolbar = new ComponentBase(eventBus);
        userToolbar.registerEventKey('userToolbar');

        const roleToolbar = new ComponentBase(eventBus);
        roleToolbar.registerEventKey('roleToolbar');

        const userEvents: string[] = [];
        const roleEvents: string[] = [];

        eventBus.on('userToolbar:add', (ctx) => {
            userEvents.push(ctx.source);
        });
        eventBus.on('roleToolbar:add', (ctx) => {
            roleEvents.push(ctx.source);
        });

        // 两个 Toolbar 都 emit add 事件
        userToolbar.emitUI('add', { key: 'add' });
        roleToolbar.emitUI('add', { key: 'add' });

        // 各自只收到自己的事件
        expect(userEvents).toEqual(['userToolbar']);
        expect(roleEvents).toEqual(['roleToolbar']);
    });

    test('无 eventKey 的组件：事件名无前缀', () => {
        const button = new ComponentBase(eventBus);
        // 不设置 eventKey

        let receivedCtx: EventContext | undefined;

        eventBus.on('click', (ctx) => {
            receivedCtx = ctx;
        });

        button.emitUI('click', { key: 'click' });

        expect(receivedCtx!.event).toBe('click');
        expect(receivedCtx!.type).toBe('click');
        expect(receivedCtx!.source).toBe('');
    });

    test('EventSourceRegistrar：重复 eventKey 报错', () => {
        const toolbar1 = new ComponentBase(eventBus);
        toolbar1.registerEventKey('toolbar');

        const toolbar2 = new ComponentBase(eventBus);
        expect(() => {
            toolbar2.registerEventKey('toolbar');
        }).toThrow('[EventSourceRegistrar] eventKey "toolbar" already registered');
    });

    test('EventSourceRegistrar：注销后可重新注册', () => {
        const toolbar1 = new ComponentBase(eventBus);
        toolbar1.registerEventKey('toolbar');
        toolbar1.unregisterEventKey();

        const toolbar2 = new ComponentBase(eventBus);
        expect(() => {
            toolbar2.registerEventKey('toolbar');
        }).not.toThrow();
    });

    test('深拷贝 data：脱离原始引用', () => {
        const toolbar = new ComponentBase(eventBus);
        toolbar.registerEventKey('toolbar');

        let receivedCtx: EventContext | undefined;
        eventBus.on('toolbar:selectionChange', (ctx) => {
            receivedCtx = ctx;
        });

        const originalData = { rows: [{ id: 1 }], selectedCount: 1 };
        toolbar.emitUI('selectionChange', originalData);

        // 修改原始数据，不影响 EventContext 中的 data
        originalData.rows[0].id = 999;
        originalData.selectedCount = 0;

        expect(receivedCtx!.data.rows[0].id).toBe(1);
        expect(receivedCtx!.data.selectedCount).toBe(1);
    });

    test('事件链：chain 自动构建', () => {
        const toolbar = new ComponentBase(eventBus);
        toolbar.registerEventKey('toolbar');

        const editDialog = new ComponentBase(eventBus);
        editDialog.registerEventKey('editDialog');

        // 模拟：toolbar emit add → handler 中 editDialog emit dataChange
        let toolbarCtx: EventContext | undefined;
        let dialogCtx: EventContext | undefined;

        eventBus.on('toolbar:add', (ctx) => {
            toolbarCtx = ctx;
            // 模拟 handler 执行期间，editDialog emit 事件
            editDialog.executeHandler(() => {
                editDialog.emitUI('dataChange', { action: 'create' });
            }, ctx);
        });

        eventBus.on('editDialog:dataChange', (ctx) => {
            dialogCtx = ctx;
        });

        toolbar.emitUI('add', { key: 'add' });

        // toolbar 的 chain 为空（起始事件）
        expect(toolbarCtx!.chain).toBeUndefined();

        // editDialog 的 chain 包含 toolbar:add
        expect(dialogCtx!.chain).toEqual([
            { event: 'toolbar:add', type: 'add', source: 'toolbar', sourceType: 'ComponentBase' },
        ]);
    });

    test('StateTrigger 格式：source + events 映射', () => {
        const toolbar = new ComponentBase(eventBus);
        toolbar.registerEventKey('toolbar');

        const userTable = new ComponentBase(eventBus);
        userTable.registerEventKey('userTable');

        // 模拟 stateTriggers 绑定
        // { source: 'userTable', events: { selectionChange: 'onSelectionChange' } }
        const handlerResults: string[] = [];

        // bindStateTriggers 逻辑：source 存在 → 监听 source:eventType 格式
        // 因为 emitUI 会拼接 eventKey:type，所以监听时也要用完整事件名
        eventBus.on('userTable:selectionChange', (ctx) => {
            if (typeof (toolbar as any).onSelectionChange === 'function') {
                (toolbar as any).onSelectionChange(ctx);
            }
        });

        // 给 toolbar 添加 handler 方法
        (toolbar as any).onSelectionChange = (ctx: EventContext) => {
            handlerResults.push(`selectionChange:${ctx.data.selectedCount}`);
        };

        // userTable emit selectionChange
        userTable.emitUI('selectionChange', { rows: [], selectedCount: 3 });

        expect(handlerResults).toEqual(['selectionChange:3']);
    });

    test('StateTrigger 格式：多个 source 的事件不冲突', () => {
        const toolbar = new ComponentBase(eventBus);
        toolbar.registerEventKey('toolbar');

        const userTable = new ComponentBase(eventBus);
        userTable.registerEventKey('userTable');

        const roleTable = new ComponentBase(eventBus);
        roleTable.registerEventKey('roleTable');

        // 模拟 stateTriggers：
        // [
        //   { source: 'userTable', events: { selectionChange: 'onUserSelectionChange' } },
        //   { source: 'roleTable', events: { selectionChange: 'onRoleSelectionChange' } }
        // ]
        const results: string[] = [];

        // 监听时使用 source:eventType 格式
        eventBus.on('userTable:selectionChange', (ctx) => {
            results.push(`user:${ctx.data.selectedCount}`);
        });

        eventBus.on('roleTable:selectionChange', (ctx) => {
            results.push(`role:${ctx.data.selectedCount}`);
        });

        // 两个表都 emit selectionChange
        userTable.emitUI('selectionChange', { rows: [], selectedCount: 1 });
        roleTable.emitUI('selectionChange', { rows: [], selectedCount: 2 });

        expect(results).toEqual(['user:1', 'role:2']);
    });
});
