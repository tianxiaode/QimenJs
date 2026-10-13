/**
 * 虚拟滚动单元测试
 *
 * 验证 ItemGroupPooledComponent 的虚拟滚动核心逻辑：
 * - _computeVisibleRange: 可视区域计算
 * - _getVirtualItemHeight: 行高获取
 * - _updateSpacers: 占位元素高度
 * - setItems 虚拟滚动模式: 只渲染可见行
 * - count getter: 返回完整数据量
 * - add/insert/removeAt/clear 虚拟滚动模式
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
            })),
        },
    };
});

jest.mock('@qimenjs/task', () => ({
    globalTaskQueue: {
        addTask: jest.fn((fn: () => any) => fn()),
    },
}));

import { ItemGroupPooledComponent } from '@/component/itemgroup/ItemGroupPooledComponent';

describe('VirtualScroll', () => {
    let instance: any;
    let mockData: Record<string, any>;
    let scrollContainer: HTMLElement;
    let itemContainer: HTMLElement;
    let topSpacer: HTMLElement;
    let bottomSpacer: HTMLElement;

    beforeEach(() => {
        scrollContainer = document.createElement('div');
        itemContainer = document.createElement('div');
        topSpacer = document.createElement('div');
        bottomSpacer = document.createElement('div');

        scrollContainer.appendChild(topSpacer);
        scrollContainer.appendChild(itemContainer);
        scrollContainer.appendChild(bottomSpacer);

        document.body.appendChild(scrollContainer);

        mockData = {
            virtualScroll: true,
            itemHeight: 36,
            virtualBuffer: 5,
            items: [],
        };

        instance = {
            _virtualData: [],
            _visibleRange: { start: 0, end: 0 },
            _virtualItemMap: new Map(),
            _hiddenItems: [],
            _scrollUnbind: null,
            _scrollOff: null,
            _rafId: 0,
            _resizeObserver: null,
            _topSpacerEl: topSpacer,
            _bottomSpacerEl: bottomSpacer,
            step: 100,
            el: scrollContainer,
            getData: jest.fn((key: string) => mockData[key]),
            setData: jest.fn((key: string, value: any, raw?: boolean) => {
                mockData[key] = value;
            }),
            getNodeEl: jest.fn((name: string) => {
                if (name === 'itemContainer') return itemContainer;
                return undefined;
            }),
            bind: jest.fn(() => jest.fn()),
            on: jest.fn(() => jest.fn()),
            onCleanup: jest.fn(),
            _reuseFromPool: jest.fn(() => null),
            _createItem: jest.fn((data: any) => {
                const el = document.createElement('div');
                el.className = 'q-table-row';
                itemContainer.appendChild(el);
                return {
                    el,
                    hidden: false,
                    update: jest.fn(),
                    order: 0,
                    _virtualIndex: undefined,
                };
            }),
            _emitItemsChange: jest.fn(),
            _applyVirtualOrders: jest.fn(),
        };

        Object.setPrototypeOf(instance, ItemGroupPooledComponent.prototype);
    });

    afterEach(() => {
        scrollContainer.remove();
    });

    describe('_computeVisibleRange', () => {
        it('should compute visible range based on scrollTop and clientHeight', () => {
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 360, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = new Array(100);

            const range = instance._computeVisibleRange();

            expect(range.start).toBe(5);
            expect(range.end).toBe(21);
        });

        it('should clamp start to 0 when scrollTop is small', () => {
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = new Array(100);

            const range = instance._computeVisibleRange();

            expect(range.start).toBe(0);
            expect(range.end).toBe(11);
        });

        it('should clamp end to total when near bottom', () => {
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 3500, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = new Array(100);

            const range = instance._computeVisibleRange();

            expect(range.start).toBe(92);
            expect(range.end).toBe(100);
        });

        it('should handle empty data', () => {
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = [];

            const range = instance._computeVisibleRange();

            expect(range.start).toBe(0);
            expect(range.end).toBe(0);
        });

        it('should respect virtualBuffer option', () => {
            mockData.virtualBuffer = 10;

            Object.defineProperty(scrollContainer, 'scrollTop', { value: 360, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = new Array(100);

            const range = instance._computeVisibleRange();

            expect(range.start).toBe(0);
            expect(range.end).toBe(26);
        });
    });

    describe('_getVirtualItemHeight', () => {
        it('should return itemHeight from option when set', () => {
            instance.getData = jest.fn((key: string) => {
                const data: Record<string, any> = {
                    virtualScroll: true,
                    itemHeight: 50,
                    virtualBuffer: 5,
                };
                return data[key];
            });

            expect(instance._getVirtualItemHeight()).toBe(50);
        });

        it('should fall back to 36 when itemHeight is 0', () => {
            mockData.itemHeight = 0;
            mockData.items = [];

            expect(instance._getVirtualItemHeight()).toBe(36);
        });

        it('should measure from existing items when itemHeight is 0', () => {
            mockData.itemHeight = 0;

            const mockEl = document.createElement('div');
            Object.defineProperty(mockEl, 'getBoundingClientRect', {
                value: () => ({ height: 42, width: 100, top: 0, left: 0, right: 100, bottom: 42 }),
                configurable: true,
            });

            mockData.items = [{ el: mockEl }];

            expect(instance._getVirtualItemHeight()).toBe(42);
        });
    });

    describe('_updateSpacers', () => {
        it('should set top spacer height based on start index', () => {
            mockData.itemHeight = 36;

            instance._updateSpacers(10, 20, 100);

            expect(topSpacer.style.height).toBe('360px');
        });

        it('should set bottom spacer height based on remaining items', () => {
            mockData.itemHeight = 36;

            instance._updateSpacers(10, 20, 100);

            expect(bottomSpacer.style.height).toBe('2880px');
        });

        it('should handle zero remaining items', () => {
            mockData.itemHeight = 36;

            instance._updateSpacers(0, 100, 100);

            expect(bottomSpacer.style.height).toBe('0px');
        });
    });

    describe('_renderVirtualItems', () => {
        it('should only render items within visible range', () => {
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `user${i}` }));

            instance._renderVirtualItems();

            expect(instance.items.length).toBe(11);
            expect(instance._createItem).toHaveBeenCalledTimes(11);
        });

        it('should reuse existing items that remain visible', () => {
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `user${i}` }));

            instance._renderVirtualItems();

            const firstRenderCount = instance._createItem.mock.calls.length;

            Object.defineProperty(scrollContainer, 'scrollTop', { value: 36, configurable: true });

            instance._renderVirtualItems();

            expect(instance._createItem.mock.calls.length).toBe(firstRenderCount + 1);
        });

        it('should return non-visible items to pool', () => {
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `user${i}` }));

            instance._renderVirtualItems();

            const initialItems = [...instance.items];

            Object.defineProperty(scrollContainer, 'scrollTop', { value: 720, configurable: true });

            instance._renderVirtualItems();

            for (const item of initialItems) {
                if (item._virtualIndex < 15 || item._virtualIndex >= 30) {
                    expect(item.hidden).toBe(true);
                }
            }
        });

        it('should set _virtualIndex on each rendered item', () => {
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `user${i}` }));

            instance._renderVirtualItems();

            for (let i = 0; i < instance.items.length; i++) {
                expect(instance.items[i]._virtualIndex).toBe(i);
            }
        });

        it('should clear all items when data is empty', () => {
            instance._virtualData = [];
            instance.items = [{ hidden: false, el: document.createElement('div') }];

            instance._renderVirtualItems();

            expect(instance.items.length).toBe(0);
            expect(instance._hiddenItems.length).toBe(1);
        });

        it('should update spacers based on visible range', () => {
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 360, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = Array.from({ length: 100 }, (_, i) => ({ id: i }));

            instance._renderVirtualItems();

            expect(topSpacer.style.height).toBe('180px');
        });
    });

    describe('count getter', () => {
        it('should return _virtualData length when virtualScroll is on', () => {
            instance._virtualData = new Array(1000);
            expect(instance.count).toBe(1000);
        });

        it('should return items length when virtualScroll is off', () => {
            mockData.virtualScroll = false;
            mockData.items = new Array(5);
            expect(instance.count).toBe(5);
        });
    });

    describe('setItems (virtual scroll mode)', () => {
        it('should store data in _virtualData and not render when not set up', () => {
            instance._scrollUnbind = null;

            const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));
            instance.setItems(data);

            expect(instance._virtualData).toHaveLength(100);
            expect(instance._createItem).not.toHaveBeenCalled();
        });

        it('should store data and render when set up', () => {
            instance._scrollUnbind = jest.fn();
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));
            instance.setItems(data);

            expect(instance._virtualData).toHaveLength(100);
            expect(instance._createItem).toHaveBeenCalled();
        });
    });

    describe('add (virtual scroll mode)', () => {
        it('should push to _virtualData and re-render', () => {
            instance._scrollUnbind = jest.fn();
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = Array.from({ length: 10 }, (_, i) => ({ id: i }));

            instance.add({ id: 10 });

            expect(instance._virtualData).toHaveLength(11);
        });
    });

    describe('insert (virtual scroll mode)', () => {
        it('should insert into _virtualData at specified index', () => {
            instance._scrollUnbind = jest.fn();
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = [{ id: 0 }, { id: 1 }, { id: 2 }];

            instance.insert(1, { id: 99 });

            expect(instance._virtualData).toHaveLength(4);
            expect(instance._virtualData[1].id).toBe(99);
        });

        it('should clamp index to valid range', () => {
            instance._scrollUnbind = jest.fn();
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = [{ id: 0 }];

            instance.insert(10, { id: 99 });

            expect(instance._virtualData).toHaveLength(2);
            expect(instance._virtualData[1].id).toBe(99);
        });
    });

    describe('removeAt (virtual scroll mode)', () => {
        it('should remove from _virtualData and return removed data', () => {
            instance._scrollUnbind = jest.fn();
            Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(scrollContainer, 'clientHeight', { value: 200, configurable: true });

            instance._virtualData = [{ id: 0 }, { id: 1 }, { id: 2 }];

            const removed = instance.removeAt(1);

            expect(removed.id).toBe(1);
            expect(instance._virtualData).toHaveLength(2);
        });

        it('should return undefined for invalid index', () => {
            instance._virtualData = [{ id: 0 }];

            const removed = instance.removeAt(5);

            expect(removed).toBeUndefined();
        });
    });

    describe('clear (virtual scroll mode)', () => {
        it('should clear _virtualData and return items to pool', () => {
            instance._virtualData = [{ id: 0 }, { id: 1 }];
            instance.items = [
                { hidden: false, el: document.createElement('div') },
                { hidden: false, el: document.createElement('div') },
            ];

            instance.clear();

            expect(instance._virtualData).toHaveLength(0);
            expect(instance.items.length).toBe(0);
            expect(instance._hiddenItems.length).toBe(2);
        });

        it('should reset spacers to zero', () => {
            instance._virtualData = [];
            instance.items = [];

            instance.clear();

            expect(topSpacer.style.height).toBe('0px');
            expect(bottomSpacer.style.height).toBe('0px');
        });
    });
});
