/**
 * TableEngine 单元测试
 * 目标覆盖率：80%+
 */

jest.mock('@/logger', () => ({
    Logger: {
        for: jest.fn(() => ({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        })),
    },
}));

jest.mock('@qimenjs/task', () => ({
    globalTaskQueue: {
        addTask: jest.fn((fn: () => any) => fn()),
    },
}));

beforeAll(() => {
    (global as any).requestAnimationFrame = (cb: Function) => {
        cb();
        return 0;
    };
});

jest.mock('@/component-core/engine/ComponentRegistrar', () => {
    const mockNodeMapMgr = {
        buildDOM: jest.fn(() => document.createElement('div')),
        get: jest.fn(),
        getAll: jest.fn(() => ({})),
        set: jest.fn(),
        disposeAll: jest.fn(),
    };
    const mockInstance = {
        register: jest.fn(),
        get: jest.fn(),
        getCompiled: jest.fn(() => ({
            cache: {
                indexPath: {},
                templateCache: document.createElement('template'),
                exposeNames: [],
                i18nNodes: [],
                permissionNodes: [],
            },
            nodeMetas: {},
        })),
        createNodeMapManager: jest.fn(() => mockNodeMapMgr),
        has: jest.fn(() => true),
    };
    return {
        ComponentRegistrar: {
            getInstance: jest.fn(() => mockInstance),
        },
    };
});

import { TableEngine } from '@/component/table/engine/TableEngine';
import type { ColumnMetaManager } from '@/component/table/engine/ColumnMetaManager';
import type { ColumnMeta, ColumnDefOrGroup } from '@/component/table/column-types';
import { RowComponent } from '@/component/table/row/RowComponent';
import { HeaderComponent } from '@/component/table/header/HeaderComponent';
import { EditOverlayComponent } from '@/component/table/edit-overlay/EditOverlayComponent';
import { GroupSummaryRowComponent } from '@/component/table/group-summary/GroupSummaryRowComponent';
import { TableSummaryRowComponent } from '@/component/table/table-summary/TableSummaryRowComponent';

function createMockMeta(name: string, overrides?: Partial<ColumnMeta>): ColumnMeta {
    return {
        name,
        field: name,
        title: name,
        cellType: 'text',
        hidden: false,
        editable: false,
        sortable: false,
        resizable: false,
        align: 'left',
        ...overrides,
    };
}

function createMockMgr(overrides?: Partial<ColumnMetaManager>): ColumnMetaManager {
    const metas: ColumnMeta[] = [
        createMockMeta('name', { field: 'name', title: '姓名' }),
        createMockMeta('age', { field: 'age', title: '年龄', align: 'right' }),
        createMockMeta('dept', { field: 'dept', title: '部门', cellType: 'tree' }),
    ];
    const editableMetas = metas.filter(m => m.editable);

    return {
        rawColumns: [
            { name: 'name', field: 'name', title: '姓名' },
            { name: 'age', field: 'age', title: '年龄' },
            { name: 'dept', field: 'dept', title: '部门' },
        ] as ColumnDefOrGroup[],
        getAll: jest.fn(() => metas),
        get: jest.fn((name: string) => metas.find(m => m.name === name)),
        getEditable: jest.fn(() => editableMetas),
        getGroupable: jest.fn(() => []),
        getSummarizable: jest.fn(() => []),
        ...overrides,
    } as unknown as ColumnMetaManager;
}

function createRowInstance(): RowComponent {
    const inst = Object.create(RowComponent.prototype) as RowComponent;
    inst._columnMetas = [];
    const nodeMap: any = {};
    Object.defineProperty(inst, 'nodeMap', { value: nodeMap, configurable: true });
    return inst;
}

function createEditOverlayInstance(): EditOverlayComponent {
    const inst = Object.create(EditOverlayComponent.prototype) as EditOverlayComponent;
    inst._editableMetas = [];
    inst._activeColName = null;
    return inst;
}

function createGroupSummaryInstance(): GroupSummaryRowComponent {
    const inst = Object.create(GroupSummaryRowComponent.prototype) as GroupSummaryRowComponent;
    inst._columnMetas = [];
    return inst;
}

