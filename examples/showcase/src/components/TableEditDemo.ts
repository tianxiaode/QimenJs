import { Component, type TemplateDecl } from '@qimenjs/component-core';
import { dataDispatchCenter, LocalReadonlyEntityManager } from '@qimenjs/entity';
import type { DemoConfig } from './types';
import type { ColumnDefOrGroup } from '@qimenjs/component';

const EDIT_DATA = [
    { id: 1, name: '张三', age: 28, salary: 15000, dept: '技术部', email: 'zhangsan@co.com' },
    { id: 2, name: '李四', age: 35, salary: 22000, dept: '市场部', email: 'lisi@company.com' },
    { id: 3, name: '王五', age: 42, salary: 30000, dept: '管理层', email: 'wangwu@company.com' },
    { id: 4, name: '赵六', age: 31, salary: 18000, dept: '技术部', email: 'zhaoliu@co.com' },
];

const CELL_EDIT_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    { name: 'email', field: 'email', title: '邮箱', flex: 1, editable: true },
];

const ROW_EDIT_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120, editable: true },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', editable: true, editType: 'number' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center', editable: true },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', editable: true, editType: 'number' },
    { name: 'email', field: 'email', title: '邮箱', flex: 1, editable: true },
];

const ROW_EDIT_RULES = {
    name: { required: true },
    age: { required: true, min: 18, max: 65 },
    salary: { required: true, min: 0 },
    email: { required: true, pattern: '^[^@]+@[^@]+\\.[^@]+$', message: '邮箱格式不正确' },
};

const ENTITY_EDIT_DATA = [
    { id: 1, name: '张三', age: 28, salary: 15000, dept: '技术部' },
    { id: 2, name: '李四', age: 35, salary: 22000, dept: '市场部' },
    { id: 3, name: '王五', age: 42, salary: 30000, dept: '管理层' },
];

const ENTITY_EDIT_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120, editable: true },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', editable: true, editType: 'number' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center', editable: true },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', editable: true, editType: 'number' },
];

const ENTITY_EDIT_RULES = {
    name: { required: true },
    age: { required: true, min: 18, max: 65 },
    salary: { required: true, min: 0 },
};

const ENTITY_KEY = 'demo-edit-entity';
const MOCK_ENTITY_TYPE = 'mock-edit-entity';

class MockEditEntityManager extends LocalReadonlyEntityManager {
    static entityType = MOCK_ENTITY_TYPE;
}

class CellEditDemo extends Component {
    static type = 'cell-edit-demo';

    _table: any = null;
    _logEl: HTMLElement | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__column',
            children: [
                { tag: 'div', name: 'tableContainer', classes: 'q-demo__column' },
                {
                    tag: 'div',
                    name: 'logArea',
                    classes: 'q-demo__edit-log',
                    children: [
                        { tag: 'div', classes: 'q-demo__edit-log-title', options: { text: '编辑事件日志' } },
                        { tag: 'div', name: 'logContent', classes: 'q-demo__edit-log-content' },
                    ],
                },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('tableContainer');
        this._logEl = this.getNodeEl('logContent');
        if (!container) return;

        import('@qimenjs/component').then(({ TableComponent }) => {
            this._table = new TableComponent({
                columns: CELL_EDIT_COLUMNS,
                data: [...EDIT_DATA],
                editTrigger: 'dblclick',
                editMode: 'cell',
            });

            this._table.on('editSave', (data: any) => {
                this._log('editSave', data);
                const items = this._table.getData('data');
                const idx = items.findIndex((item: any) => String(item.id) === String(data.rowKey));
                if (idx >= 0) {
                    items[idx] = { ...items[idx], ...data.newValues };
                    this._table.setData('data', items);
                    this._table._reflow();
                }
            });

            this._table.on('editCancel', (data: any) => {
                this._log('editCancel', data);
            });

            container.appendChild(this._table.el);
        });
    }

