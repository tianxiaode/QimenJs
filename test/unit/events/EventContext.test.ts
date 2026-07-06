/**
 * EventContext + EventContextBuilder 单元测试
 */

import { EventContext, EventChainLink, EventContextBuilder } from '@/context';

describe('EventContext', () => {
    test('EventContext 接口结构正确（完整字段）', () => {
        const chain: EventChainLink[] = [
            { event: 'toolbar:add', type: 'add', source: 'toolbar', sourceType: 'Toolbar' },
        ];

        const ctx: EventContext = {
            // 核心字段
            event: 'userTable:selectionChange',
            data: { rows: [], selectedCount: 0 },
            source: 'userTable',
            timestamp: Date.now(),
            busId: 'bus-001',
            scopeId: 'NO_SCOPE',
            // UI 扩展字段
            type: 'selectionChange',
            sourceType: 'UserTable',
            chain,
            _refCount: 2,
            // BaseContext 字段
            steps: [],
            metadata: {},
        };

        expect(ctx.event).toBe('userTable:selectionChange');
        expect(ctx.type).toBe('selectionChange');
        expect(ctx.source).toBe('userTable');
        expect(ctx.sourceType).toBe('UserTable');
        expect(ctx.data).toEqual({ rows: [], selectedCount: 0 });
        expect(ctx.chain).toEqual(chain);
        expect(ctx._refCount).toBe(2);
        expect(ctx.timestamp).toBeDefined();
        expect(ctx.busId).toBe('bus-001');
        expect(ctx.scopeId).toBe('NO_SCOPE');
        expect(ctx.steps).toEqual([]);
        expect(ctx.metadata).toEqual({});
    });

    test('EventContext 可选字段', () => {
        const ctx: EventContext = {
            event: 'click',
            data: null,
            source: '',
            timestamp: Date.now(),
            busId: 'bus-001',
            scopeId: 'NO_SCOPE',
        };

        expect(ctx.type).toBeUndefined();
        expect(ctx.sourceType).toBeUndefined();
        expect(ctx.domEvent).toBeUndefined();
        expect(ctx.chain).toBeUndefined();
        expect(ctx._refCount).toBeUndefined();
        expect(ctx.steps).toBeUndefined();
        expect(ctx.metadata).toBeUndefined();
        expect(ctx.error).toBeUndefined();
    });

    test('EventContext 兼容传统 IEventContext 用法', () => {
        const ctx: EventContext = {
            event: 'user:login',
            data: { userId: '123' },
            source: 'UNKNOWN',
            timestamp: Date.now(),
            busId: 'bus-001',
            scopeId: 'NO_SCOPE',
        };

        // 传统 IEventContext 字段都存在
        expect(ctx.event).toBe('user:login');
        expect(ctx.data).toEqual({ userId: '123' });
        expect(ctx.source).toBe('UNKNOWN');
        expect(ctx.timestamp).toBeDefined();
        expect(ctx.busId).toBe('bus-001');
        expect(ctx.scopeId).toBe('NO_SCOPE');
    });

    test('EventContext 支持索引签名扩展', () => {
        const ctx: EventContext = {
            event: 'test',
            data: {},
            source: 'test',
            timestamp: Date.now(),
            busId: 'bus-001',
            scopeId: 'NO_SCOPE',
            customField: 'custom-value',
        };

        expect(ctx.customField).toBe('custom-value');
    });
});

describe('EventContextBuilder', () => {
    test('基本构建流程', () => {
        const ctx = EventContextBuilder
            .create()
            .withEvent('toolbar:add')
            .withType('add')
            .withSource('toolbar')
            .withSourceType('Toolbar')
            .withData({ key: 'add' })
            .withBusId('bus-001')
            .build();

        expect(ctx.event).toBe('toolbar:add');
        expect(ctx.type).toBe('add');
        expect(ctx.source).toBe('toolbar');
        expect(ctx.sourceType).toBe('Toolbar');
        expect(ctx.data).toEqual({ key: 'add' });
        expect(ctx.busId).toBe('bus-001');
        expect(ctx.scopeId).toBe('NO_SCOPE');
        expect(ctx.timestamp).toBeDefined();
    });

    test('带事件链构建', () => {
        const chain: EventChainLink[] = [
            { event: 'toolbar:add', type: 'add', source: 'toolbar', sourceType: 'Toolbar' },
        ];

        const ctx = EventContextBuilder
            .create()
            .withEvent('editDialog:dataChange')
            .withType('dataChange')
            .withSource('editDialog')
            .withSourceType('EditDialog')
            .withData({ action: 'create' })
            .withBusId('bus-001')
            .withChain(chain)
            .build();

        expect(ctx.chain).toEqual(chain);
    });

    test('带 DOM 事件构建', () => {
        const mockDomEvent = { type: 'click' } as Event;

        const ctx = EventContextBuilder
            .create()
            .withEvent('button:click')
            .withType('click')
            .withSource('button')
            .withSourceType('Button')
            .withData({})
            .withBusId('bus-001')
            .withDomEvent(mockDomEvent)
            .build();

        expect(ctx.domEvent).toBe(mockDomEvent);
    });

    test('带引用计数构建', () => {
        const ctx = EventContextBuilder
            .create()
            .withEvent('toolbar:add')
            .withType('add')
            .withSource('toolbar')
            .withSourceType('Toolbar')
            .withData({})
            .withBusId('bus-001')
            .withRefCount(3)
            .build();

        expect(ctx._refCount).toBe(3);
    });

    test('带元数据构建', () => {
        const ctx = EventContextBuilder
            .create()
            .withEvent('toolbar:add')
            .withType('add')
            .withSource('toolbar')
            .withSourceType('Toolbar')
            .withData({})
            .withBusId('bus-001')
            .withMetadata('traceId', 'abc-123')
            .build();

        expect(ctx.metadata!.traceId).toBe('abc-123');
    });

    test('缺少 event 字段时抛错', () => {
        expect(() => {
            EventContextBuilder
                .create()
                .withType('add')
                .withSource('toolbar')
                .withData({})
                .build();
        }).toThrow('EventContext is missing event name');
    });

    test('默认值自动填充', () => {
        const ctx = EventContextBuilder
            .create()
            .withEvent('test:event')
            .withData({})
            .build();

        expect(ctx.source).toBe('UNKNOWN');
        expect(ctx.busId).toBe('');
        expect(ctx.scopeId).toBe('NO_SCOPE');
        expect(ctx.timestamp).toBeDefined();
    });

    test('链式调用不互相覆盖', () => {
        const ctx = EventContextBuilder
            .create()
            .withEvent('userTable:selectionChange')
            .withType('selectionChange')
            .withSource('userTable')
            .withSourceType('UserTable')
            .withData({ selectedCount: 5 })
            .withBusId('bus-001')
            .withMetadata('key1', 'value1')
            .withMetadata('key2', 'value2')
            .build();

        expect(ctx.event).toBe('userTable:selectionChange');
        expect(ctx.type).toBe('selectionChange');
        expect(ctx.source).toBe('userTable');
        expect(ctx.data.selectedCount).toBe(5);
        expect(ctx.metadata!.key1).toBe('value1');
        expect(ctx.metadata!.key2).toBe('value2');
    });
});
