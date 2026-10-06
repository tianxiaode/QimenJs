/**
 * TableHeaderComponent 分组列头标题测试
 *
 * 验证分组列头子单元格标题是否正确显示，
 * 覆盖首次渲染、二次刷新、selectable 变化等场景
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

import { TableHeaderComponent } from '@/component/table/header/TableHeaderComponent';
import type { ColumnDefOrGroup } from '@/component/table/column-types';

const COMPREHENSIVE_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120, sortable: true, draggable: true },
    {
        name: 'baseInfo',
        title: '基本信息',
        children: [
            { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', sortable: true, draggable: true },
            { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center', sortable: true, groupable: true, draggable: true },
        ],
    },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', sortable: true, draggable: true },
];

describe('TableHeaderComponent 分组列头标题', () => {
    let header: TableHeaderComponent;
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (header && typeof header.dispose === 'function') {
            header.dispose();
        }
        container.remove();
    });

    it('首次渲染：分组列头子单元格标题应正确显示', async () => {
        header = new TableHeaderComponent({
            columns: COMPREHENSIVE_COLUMNS,
            selectable: 'none',
            eventKey: 'test-evt',
        });
        container.appendChild(header.el);

        await header.ready;
        await new Promise(r => setTimeout(r, 100));

        const items = header.items;
        expect(items.length).toBe(3);

        const groupItem = items[1];
        expect(groupItem.type).toBe('group-header-cell');
        expect(groupItem._childCells.length).toBe(2);

        const ageCell = groupItem._childCells[0].component;
        const deptCell = groupItem._childCells[1].component;

        expect(ageCell.colName).toBe('age');
        expect(deptCell.colName).toBe('dept');
        expect(ageCell.getNodeEl('title')?.textContent).toBe('年龄');
        expect(deptCell.getNodeEl('title')?.textContent).toBe('部门');
    });

    it('二次刷新（update 路径）：分组列头子单元格标题应正确显示', async () => {
        header = new TableHeaderComponent({
            columns: COMPREHENSIVE_COLUMNS,
            selectable: 'none',
            eventKey: 'test-evt',
        });
        container.appendChild(header.el);

        await header.ready;
        await new Promise(r => setTimeout(r, 100));

        header._refreshItems();
        await new Promise(r => setTimeout(r, 100));

        const items = header.items;
        const groupItem = items[1];
        expect(groupItem.type).toBe('group-header-cell');
        expect(groupItem._childCells.length).toBe(2);

        const ageCell = groupItem._childCells[0].component;
        const deptCell = groupItem._childCells[1].component;

        expect(ageCell.colName).toBe('age');
        expect(deptCell.colName).toBe('dept');
        expect(ageCell.getNodeEl('title')?.textContent).toBe('年龄');
        expect(deptCell.getNodeEl('title')?.textContent).toBe('部门');
    });

    it('selectable 变化触发刷新：分组列头子单元格标题应正确显示', async () => {
        header = new TableHeaderComponent({
            columns: COMPREHENSIVE_COLUMNS,
            selectable: 'none',
            eventKey: 'test-evt',
        });
        container.appendChild(header.el);

        await header.ready;
        await new Promise(r => setTimeout(r, 100));

        header.setData('selectable', 'multiple');
        await new Promise(r => setTimeout(r, 100));

        const items = header.items;
        const groupItem = items[1];
        expect(groupItem.type).toBe('group-header-cell');
        expect(groupItem._childCells.length).toBe(2);

        const ageCell = groupItem._childCells[0].component;
        const deptCell = groupItem._childCells[1].component;

        expect(ageCell.colName).toBe('age');
        expect(deptCell.colName).toBe('dept');
        expect(ageCell.getNodeEl('title')?.textContent).toBe('年龄');
        expect(deptCell.getNodeEl('title')?.textContent).toBe('部门');
    });

    it('_childCells 不应重复累积（防止 _adoptChildCells 被多次调用）', async () => {
        header = new TableHeaderComponent({
            columns: COMPREHENSIVE_COLUMNS,
            selectable: 'none',
            eventKey: 'test-evt',
        });
        container.appendChild(header.el);

        await header.ready;
        await new Promise(r => setTimeout(r, 100));

        const groupItem = header.items[1];
        const initialCount = groupItem._childCells.length;
        expect(initialCount).toBe(2);

        header._refreshItems();
        await new Promise(r => setTimeout(r, 100));

        const groupItemAfter = header.items[1];
        expect(groupItemAfter._childCells.length).toBe(2);
    });
});