    _log(event: string, data: any): void {
        if (!this._logEl) return;
        const entry = document.createElement('div');
        entry.className = 'q-demo__edit-log-entry';
        const time = new Date().toLocaleTimeString();
        entry.textContent = `[${time}] ${event}: rowKey=${data.rowKey}`;
        if (event === 'editSave') {
            const changes: string[] = [];
            for (const [key, val] of Object.entries(data.newValues)) {
                const orig = data.originalValues?.[key];
                if (orig !== val) changes.push(`${key}: ${orig} → ${val}`);
            }
            entry.textContent += changes.length > 0 ? ` | ${changes.join(', ')}` : ' | 无变更';
        }
        this._logEl.appendChild(entry);
        this._logEl.scrollTop = this._logEl.scrollHeight;
    }
}

class RowEditDemo extends Component {
    static type = 'row-edit-demo';

    _table: any = null;
    _logEl: HTMLElement | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__column',
            children: [
                { tag: 'div', name: 'tableContainer', classes: 'q-demo__column' },
                {
                    tag: 'div',
                    name: 'logArea',
                    classes: 'q-demo__edit-log',
                    children: [
                        { tag: 'div', classes: 'q-demo__edit-log-title', options: { text: '编辑事件日志' } },
                        { tag: 'div', name: 'logContent', classes: 'q-demo__edit-log-content' },
                    ],
                },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('tableContainer');
        this._logEl = this.getNodeEl('logContent');
        if (!container) return;

        import('@qimenjs/component').then(({ TableComponent }) => {
            this._table = new TableComponent({
                columns: ROW_EDIT_COLUMNS,
                data: [...EDIT_DATA],
                editTrigger: 'dblclick',
                editMode: 'row',
                editRules: ROW_EDIT_RULES,
            });

            this._table.on('editSave', (data: any) => {
                this._log('editSave', data);
                const items = this._table.getData('data');
                const idx = items.findIndex((item: any) => String(item.id) === String(data.rowKey));
                if (idx >= 0) {
                    items[idx] = { ...items[idx], ...data.newValues };
                    this._table.setData('data', items);
                    this._table._reflow();
                }
            });

            this._table.on('editCancel', (data: any) => {
                this._log('editCancel', data);
            });

            container.appendChild(this._table.el);
        });
    }

    _log(event: string, data: any): void {
        if (!this._logEl) return;
        const entry = document.createElement('div');
        entry.className = 'q-demo__edit-log-entry';
        const time = new Date().toLocaleTimeString();
        entry.textContent = `[${time}] ${event}: rowKey=${data.rowKey}`;
        if (event === 'editSave') {
            const changes: string[] = [];
            for (const [key, val] of Object.entries(data.newValues)) {
                const orig = data.originalValues?.[key];
                if (orig !== val) changes.push(`${key}: ${orig} → ${val}`);
            }
            entry.textContent += changes.length > 0 ? ` | ${changes.join(', ')}` : ' | 无变更';
        }
        this._logEl.appendChild(entry);
        this._logEl.scrollTop = this._logEl.scrollHeight;
    }
}

class EntityEditDemo extends Component {
    static type = 'entity-edit-demo';

    _table: any = null;
    _logEl: HTMLElement | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__column',
            children: [
                { tag: 'div', name: 'tableContainer', classes: 'q-demo__column' },
                {
                    tag: 'div',
                    name: 'logArea',
                    classes: 'q-demo__edit-log',
                    children: [
                        { tag: 'div', classes: 'q-demo__edit-log-title', options: { text: '编辑事件日志（Entity 数据交互）' } },
                        { tag: 'div', name: 'logContent', classes: 'q-demo__edit-log-content' },
                    ],
                },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('tableContainer');
        this._logEl = this.getNodeEl('logContent');
        if (!container) return;

        MockEditEntityManager.register();
        const mgr = dataDispatchCenter.connect(ENTITY_KEY, MOCK_ENTITY_TYPE);
        ENTITY_EDIT_DATA.forEach(item => mgr.sourceData.set(item.id, item));
        mgr.refreshView();

        import('@qimenjs/component').then(({ TableComponent }) => {
            this._table = new TableComponent({
                columns: ENTITY_EDIT_COLUMNS,
                entityKey: ENTITY_KEY,
                entityType: MOCK_ENTITY_TYPE,
                editTrigger: 'dblclick',
                editRules: ENTITY_EDIT_RULES,
            });

            this._table.on('editSave', (data: any) => {
                this._log('editSave', data);
                const rowKey = data.rowKey;
                const newValues = data.newValues;
                mgr.sourceData.set(Number(rowKey), { ...mgr.sourceData.get(Number(rowKey)), ...newValues });
                mgr.refreshView();
            });

            this._table.on('editCancel', (data: any) => {
                this._log('editCancel', data);
            });

            container.appendChild(this._table.el);
        });

        this.onCleanup(() => {
            dataDispatchCenter.disconnect(ENTITY_KEY);
        });
    }

