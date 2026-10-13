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

import { TableComponent } from '@/component/table/TableComponent';
import { GROUP_SUMMARY_ROW_TYPE } from '@/component/table/constants';

describe('TableComponent._buildItems virtual scroll', () => {
    let instance: any;
    let mockData: Record<string, any>;

    beforeEach(() => {
        mockData = {
            virtualScroll: false,
            selectDisabled: null,
        };

        instance = {
            getData: jest.fn((key: string) => mockData[key]),
            _buildGroupSummary: jest.fn((group: any) => ({ dept: group.groupKey })),
            _aggregate: jest.fn(() => 0),
        };

        Object.setPrototypeOf(instance, TableComponent.prototype);
    });

    const groupedData = [
        { groupKey: '技术部', groupItems: [
            { id: 1, name: '张三', dept: '技术部' },
            { id: 2, name: '赵六', dept: '技术部' },
        ]},
        { groupKey: '市场部', groupItems: [
            { id: 3, name: '李四', dept: '市场部' },
        ]},
    ];

    const flatData = [
        { id: 1, name: '张三', dept: '技术部' },
        { id: 2, name: '赵六', dept: '技术部' },
        { id: 3, name: '李四', dept: '市场部' },
    ];

    it('should insert group summary rows when virtualScroll is off', () => {
        mockData.virtualScroll = false;
        const metas: any[] = [];

        const items = instance._buildItems(groupedData, metas);

        expect(items).toHaveLength(5);
        expect(items[0].type).toBe(GROUP_SUMMARY_ROW_TYPE);
        expect(items[0]._groupKey).toBe('技术部');
        expect(items[1].data.name).toBe('张三');
        expect(items[1]._groupKey).toBe('技术部');
        expect(items[3].type).toBe(GROUP_SUMMARY_ROW_TYPE);
        expect(items[3]._groupKey).toBe('市场部');
    });

    it('should NOT insert group summary rows when virtualScroll is on', () => {
        mockData.virtualScroll = true;
        const metas: any[] = [];

        const items = instance._buildItems(groupedData, metas);

        expect(items).toHaveLength(3);
        for (const item of items) {
            expect(item.type).not.toBe(GROUP_SUMMARY_ROW_TYPE);
        }
        expect(items[0].data.name).toBe('张三');
        expect(items[1].data.name).toBe('赵六');
        expect(items[2].data.name).toBe('李四');
    });

    it('should not set _groupKey on items when virtualScroll is on', () => {
        mockData.virtualScroll = true;
        const metas: any[] = [];

        const items = instance._buildItems(groupedData, metas);

        for (const item of items) {
            expect(item._groupKey).toBeUndefined();
        }
    });

    it('should handle flat data normally when virtualScroll is on', () => {
        mockData.virtualScroll = true;
        const metas: any[] = [];

        const items = instance._buildItems(flatData, metas);

        expect(items).toHaveLength(3);
        expect(items[0].data.name).toBe('张三');
        expect(items[2].data.name).toBe('李四');
    });

    it('should handle flat data normally when virtualScroll is off', () => {
        mockData.virtualScroll = false;
        const metas: any[] = [];

        const items = instance._buildItems(flatData, metas);

        expect(items).toHaveLength(3);
        for (const item of items) {
            expect(item.type).not.toBe(GROUP_SUMMARY_ROW_TYPE);
        }
    });

    it('should preserve rowNumber sequence across groups when virtualScroll is on', () => {
        mockData.virtualScroll = true;
        const metas: any[] = [];

        const items = instance._buildItems(groupedData, metas);

        expect(items[0].data._rowNumber).toBe(1);
        expect(items[1].data._rowNumber).toBe(2);
        expect(items[2].data._rowNumber).toBe(3);
    });
});
