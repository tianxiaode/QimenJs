/**
 * GroupHeaderCellComponent 单元测试
 *
 * 重点测试：分组列头子单元格标题显示是否正确
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

import { HeaderCellComponent } from '@/component/table/header/HeaderCellComponent';
import { GroupHeaderCellComponent } from '@/component/table/header/GroupHeaderCellComponent';

describe('GroupHeaderCellComponent', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    describe('子单元格标题显示', () => {
        it('adoptChildCells 后每个子单元格应有正确的标题', async () => {
            const ageCell = new HeaderCellComponent({
                colName: 'age',
                title: '年龄',
                align: 'center',
                minWidth: 80,
                action: 'age',
            });
            const deptCell = new HeaderCellComponent({
                colName: 'dept',
                title: '部门',
                align: 'center',
                minWidth: 120,
                action: 'dept',
            });

            const groupCell = new GroupHeaderCellComponent({
                colName: 'baseInfo',
                title: '基本信息',
                action: 'baseInfo',
                align: 'center',
                minWidth: 50,
                childNames: ['age', 'dept'],
                childCells: [ageCell, deptCell],
            });
            container.appendChild(groupCell.el);

            await groupCell.ready;
            await new Promise(r => setTimeout(r, 50));

            expect(ageCell.getNodeEl('title')?.textContent).toBe('年龄');
            expect(deptCell.getNodeEl('title')?.textContent).toBe('部门');
        });

        it('createChildren 后每个子单元格应有正确的标题', async () => {
            const groupCell = new GroupHeaderCellComponent({
                colName: 'baseInfo',
                title: '基本信息',
                action: 'baseInfo',
                align: 'center',
                minWidth: 50,
                childNames: ['age', 'dept'],
                childConfigs: [
                    { type: 'leaf', colName: 'age', title: '年龄', align: 'center', minWidth: 80 },
                    { type: 'leaf', colName: 'dept', title: '部门', align: 'center', minWidth: 120 },
                ],
            });
            container.appendChild(groupCell.el);

            await groupCell.ready;
            await new Promise(r => setTimeout(r, 50));

            expect(groupCell._childCells.length).toBe(2);

            const ageCell = groupCell._childCells[0].component;
            const deptCell = groupCell._childCells[1].component;

            expect(ageCell.getNodeEl('title')?.textContent).toBe('年龄');
            expect(deptCell.getNodeEl('title')?.textContent).toBe('部门');
        });

        it('update 后新子单元格应有正确的标题', async () => {
            const ageCell1 = new HeaderCellComponent({
                colName: 'age',
                title: '年龄',
                align: 'center',
                minWidth: 80,
                action: 'age',
            });
            const deptCell1 = new HeaderCellComponent({
                colName: 'dept',
                title: '部门',
                align: 'center',
                minWidth: 120,
                action: 'dept',
            });

            const groupCell = new GroupHeaderCellComponent({
                colName: 'baseInfo',
                title: '基本信息',
                action: 'baseInfo',
                align: 'center',
                minWidth: 50,
                childNames: ['age', 'dept'],
                childCells: [ageCell1, deptCell1],
            });
            container.appendChild(groupCell.el);

            await groupCell.ready;
            await new Promise(r => setTimeout(r, 50));

            const ageCell2 = new HeaderCellComponent({
                colName: 'age',
                title: '年龄',
                align: 'center',
                minWidth: 80,
                action: 'age',
            });
            const deptCell2 = new HeaderCellComponent({
                colName: 'dept',
                title: '部门',
                align: 'center',
                minWidth: 120,
                action: 'dept',
            });

            groupCell.update({
                colName: 'baseInfo',
                title: '基本信息',
                action: 'baseInfo',
                childNames: ['age', 'dept'],
                childCells: [ageCell2, deptCell2],
            });

            await new Promise(r => setTimeout(r, 50));

            expect(ageCell2.getNodeEl('title')?.textContent).toBe('年龄');
            expect(deptCell2.getNodeEl('title')?.textContent).toBe('部门');
        });

        it('update 在 onAfterInit 之前调用时，_childCells 不应重复', async () => {
            const ageCell = new HeaderCellComponent({
                colName: 'age',
                title: '年龄',
                align: 'center',
                minWidth: 80,
                action: 'age',
            });
            const deptCell = new HeaderCellComponent({
                colName: 'dept',
                title: '部门',
                align: 'center',
                minWidth: 120,
                action: 'dept',
            });

            const groupCell = new GroupHeaderCellComponent({
                colName: 'baseInfo',
                title: '基本信息',
                action: 'baseInfo',
                align: 'center',
                minWidth: 50,
                childNames: ['age', 'dept'],
                childCells: [ageCell, deptCell],
            });
            container.appendChild(groupCell.el);

            const newAgeCell = new HeaderCellComponent({
                colName: 'age',
                title: '年龄',
                align: 'center',
                minWidth: 80,
                action: 'age',
            });
            const newDeptCell = new HeaderCellComponent({
                colName: 'dept',
                title: '部门',
                align: 'center',
                minWidth: 120,
                action: 'dept',
            });

            groupCell.update({
                colName: 'baseInfo',
                title: '基本信息',
                action: 'baseInfo',
                childNames: ['age', 'dept'],
                childCells: [newAgeCell, newDeptCell],
            });

            await groupCell.ready;
            await new Promise(r => setTimeout(r, 50));

            expect(groupCell._childCells.length).toBe(2);
        });
    });
});
