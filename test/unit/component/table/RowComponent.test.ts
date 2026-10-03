/**
 * RowComponent 单元测试
 *
 * 覆盖：初始化、cells 创建、数据更新、列重排、update 时序
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

import { RowComponent } from '@/component/table/row/RowComponent';
import type { ColumnMeta } from '@/component/table/column-types';

const SAMPLE_METAS: ColumnMeta[] = [
    { name: 'name', field: 'name', title: '姓名', cellType: 'text', align: 'left' },
    { name: 'age', field: 'age', title: '年龄', cellType: 'text', align: 'right' },
    { name: 'dept', field: 'dept', title: '部门', cellType: 'text', align: 'center' },
    { name: 'salary', field: 'salary', title: '薪资', cellType: 'text', align: 'right', format: 'currency' },
];

const REORDERED_METAS: ColumnMeta[] = [
    { name: 'salary', field: 'salary', title: '薪资', cellType: 'text', align: 'right', format: 'currency' },
    { name: 'name', field: 'name', title: '姓名', cellType: 'text', align: 'left' },
    { name: 'age', field: 'age', title: '年龄', cellType: 'text', align: 'right' },
    { name: 'dept', field: 'dept', title: '部门', cellType: 'text', align: 'center' },
];

const SAMPLE_DATA = { name: '张三', age: 28, dept: '技术部', salary: 15000 };

describe('RowComponent', () => {
    let row: RowComponent;
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (row && typeof row.dispose === 'function') {
            row.dispose();
        }
        container.remove();
    });

    describe('初始化', () => {
        it('onAfterInit 后应创建正确数量的 cells', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            expect(row._cells.size).toBe(4);
            expect(row.el.children.length).toBe(4);
        });

        it('每个 cell 应设置 CSS order 变量引用', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            for (const cell of row._cells.values()) {
                expect(cell.el.style.order).toMatch(/var\(--q-table-col-.*-order\)/);
            }
        });
    });

    describe('数据更新', () => {
        it('update 应更新 cell 数据', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            row.update({ data: { name: '李四', age: 35, dept: '市场部', salary: 22000 } });
            await Promise.resolve();

            const nameCell = row._cells.get('name');
            expect(nameCell.el.textContent).toContain('李四');
        });

        it('update 传入 columnMetas 应更新列元数据', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            row.update({ data: SAMPLE_DATA, columnMetas: REORDERED_METAS });
            await Promise.resolve();

            expect(row.getData('columnMetas')).toEqual(REORDERED_METAS);
        });

        it('update 仅传入 columnMetas（无 data）应更新列元数据并重建 cells', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            const originalCellEls = Array.from(row._cells.values()).map(c => c.el);
            row.update({ columnMetas: REORDERED_METAS });
            await Promise.resolve();

            expect(row.getData('columnMetas')).toEqual(REORDERED_METAS);
            expect(row._cells.size).toBe(4);

            const newCellKeys = Array.from(row._cells.keys());
            expect(newCellKeys).toEqual(['salary', 'name', 'age', 'dept']);
        });
    });

    describe('_createCells 幂等保护', () => {
        it('_createCells 重复调用不应产生重复 DOM 节点', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            expect(row.el.children.length).toBe(4);

            (row as any)._createCells();

            expect(row.el.children.length).toBe(4);
            expect(row._cells.size).toBe(4);
        });
    });

    describe('_rebuildCellsIfChanged — 列顺序变化检测', () => {
        it('列名不变但顺序变化时应重建 cells', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            const originalCells = Array.from(row._cells.values());
            row.setData('columnMetas', REORDERED_METAS, true);
            (row as any)._rebuildCellsIfChanged();

            const newCellKeys = Array.from(row._cells.keys());
            expect(newCellKeys).toEqual(['salary', 'name', 'age', 'dept']);
            expect(row.el.children.length).toBe(4);
        });

        it('列名变化时应重建 cells', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            const newMetas: ColumnMeta[] = [
                { name: 'name', field: 'name', title: '姓名', cellType: 'text', align: 'left' },
                { name: 'email', field: 'email', title: '邮箱', cellType: 'text', align: 'left' },
            ];
            row.setData('columnMetas', newMetas, true);
            (row as any)._rebuildCellsIfChanged();

            expect(row._cells.size).toBe(2);
            expect(row._cells.has('age')).toBe(false);
            expect(row._cells.has('email')).toBe(true);
        });

        it('重建 cells 时旧 DOM 节点应被移除', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            expect(row.el.children.length).toBe(4);

            const newMetas: ColumnMeta[] = [
                { name: 'name', field: 'name', title: '姓名', cellType: 'text', align: 'left' },
                { name: 'email', field: 'email', title: '邮箱', cellType: 'text', align: 'left' },
            ];
            row.setData('columnMetas', newMetas, true);
            (row as any)._rebuildCellsIfChanged();

            expect(row.el.children.length).toBe(2);
        });

        it('列名和顺序都不变时不应重建 cells', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            const originalCells = Array.from(row._cells.values());
            (row as any)._rebuildCellsIfChanged();

            const newCells = Array.from(row._cells.values());
            expect(newCells).toEqual(originalCells);
        });
    });

    describe('update 时序 — 竞态条件防护', () => {
        it('_createCells 幂等：已有 cells 时不再创建', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            const sizeBefore = row._cells.size;
            const childrenBefore = row.el.children.length;

            (row as any)._createCells();

            expect(row._cells.size).toBe(sizeBefore);
            expect(row.el.children.length).toBe(childrenBefore);
        });

        it('update 后 onAfterInit 的延迟 _doUpdate 不应导致重复', async () => {
            row = new RowComponent({ columnMetas: SAMPLE_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            row.update({ data: SAMPLE_DATA, columnMetas: SAMPLE_METAS });
            await new Promise(r => setTimeout(r, 50));

            expect(row._cells.size).toBe(4);
            expect(row.el.children.length).toBe(4);
        });
    });
});
