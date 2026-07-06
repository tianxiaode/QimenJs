/**
 * EventContext + EventContextBuilder 单元测试
 */

import { EventContext, EventChainLink, EventContextBuilder } from '@/events';

describe('EventContext', () => {
    test('EventContext 接口结构正确', () => {
        const chain: EventChainLink[] = [
            { event: 'toolbar:add', type: 'add', source: 'toolbar', sourceType: 'Toolbar' },
        ];

        const ctx: EventContext = {
            // BaseContext 字段
            steps: [],
            metadata: {},
            // EventContext 专用字段
            event: 'userTable:selectionChange',
            type: 'selectionChange',
            source: 'userTable',
            sourceType: 'UserTable',
            data: { rows: [], selectedCount: 0 },
            chain,
            _refCount: 2,
        };

        expect(ctx.event).toBe('userTable:selectionChange');
        expect(ctx.type).toBe('selectionChange');
        expect(ctx.source).toBe('userTable');
        expect(ctx.sourceType).toBe('UserTable');
        expect(ctx.data).toEqual({ rows: [], selectedCount: 0 });
        expect(ctx.chain).toEqual(chain);
        expect(ctx._refCount).toBe(2);
        expect(ctx.steps).toEqual([]);
        expect(ctx.metadata).toEqual({});
    });

    test('EventContext 可选字段', () => {
        const ctx: EventContext = {
            steps: [],
            metadata: {},
            event: 'click',
            type: 'click',
            source: '',
            sourceType: 'Button',
            data: null,
        };

        expect(ctx.domEvent).toBeUndefined();
        expect(ctx.chain).toBeUndefined();
        expect(ctx._refCount).toBeUndefined();
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
            .build();

        expect(ctx.event).toBe('toolbar:add');
        expect(ctx.type).toBe('add');
        expect(ctx.source).toBe('toolbar');
        expect(ctx.sourceType).toBe('Toolbar');
        expect(ctx.data).toEqual({ key: 'add' });
        expect(ctx.steps).toEqual([]);
        expect(ctx.metadata).toEqual({});
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
            .withMetadata('traceId', 'abc-123')
            .build();

        expect(ctx.metadata.traceId).toBe('abc-123');
    });

    test('缺少 event 字段时抛错', () => {
        expect(() => {
            EventContextBuilder
                .create()
                .withType('add')
                .withSource('toolbar')
                .withSourceType('Toolbar')
                .withData({})
                .build();
        }).toThrow('EventContext is missing event name');
    });

    test('缺少 type 字段时抛错', () => {
        expect(() => {
            EventContextBuilder
                .create()
                .withEvent('toolbar:add')
                .withSource('toolbar')
                .withSourceType('Toolbar')
                .withData({})
                .build();
        }).toThrow('EventContext is missing event type');
    });

    test('链式调用不互相覆盖', () => {
        const ctx = EventContextBuilder
            .create()
            .withEvent('userTable:selectionChange')
            .withType('selectionChange')
            .withSource('userTable')
            .withSourceType('UserTable')
            .withData({ selectedCount: 5 })
            .withMetadata('key1', 'value1')
            .withMetadata('key2', 'value2')
            .build();

        expect(ctx.event).toBe('userTable:selectionChange');
        expect(ctx.type).toBe('selectionChange');
        expect(ctx.source).toBe('userTable');
        expect(ctx.data.selectedCount).toBe(5);
        expect(ctx.metadata.key1).toBe('value1');
        expect(ctx.metadata.key2).toBe('value2');
    });
});
