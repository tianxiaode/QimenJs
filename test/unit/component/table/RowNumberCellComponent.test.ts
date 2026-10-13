/**
 * RowNumberCellComponent 单元测试
 *
 * 验证行号列单元格的 order/width/minWidth inline style 是否正确应用
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
import { RowNumberCellComponent } from '@/component/table/cells/RowNumberCellComponent';
import { CheckboxCellComponent } from '@/component/table/cells/CheckboxCellComponent';
import type { ColumnMeta } from '@/component/table/column-types';

const ROWNUMBER_METAS: ColumnMeta[] = [
    { name: '#', field: '#', title: '', cellType: 'rownumber', align: 'center', width: 'auto' },
    { name: 'name', field: 'name', title: '姓名', cellType: 'text', align: 'left', width: '100px' },
];

const CHECKBOX_METAS: ColumnMeta[] = [
    { name: 'check', field: 'check', title: '', cellType: 'checkbox', align: 'center', width: '40px', selection: true },
    { name: 'name', field: 'name', title: '姓名', cellType: 'text', align: 'left', width: '100px' },
];

const SAMPLE_DATA = { name: '张三', _rowNumber: 1 };

describe('RowNumberCellComponent', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    describe('直接实例化', () => {
        it('应正确应用 order inline style', async () => {
            const cell = new RowNumberCellComponent({
                align: 'center',
                colName: '#',
                order: 'var(--q-table-col-#-order)',
                width: 'var(--q-table-col-#-width)',
                minWidth: '0',
            });
            container.appendChild(cell.el);

            await cell.ready;
            await new Promise(r => setTimeout(r, 50));

            expect(cell.el.style.order).toBe('var(--q-table-col-#-order)');
        });

        it('应正确应用 width inline style', async () => {
            const cell = new RowNumberCellComponent({
                align: 'center',
                colName: '#',
                order: 'var(--q-table-col-#-order)',
                width: 'var(--q-table-col-#-width)',
                minWidth: '0',
            });
            container.appendChild(cell.el);

            await cell.ready;
            await new Promise(r => setTimeout(r, 50));

            expect(cell.el.style.width).toBe('var(--q-table-col-#-width)');
        });

        it('应正确应用 minWidth inline style', async () => {
            const cell = new RowNumberCellComponent({
                align: 'center',
                colName: '#',
                order: 'var(--q-table-col-#-order)',
                width: 'var(--q-table-col-#-width)',
                minWidth: '0',
            });
            container.appendChild(cell.el);

            await cell.ready;
            await new Promise(r => setTimeout(r, 50));

            expect(cell.el.style.minWidth).toBe('0');
        });

        it('应正确应用 minWidth inline style', async () => {
            const cell = new RowNumberCellComponent({
                align: 'center',
                colName: '#',
                order: 'var(--q-table-col-#-order)',
                width: 'var(--q-table-col-#-width)',
                minWidth: '0',
            });
            container.appendChild(cell.el);

            await cell.ready;
            await new Promise(r => setTimeout(r, 50));

            expect(cell.el.style.minWidth).toBe('0');
        });
    });

    describe('通过 RowComponent 创建', () => {
        it('rownumber cell 应有 order inline style', async () => {
            const row = new RowComponent({ columnMetas: ROWNUMBER_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            const cell = row._cells.get('#');
            expect(cell).toBeDefined();
            expect(cell.el.style.order).toBe('var(--q-table-col-#-order)');
        });

        it('rownumber cell 应有 width inline style', async () => {
            const row = new RowComponent({ columnMetas: ROWNUMBER_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            const cell = row._cells.get('#');
            expect(cell).toBeDefined();
            expect(cell.el.style.width).toBe('var(--q-table-col-#-width)');
        });

        it('rownumber cell 应有 minWidth inline style', async () => {
            const row = new RowComponent({ columnMetas: ROWNUMBER_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            const cell = row._cells.get('#');
            expect(cell).toBeDefined();
            expect(cell.el.style.minWidth).toBe('0');
        });
    });

    describe('对比 CheckboxCellComponent', () => {
        it('checkbox cell 应有 order inline style', async () => {
            const row = new RowComponent({ columnMetas: CHECKBOX_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            const cell = row._cells.get('check');
            expect(cell).toBeDefined();
            expect(cell.el.style.order).toBe('var(--q-table-col-check-order)');
        });

        it('checkbox cell 应有 width inline style', async () => {
            const row = new RowComponent({ columnMetas: CHECKBOX_METAS, data: SAMPLE_DATA });
            container.appendChild(row.el);

            await row.ready;
            await new Promise(r => setTimeout(r, 50));

            const cell = row._cells.get('check');
            expect(cell).toBeDefined();
            expect(cell.el.style.width).toBe('var(--q-table-col-check-width)');
        });
    });
});
