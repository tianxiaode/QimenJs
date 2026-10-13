/**
 * 行号列 header cell 测试
 *
 * 验证行号列的 header cell 是否正确设置 width inline style
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

describe('行号列 HeaderCellComponent', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    it('行号列 header cell 应正确设置 width inline style', async () => {
        const cell = new HeaderCellComponent({
            colName: '#',
            title: null,
            align: 'center',
            sortable: false,
            resizable: false,
            draggable: false,
            action: '#',
            minWidth: 0,
            menuDisabled: true,
            hideableColumns: [],
            groupable: false,
            groupField: '',
            selectionAll: false,
            eventKey: 'test',
        });
        container.appendChild(cell.el);

        await cell.ready;
        await new Promise(r => setTimeout(r, 50));

        expect(cell.el.style.width).toBe('var(--q-table-col-#-width)');
    });

    it('普通列 header cell 应正确设置 width inline style', async () => {
        const cell = new HeaderCellComponent({
            colName: 'name',
            title: '姓名',
            align: 'center',
            sortable: false,
            resizable: true,
            draggable: false,
            action: 'name',
            minWidth: 50,
            menuDisabled: false,
            hideableColumns: [],
            groupable: false,
            groupField: '',
            selectionAll: false,
            eventKey: 'test',
        });
        container.appendChild(cell.el);

        await cell.ready;
        await new Promise(r => setTimeout(r, 50));

        expect(cell.el.style.width).toBe('var(--q-table-col-name-width)');
    });

    it('行号列 header cell 的 resizeHandle 应隐藏', async () => {
        const cell = new HeaderCellComponent({
            colName: '#',
            title: null,
            align: 'center',
            sortable: false,
            resizable: false,
            draggable: false,
            action: '#',
            minWidth: 0,
            menuDisabled: true,
            hideableColumns: [],
            groupable: false,
            groupField: '',
            selectionAll: false,
            eventKey: 'test',
        });
        container.appendChild(cell.el);

        await cell.ready;
        await new Promise(r => setTimeout(r, 50));

        const resizeHandle = cell.getNodeEl('resizeHandle');
        expect(resizeHandle.style.display).toBe('none');
    });

    it('行号列 header cell 的 menuArea 应隐藏', async () => {
        const cell = new HeaderCellComponent({
            colName: '#',
            title: null,
            align: 'center',
            sortable: false,
            resizable: false,
            draggable: false,
            action: '#',
            minWidth: 0,
            menuDisabled: true,
            hideableColumns: [],
            groupable: false,
            groupField: '',
            selectionAll: false,
            eventKey: 'test',
        });
        container.appendChild(cell.el);

        await cell.ready;
        await new Promise(r => setTimeout(r, 50));

        const menuArea = cell.getNodeEl('menuArea');
        expect(menuArea.style.display).toBe('none');
    });
});
