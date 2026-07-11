/**
 * EventBridgeAbility 补充 单元测试
 *
 * 覆盖：initEventBridge 各桥接类型、_bridgeOn、__initProps、normalizeBridgeConfig 边界
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
import { EventBridgeAbility } from '@/component-core/abilities/EventBridgeAbility';
import { ComponentManager } from '@/component-core/ComponentManager';

const TPL = '<div class="box"><span data-content="box:label"></span></div>';

describe('EventBridgeAbility 补充', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(EventBridgeAbility);

    describe('initEventBridge — selection 桥接', () => {
        it('selection 配置 → 绑定事件', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({ selection: { source: 'grid1' } });
            expect(() => instance.initEventBridge()).not.toThrow();
        });

        it('selection enabled=false → 跳过', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({ selection: { source: 'grid1', enabled: false } });
            expect(() => instance.initEventBridge()).not.toThrow();
        });
    });

    describe('initEventBridge — search 桥接', () => {
        it('search 配置 → 绑定事件', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({ search: { source: 'search1' } });
            expect(() => instance.initEventBridge()).not.toThrow();
        });

        it('search enabled=false → 跳过', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({ search: { source: 'search1', enabled: false } });
            expect(() => instance.initEventBridge()).not.toThrow();
        });
    });

    describe('initEventBridge — crud 桥接 with actions', () => {
        it('crud 配置指定 actions', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({ crud: { source: 'toolbar1', actions: ['create', 'delete'] } });
            expect(() => instance.initEventBridge()).not.toThrow();
        });

        it('crud 配置 enabled=false → 跳过', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({ crud: { source: 'toolbar1', enabled: false } });
            expect(() => instance.initEventBridge()).not.toThrow();
        });
    });

    describe('initEventBridge — 自定义桥接', () => {
        it('自定义桥接 with event + handler', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({
                myCustom: { source: 'src1', event: 'customEvent', handler: 'onCustomEvent' },
            });
            expect(() => instance.initEventBridge()).not.toThrow();
        });

        it('自定义桥接 enabled=false → 跳过', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({
                myCustom: { source: 'src1', enabled: false },
            });
            expect(() => instance.initEventBridge()).not.toThrow();
        });

        it('自定义桥接无 event → 用 key 名', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({
                myEvent: { source: 'src1' },
            });
            expect(() => instance.initEventBridge()).not.toThrow();
        });
    });

    describe('normalizeBridgeConfig 边界', () => {
        it('null → 返回 null', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({ pagination: null });
            expect(() => instance.initEventBridge()).not.toThrow();
        });

        it('空对象 → 返回 null', () => {
            const instance = new BoxClass() as any;
            instance.setEventBridge({ pagination: {} });
            expect(() => instance.initEventBridge()).not.toThrow();
        });
    });

    describe('_bridgeOn — source 存在', () => {
        it('source 组件有 on 方法 → 注册监听', () => {
            const instance = new BoxClass() as any;
            const mockSource = {
                on: jest.fn(() => jest.fn()),
            };
            const mgr = ComponentManager.getInstance();
            const origGet = mgr.get.bind(mgr);
            mgr.get = jest.fn().mockReturnValue(mockSource);

            instance._bridgeOn('source1', 'click', jest.fn(), mgr);
            expect(mockSource.on).toHaveBeenCalledWith('click', expect.any(Function));

            mgr.get = origGet;
        });

        it('source 组件 on 返回非函数 → 不注册 cleanup', () => {
            const instance = new BoxClass() as any;
            const mockSource = {
                on: jest.fn(() => 'not-a-function'),
            };
            const mgr = ComponentManager.getInstance();
            const origGet = mgr.get.bind(mgr);
            mgr.get = jest.fn().mockReturnValue(mockSource);

            expect(() => instance._bridgeOn('source1', 'click', jest.fn(), mgr)).not.toThrow();

            mgr.get = origGet;
        });
    });

    describe('initEventBridge — 回调触发', () => {
        it('pagination 回调 → onPageChange', () => {
            const instance = new BoxClass() as any;
            instance.onPageChange = jest.fn();

            // 创建模拟源组件
            const mockSource = { on: jest.fn() };
            const offFn = jest.fn();
            mockSource.on.mockImplementation((event: string, handler: Function) => {
                // 立即触发回调
                if (event === 'pagechange') handler({ page: 1 });
                return offFn;
            });

            const mgr = ComponentManager.getInstance();
            const origGet = mgr.get.bind(mgr);
            mgr.get = jest.fn().mockReturnValue(mockSource);

            instance.setEventBridge({ pagination: { source: 'pager1' } });
            instance.initEventBridge();

            expect(instance.onPageChange).toHaveBeenCalled();

            mgr.get = origGet;
        });

        it('crud 回调 → onCreate', () => {
            const instance = new BoxClass() as any;
            instance.onCreate = jest.fn();

            const mockSource = { on: jest.fn() };
            mockSource.on.mockImplementation((event: string, handler: Function) => {
                if (event === 'crudaction') handler({ action: 'create' });
                return jest.fn();
            });

            const mgr = ComponentManager.getInstance();
            const origGet = mgr.get.bind(mgr);
            mgr.get = jest.fn().mockReturnValue(mockSource);

            instance.setEventBridge({ crud: { source: 'crud1' } });
            instance.initEventBridge();

            expect(instance.onCreate).toHaveBeenCalled();

            mgr.get = origGet;
        });

        it('crud 回调 with actions 过滤', () => {
            const instance = new BoxClass() as any;
            instance.onCreate = jest.fn();
            instance.onDelete = jest.fn();

            const mockSource = { on: jest.fn() };
            mockSource.on.mockImplementation((event: string, handler: Function) => {
                if (event === 'crudaction') {
                    handler({ action: 'create' });
                    handler({ action: 'delete' });
                }
                return jest.fn();
            });

            const mgr = ComponentManager.getInstance();
            const origGet = mgr.get.bind(mgr);
            mgr.get = jest.fn().mockReturnValue(mockSource);

            instance.setEventBridge({ crud: { source: 'crud1', actions: ['create'] } });
            instance.initEventBridge();

            expect(instance.onCreate).toHaveBeenCalled();
            expect(instance.onDelete).not.toHaveBeenCalled();

            mgr.get = origGet;
        });

        it('selection 回调 → onSelectionChange', () => {
            const instance = new BoxClass() as any;
            instance.onSelectionChange = jest.fn();

            const mockSource = { on: jest.fn() };
            mockSource.on.mockImplementation((event: string, handler: Function) => {
                if (event === 'selectionchange') handler({ selected: [1, 2] });
                return jest.fn();
            });

            const mgr = ComponentManager.getInstance();
            const origGet = mgr.get.bind(mgr);
            mgr.get = jest.fn().mockReturnValue(mockSource);

            instance.setEventBridge({ selection: { source: 'grid1' } });
            instance.initEventBridge();

            expect(instance.onSelectionChange).toHaveBeenCalled();

            mgr.get = origGet;
        });

        it('search 回调 → onSearchChange', () => {
            const instance = new BoxClass() as any;
            instance.onSearchChange = jest.fn();

            const mockSource = { on: jest.fn() };
            mockSource.on.mockImplementation((event: string, handler: Function) => {
                if (event === 'searchchange') handler({ keyword: 'test' });
                return jest.fn();
            });

            const mgr = ComponentManager.getInstance();
            const origGet = mgr.get.bind(mgr);
            mgr.get = jest.fn().mockReturnValue(mockSource);

            instance.setEventBridge({ search: { source: 'search1' } });
            instance.initEventBridge();

            expect(instance.onSearchChange).toHaveBeenCalled();

            mgr.get = origGet;
        });

        it('自定义桥接回调', () => {
            const instance = new BoxClass() as any;
            instance.onMyCustom = jest.fn();

            const mockSource = { on: jest.fn() };
            mockSource.on.mockImplementation((event: string, handler: Function) => {
                if (event === 'myCustom') handler({ data: 'test' });
                return jest.fn();
            });

            const mgr = ComponentManager.getInstance();
            const origGet = mgr.get.bind(mgr);
            mgr.get = jest.fn().mockReturnValue(mockSource);

            instance.setEventBridge({ myCustom: { source: 'src1' } });
            instance.initEventBridge();

            expect(instance.onMyCustom).toHaveBeenCalled();

            mgr.get = origGet;
        });
    });

    describe('__initProps', () => {
        it('props 有 eventBridge → 通过 initAbilitiesFromProps 设置', () => {
            const { initAbilitiesFromProps } = require('@/component-core/abilities/PropAlias');
            const instance = new BoxClass() as any;
            initAbilitiesFromProps(instance, [EventBridgeAbility], { eventBridge: { pagination: { source: 'pager1' } } });
            expect(instance.getEventBridge()).toEqual({ pagination: { source: 'pager1' } });
        });

        it('props 无 eventBridge → 不操作', () => {
            const { initAbilitiesFromProps } = require('@/component-core/abilities/PropAlias');
            const instance = new BoxClass() as any;
            expect(() => initAbilitiesFromProps(instance, [EventBridgeAbility], {})).not.toThrow();
        });
    });
});