    _log(event: string, data: any): void {
        if (!this._logEl) return;
        const entry = document.createElement('div');
        entry.className = 'q-demo__edit-log-entry';
        const time = new Date().toLocaleTimeString();
        entry.textContent = `[${time}] ${event}: rowKey=${data.rowKey}`;
        if (event === 'editSave') {
            const changes: string[] = [];
            for (const [key, val] of Object.entries(data.newValues)) {
                const orig = data.originalValues?.[key];
                if (orig !== val) changes.push(`${key}: ${orig} → ${val}`);
            }
            entry.textContent += changes.length > 0 ? ` | ${changes.join(', ')}` : ' | 无变更';
            entry.textContent += ' | → entityEmit update';
        }
        this._logEl.appendChild(entry);
        this._logEl.scrollTop = this._logEl.scrollHeight;
    }
}

export const TABLE_EDIT_DEMO: DemoConfig = {
    title: 'Table 行编辑',
    description: '行编辑 — 双击触发浮动层编辑，支持 cell/row 模式、验证、取消/保存按钮、Entity 数据交互',
    sections: [
        {
            label: 'Cell 编辑模式（双击单元格只编辑该列）',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'name', field: 'name', title: '姓名', width: 120 },
        { name: 'email', field: 'email', title: '邮箱', flex: 1, editable: true },
    ],
    data: [...],
    editTrigger: 'dblclick',
    editMode: 'cell',
} }
// editMode: 'cell' → 双击单元格只编辑该列
// email 列 flex: 1 → 自动填满剩余宽度
// 双击非 editable 单元格不会触发编辑`,
            component: CellEditDemo,
        },
        {
            label: 'Row 编辑模式（多列同时编辑 + 验证）',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'name', field: 'name', title: '姓名', editable: true },
        { name: 'age', field: 'age', title: '年龄', editable: true, editType: 'number' },
        { name: 'email', field: 'email', title: '邮箱', flex: 1, editable: true },
    ],
    data: [...],
    editTrigger: 'dblclick',
    editMode: 'row',
    editRules: {
        name: { required: true },
        age: { required: true, min: 18, max: 65 },
        email: { required: true, pattern: '^[^@]+@[^@]+', message: '邮箱格式不正确' },
    },
} }
// editMode: 'row' → 双击行所有 editable 列同时显示 input
// 验证失败：input 标红 + 浮动层底部错误栏`,
            component: RowEditDemo,
        },
        {
            label: 'Entity 数据交互（编辑保存 → EntityManager 更新）',
            code: `// Table 连接 MockEditEntityManager
// editSave 事件中通过 mgr.sourceData.set() 更新数据
// mgr.refreshView() 触发表格刷新
new TableComponent({
    columns: [...],
    entityKey: 'demo-edit-entity',
    entityType: 'mock-edit-entity',
    editTrigger: 'dblclick',
    editRules: { name: { required: true }, ... },
})

table.on('editSave', (data) => {
    mgr.sourceData.set(Number(data.rowKey),
        { ...mgr.sourceData.get(Number(data.rowKey)), ...data.newValues });
    mgr.refreshView();  // 表格自动刷新
})`,
            component: EntityEditDemo,
        },
    ],
};