function createTableSummaryInstance(): TableSummaryRowComponent {
    const inst = Object.create(TableSummaryRowComponent.prototype) as TableSummaryRowComponent;
    inst._columnMetas = [];
    return inst;
}

describe('TableEngine', () => {
    beforeEach(() => {
        (TableEngine as any)._registry = new Map();
    });

    describe('compile', () => {
        it('应返回包含五个组件类的 CompiledSet', () => {
            const mgr = createMockMgr();
            const compiled = TableEngine.compile(mgr);

            expect(compiled).toHaveProperty('RowClass');
            expect(compiled).toHaveProperty('HeaderClass');
            expect(compiled).toHaveProperty('EditClass');
            expect(compiled).toHaveProperty('GroupSumClass');
            expect(compiled).toHaveProperty('TableSumClass');
        });

        it('RowClass 应继承 RowComponent', () => {
            const mgr = createMockMgr();
            const compiled = TableEngine.compile(mgr);
            expect(compiled.RowClass.prototype).toBeInstanceOf(RowComponent);
        });

        it('HeaderClass 应继承 HeaderComponent', () => {
            const mgr = createMockMgr();
            const compiled = TableEngine.compile(mgr);
            expect(compiled.HeaderClass.prototype).toBeInstanceOf(HeaderComponent);
        });

        it('EditClass 应继承 EditOverlayComponent', () => {
            const mgr = createMockMgr();
            const compiled = TableEngine.compile(mgr);
            expect(compiled.EditClass.prototype).toBeInstanceOf(EditOverlayComponent);
        });

        it('GroupSumClass 应继承 GroupSummaryRowComponent', () => {
            const mgr = createMockMgr();
            const compiled = TableEngine.compile(mgr);
            expect(compiled.GroupSumClass.prototype).toBeInstanceOf(GroupSummaryRowComponent);
        });

        it('TableSumClass 应继承 TableSummaryRowComponent', () => {
            const mgr = createMockMgr();
            const compiled = TableEngine.compile(mgr);
            expect(compiled.TableSumClass.prototype).toBeInstanceOf(TableSummaryRowComponent);
        });

        it('同列定义应复用同类', () => {
            const mgr1 = createMockMgr();
            const mgr2 = createMockMgr();
            const compiled1 = TableEngine.compile(mgr1);
            const compiled2 = TableEngine.compile(mgr2);

            expect(compiled1.RowClass).toBe(compiled2.RowClass);
            expect(compiled1.HeaderClass).toBe(compiled2.HeaderClass);
            expect(compiled1.EditClass).toBe(compiled2.EditClass);
            expect(compiled1.GroupSumClass).toBe(compiled2.GroupSumClass);
            expect(compiled1.TableSumClass).toBe(compiled2.TableSumClass);
        });

        it('不同列定义应产出不同类', () => {
            const mgr1 = createMockMgr();
            const mgr2 = createMockMgr({
                getAll: jest.fn(() => [
                    createMockMeta('name'),
                    createMockMeta('salary', { field: 'salary', title: '薪资' }),
                ]),
            });
            const compiled1 = TableEngine.compile(mgr1);
            const compiled2 = TableEngine.compile(mgr2);

            expect(compiled1.RowClass).not.toBe(compiled2.RowClass);
        });
    });

    describe('EditOverlay — 无可编辑列', () => {
        it('应产出空编辑浮层类', () => {
            const mgr = createMockMgr({ getEditable: jest.fn(() => []) });
            const compiled = TableEngine.compile(mgr);
            expect(compiled.EditClass.prototype).toBeInstanceOf(EditOverlayComponent);
        });
    });

    describe('EditOverlay — 有可编辑列', () => {
        it('应产出继承 EditOverlayComponent 的编辑浮层类', () => {
            const editableMetas = [createMockMeta('name', { editable: true, editType: 'text' })];
            const mgr = createMockMgr({ getEditable: jest.fn(() => editableMetas) });
            const compiled = TableEngine.compile(mgr);
            expect(compiled.EditClass.prototype).toBeInstanceOf(EditOverlayComponent);
        });
    });

    describe('_buildHeaderConfigs', () => {
        it('应跳过隐藏列', () => {
            const mgr = createMockMgr({
                getAll: jest.fn(() => [
                    createMockMeta('name'),
                    createMockMeta('hidden_col', { hidden: true }),
                ]),
                get: jest.fn((name: string) => {
                    if (name === 'hidden_col')
                        return createMockMeta('hidden_col', { hidden: true });
                    return createMockMeta(name);
                }),
            });
            const configs = TableEngine._buildHeaderConfigs(mgr.rawColumns, mgr);
            const names = configs.map((c: any) => c.name);
            expect(names).not.toContain('hidden_col');
        });

        it('应处理分组列', () => {
            const groupColumns: ColumnDefOrGroup[] = [
                {
                    name: 'info',
                    title: '基本信息',
                    children: [
                        { name: 'name', field: 'name', title: '姓名' },
                        { name: 'age', field: 'age', title: '年龄' },
                    ],
                } as any,
            ];
            const mgr = createMockMgr({
                getAll: jest.fn(() => [createMockMeta('name'), createMockMeta('age')]),
                get: jest.fn((name: string) => createMockMeta(name)),
            });
            mgr.rawColumns = groupColumns;

            const configs = TableEngine._buildHeaderConfigs(groupColumns, mgr);
            expect(configs.length).toBe(1);
            expect(configs[0]).toHaveProperty('childNames');
        });
    });

    describe('_renderHeaderCells', () => {
        it('应跳过未注册的 cellType', () => {
            const { ComponentRegistrar } = require('@/component-core/engine/ComponentRegistrar');
            ComponentRegistrar.getInstance.mockReturnValue({
                get: jest.fn(() => undefined),
            });

            const container = document.createElement('div');
            TableEngine._renderHeaderCells([{ name: 'test', title: 'Test' }], container, {});
            expect(container.children.length).toBe(0);
        });
    });

    describe('_calcDepth', () => {
        it('扁平列深度为 1', () => {
            const cols: ColumnDefOrGroup[] = [
                { name: 'a', field: 'a', title: 'A' },
                { name: 'b', field: 'b', title: 'B' },
            ] as ColumnDefOrGroup[];
            expect((TableEngine as any)._calcDepth(cols)).toBe(1);
        });
    });

    describe('_isGroup', () => {
        it('有 children 数组的是分组', () => {
            expect((TableEngine as any)._isGroup({ children: [] })).toBe(true);
            expect((TableEngine as any)._isGroup({ name: 'a' })).toBe(false);
        });
    });
});

describe('RowComponent', () => {
    it('onAfterInit 应调用 _applyWidths', () => {
        const row = createRowInstance();
        jest.spyOn(row, '_applyWidths').mockImplementation(() => {});

        row.onAfterInit();
        expect(row._applyWidths).toHaveBeenCalled();
    });

    it('update 应遍历 _columnMetas 调用 cell.update', () => {
        const row = createRowInstance();
        const mockCell = { update: jest.fn() };
        row._columnMetas = [createMockMeta('name', { field: 'name', cellType: 'text' })];
        row.nodeMap['name'] = { component: mockCell };

        row.update({ name: '张三' });
        expect(mockCell.update).toHaveBeenCalledWith({ value: '张三', format: undefined });
    });

    it('update 传入 null 应跳过', () => {
        const row = createRowInstance();
        row._columnMetas = [createMockMeta('name')];
        row.nodeMap['name'] = { component: { update: jest.fn() } };

        row.update(null);
        expect(row.nodeMap['name'].component.update).not.toHaveBeenCalled();
    });

    it('_getCellData — tree 类型', () => {
        const row = createRowInstance();
        const result = row._getCellData(
            createMockMeta('dept', { cellType: 'tree', field: 'name' }),
            { name: '技术部', _depth: 1, _leaf: false, _expanded: true }
        );
        expect(result).toEqual({ value: '技术部', depth: 1, leaf: false, expanded: true });
    });

    it('_getCellData — checkbox 类型', () => {
        const row = createRowInstance();
        const result = row._getCellData(
            createMockMeta('checked', { cellType: 'checkbox', field: 'checked' }),
            { checked: true }
        );
        expect(result).toEqual({ checked: true });
    });

    it('_getCellData — action 类型', () => {
        const row = createRowInstance();
        const result = row._getCellData(
            createMockMeta('ops', { cellType: 'action', field: 'actions' }),
            { actions: ['edit', 'delete'] }
        );
        expect(result).toEqual({ actions: ['edit', 'delete'] });
    });

    it('_getCellData — 默认 text 类型', () => {
        const row = createRowInstance();
        const result = row._getCellData(
            createMockMeta('name', { cellType: 'text', field: 'name', format: 'upper' }),
            { name: 'hello' }
        );
        expect(result).toEqual({ value: 'hello', format: 'upper' });
    });

    it('_getFieldValue — 点分隔路径', () => {
        const row = createRowInstance();
        expect(row._getFieldValue({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
    });

    it('_getFieldValue — undefined 路径', () => {
        const row = createRowInstance();
        expect(row._getFieldValue({ a: 1 }, 'x.y.z')).toBeUndefined();
    });

    it('_getFieldValue — null 对象', () => {
        const row = createRowInstance();
        expect(row._getFieldValue(null, 'a')).toBeUndefined();
    });

    it('_applyWidths — 应设置宽度变量', () => {
        const row = createRowInstance();
        const mockEl = { style: { width: '', flexShrink: '' } };
        row._columnMetas = [createMockMeta('name', { width: 100 })];
        row.nodeMap['name'] = { el: mockEl };

        row._applyWidths();
        expect(mockEl.style.width).toBe('var(--q-table-col-name-width)');
        expect(mockEl.style.flexShrink).toBe('0');
    });

    it('_applyWidths — 无 width 的列应跳过', () => {
        const row = createRowInstance();
        row._columnMetas = [createMockMeta('name', { width: undefined as any })];
        row.nodeMap['name'] = { el: { style: {} } };

        row._applyWidths();
        expect(row.nodeMap['name'].el.style.width).toBeUndefined();
    });
});

describe('GroupSummaryRowComponent', () => {
    it('onAfterInit 应调用 addCls 和 _applyWidths', () => {
        const comp = createGroupSummaryInstance();
        jest.spyOn(comp, 'addCls').mockImplementation(() => {});
        jest.spyOn(comp, '_applyWidths').mockImplementation(() => {});

        comp.onAfterInit();
        expect(comp.addCls).toHaveBeenCalledWith('q-table-row--group-summary');
        expect(comp._applyWidths).toHaveBeenCalled();
    });

    it('update — groupAggregator=label 应传值', () => {
        const comp = createGroupSummaryInstance();
        const mockCell = { update: jest.fn() };
        comp._columnMetas = [createMockMeta('label', { groupAggregator: 'label', field: 'label' })];
        (comp as any).getNode = jest.fn(() => mockCell);

        comp.update({ label: '技术部' });
        expect(mockCell.update).toHaveBeenCalledWith({ value: '技术部' });
    });

    it('update — groupAggregator=label 无值应传空字符串', () => {
        const comp = createGroupSummaryInstance();
        const mockCell = { update: jest.fn() };
        comp._columnMetas = [createMockMeta('label', { groupAggregator: 'label', field: 'label' })];
        (comp as any).getNode = jest.fn(() => mockCell);

        comp.update({});
        expect(mockCell.update).toHaveBeenCalledWith({ value: '' });
    });

    it('update — 非 label 无值应传空字符串', () => {
        const comp = createGroupSummaryInstance();
        const mockCell = { update: jest.fn() };
        comp._columnMetas = [createMockMeta('count', { field: 'count' })];
        (comp as any).getNode = jest.fn(() => mockCell);

        comp.update({});
        expect(mockCell.update).toHaveBeenCalledWith({ value: '' });
    });

    it('update — 有值时传 format', () => {
        const comp = createGroupSummaryInstance();
        const mockCell = { update: jest.fn() };
        comp._columnMetas = [createMockMeta('count', { field: 'count', format: 'number' })];
        (comp as any).getNode = jest.fn(() => mockCell);

        comp.update({ count: 25 });
        expect(mockCell.update).toHaveBeenCalledWith({ value: 25, format: 'number' });
    });

    it('update — null 应跳过', () => {
        const comp = createGroupSummaryInstance();
        comp._columnMetas = [createMockMeta('count')];
        (comp as any).getNode = jest.fn();

        comp.update(null);
        expect((comp as any).getNode).not.toHaveBeenCalled();
    });

    it('_applyWidths — 应设置宽度', () => {
        const comp = createGroupSummaryInstance();
        jest.spyOn(comp, 'setNodeStyle').mockImplementation(() => {});
        comp._columnMetas = [createMockMeta('name', { width: 100 })];

        comp._applyWidths();
        expect(comp.setNodeStyle).toHaveBeenCalledWith(
            { width: 'var(--q-table-col-name-width)', flexShrink: '0' },
            'name'
        );
    });
});

describe('TableSummaryRowComponent', () => {
    it('onAfterInit 应调用 addCls 和 _applyWidths', () => {
        const comp = createTableSummaryInstance();
        jest.spyOn(comp, 'addCls').mockImplementation(() => {});
        jest.spyOn(comp, '_applyWidths').mockImplementation(() => {});

        comp.onAfterInit();
        expect(comp.addCls).toHaveBeenCalledWith('q-table-row--table-summary');
        expect(comp._applyWidths).toHaveBeenCalled();
    });

    it('update — 有值时传 format', () => {
        const comp = createTableSummaryInstance();
        const mockCell = { update: jest.fn() };
        comp._columnMetas = [createMockMeta('salary', { field: 'salary', format: 'currency' })];
        (comp as any).getNode = jest.fn(() => mockCell);

        comp.update({ salary: 500000 });
        expect(mockCell.update).toHaveBeenCalledWith({ value: 500000, format: 'currency' });
    });

    it('update — 无值时传空字符串', () => {
        const comp = createTableSummaryInstance();
        const mockCell = { update: jest.fn() };
        comp._columnMetas = [createMockMeta('salary', { field: 'salary' })];
        (comp as any).getNode = jest.fn(() => mockCell);

        comp.update({});
        expect(mockCell.update).toHaveBeenCalledWith({ value: '' });
    });

    it('update — null 应跳过', () => {
        const comp = createTableSummaryInstance();
        comp._columnMetas = [createMockMeta('salary')];
        (comp as any).getNode = jest.fn();

        comp.update(null);
        expect((comp as any).getNode).not.toHaveBeenCalled();
    });

    it('_applyWidths — 应设置宽度', () => {
        const comp = createTableSummaryInstance();
        jest.spyOn(comp, 'setNodeStyle').mockImplementation(() => {});
        comp._columnMetas = [createMockMeta('name', { width: 100 })];

        comp._applyWidths();
        expect(comp.setNodeStyle).toHaveBeenCalledWith(
            { width: 'var(--q-table-col-name-width)', flexShrink: '0' },
            'name'
        );
    });
});

describe('EditOverlayComponent', () => {
    it('onAfterInit 应调用 _hideAllSlots', () => {
        const comp = createEditOverlayInstance();
        jest.spyOn(comp, '_hideAllSlots').mockImplementation(() => {});

        comp.onAfterInit();
        expect(comp._hideAllSlots).toHaveBeenCalled();
    });

    it('activate 应调用 _showSlot + _setValue + _focusInput', () => {
        const comp = createEditOverlayInstance();
        comp._editableMetas = [createMockMeta('name', { editType: 'text' })];
        jest.spyOn(comp, '_hideAllSlots').mockImplementation(() => {});
        jest.spyOn(comp, '_showSlot').mockImplementation(() => {});
        jest.spyOn(comp, '_clearError').mockImplementation(() => {});
        jest.spyOn(comp, '_setValue').mockImplementation(() => {});
        jest.spyOn(comp, '_focusInput').mockImplementation(() => {});

        comp.activate('name', '张三');
        expect(comp._activeColName).toBe('name');
        expect(comp._showSlot).toHaveBeenCalledWith('name');
        expect(comp._setValue).toHaveBeenCalledWith('name', '张三');
    });

    it('deactivate 应重置状态', () => {
        const comp = createEditOverlayInstance();
        comp._activeColName = 'name';
        jest.spyOn(comp, '_hideAllSlots').mockImplementation(() => {});
        jest.spyOn(comp, '_clearError').mockImplementation(() => {});

        comp.deactivate();
        expect(comp._activeColName).toBeNull();
    });

    it('getEditValue — 无活跃列应返回 undefined', () => {
        const comp = createEditOverlayInstance();
        comp._activeColName = null;
        expect(comp.getEditValue()).toBeUndefined();
    });

    it('showError 应设置错误文本和显示', () => {
        const comp = createEditOverlayInstance();
        jest.spyOn(comp, 'setNodeProp').mockImplementation(() => {});
        jest.spyOn(comp, 'setNodeStyle').mockImplementation(() => {});

        comp.showError('必填项');
        expect(comp.setNodeProp).toHaveBeenCalledWith('text', '必填项', 'error');
        expect(comp.setNodeStyle).toHaveBeenCalledWith({ display: '' }, 'error');
    });

    it('_hideAllSlots 应隐藏所有编辑槽', () => {
        const comp = createEditOverlayInstance();
        comp._editableMetas = [
            createMockMeta('name', { editType: 'text' }),
            createMockMeta('age', { editType: 'number' }),
        ];
        jest.spyOn(comp, 'setNodeStyle').mockImplementation(() => {});

        comp._hideAllSlots();
        expect(comp.setNodeStyle).toHaveBeenCalledTimes(2);
    });

    it('_showSlot 应显示指定槽', () => {
        const comp = createEditOverlayInstance();
        jest.spyOn(comp, 'setNodeStyle').mockImplementation(() => {});

        comp._showSlot('name');
        expect(comp.setNodeStyle).toHaveBeenCalledWith({ display: '' }, 'slot_name');
    });

    it('_clearError 应清空错误并隐藏', () => {
        const comp = createEditOverlayInstance();
        jest.spyOn(comp, 'setNodeProp').mockImplementation(() => {});
        jest.spyOn(comp, 'setNodeStyle').mockImplementation(() => {});

        comp._clearError();
        expect(comp.setNodeProp).toHaveBeenCalledWith('text', '', 'error');
        expect(comp.setNodeStyle).toHaveBeenCalledWith({ display: 'none' }, 'error');
    });

    it('_setValue — 有值时应设置', () => {
        const comp = createEditOverlayInstance();
        jest.spyOn(comp, '_getInput').mockReturnValue({ value: '' } as any);

        comp._setValue('name', 'hello');
        expect((comp as any)._getInput('name').value).toBe('hello');
    });

    it('_setValue — undefined 应跳过', () => {
        const comp = createEditOverlayInstance();
        jest.spyOn(comp, '_getInput').mockReturnValue({ value: '' } as any);

        comp._setValue('name', undefined);
        expect(comp._getInput).toHaveBeenCalled();
    });

    it('_focusInput — 有 input 时应聚焦', () => {
        const comp = createEditOverlayInstance();
        const mockFocus = jest.fn();
        jest.spyOn(comp, '_getInput').mockReturnValue({ focus: mockFocus } as any);

        comp._focusInput('name');
        expect(mockFocus).toHaveBeenCalled();
    });

    it('_focusInput — 无 input 时应跳过', () => {
        const comp = createEditOverlayInstance();
        jest.spyOn(comp, '_getInput').mockReturnValue(null);

        comp._focusInput('name');
    });

    it('getEditValue — 有活跃列且有 input 应返回值', () => {
        const comp = createEditOverlayInstance();
        comp._activeColName = 'name';
        jest.spyOn(comp, '_getInput').mockReturnValue({ value: '张三' } as any);

        expect(comp.getEditValue()).toBe('张三');
    });

    it('_resolveNodeEl 应被 _getInput 调用', () => {
        const comp = createEditOverlayInstance();
        jest.spyOn(comp, '_resolveNodeEl').mockReturnValue(document.createElement('input'));

        comp._getInput('name');
        expect(comp._resolveNodeEl).toHaveBeenCalledWith('input_name');
    });
});

describe('HeaderComponent', () => {
    it('onAfterInit 应调用 _createHeaderCells', () => {
        const comp = Object.create(HeaderComponent.prototype) as HeaderComponent;
        comp._headerConfigs = [];
        comp._headerDepth = 1;
        jest.spyOn(comp, '_createHeaderCells').mockImplementation(() => {});

        comp.onAfterInit();
        expect(comp._createHeaderCells).toHaveBeenCalled();
    });

    it('_createHeaderCells — 无 el 应跳过', () => {
        const comp = Object.create(HeaderComponent.prototype) as HeaderComponent;
        comp._headerConfigs = [];
        (comp as any).el = undefined;

        comp._createHeaderCells();
    });
});
