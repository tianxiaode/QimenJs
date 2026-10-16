import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import type { ColumnDefOrGroup } from '@qimenjs/component';

const EDIT_DATA = [
    { id: 1, name: '张三', age: 28, salary: 15000, dept: '技术部', email: 'zhangsan@co.com' },
    { id: 2, name: '李四', age: 35, salary: 22000, dept: '市场部', email: 'lisi@company.com' },
    { id: 3, name: '王五', age: 42, salary: 30000, dept: '管理层', email: 'wangwu@company.com' },
    { id: 4, name: '赵六', age: 31, salary: 18000, dept: '技术部', email: 'zhaoliu@co.com' },
];

const EDIT_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120, editable: true },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', editable: true, editType: 'number' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center', editable: true },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', editable: true, editType: 'number' },
    { name: 'email', field: 'email', title: '邮箱', width: 200, editable: true },
];

const EDIT_RULES = {
    name: { required: true },
    age: { required: true, min: 18, max: 65 },
    salary: { required: true, min: 0 },
    email: { required: true, pattern: '^[^@]+@[^@]+\\.[^@]+$', message: '邮箱格式不正确' },
};

class TableEditDemoComponent extends Component {
    static type = 'table-edit-demo';

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
                columns: EDIT_COLUMNS,
                data: [...EDIT_DATA],
                editTrigger: 'dblclick',
                editRules: EDIT_RULES,
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
                if (orig !== val) {
                    changes.push(`${key}: ${orig} → ${val}`);
                }
            }
            if (changes.length > 0) {
                entry.textContent += ` | ${changes.join(', ')}`;
            } else {
                entry.textContent += ' | 无变更';
            }
        }
        this._logEl.appendChild(entry);
        this._logEl.scrollTop = this._logEl.scrollHeight;
    }
}

export const TABLE_EDIT_DEMO: DemoConfig = {
    title: 'Table 行编辑',
    description: '行编辑 — 双击行触发浮动层编辑，支持验证、取消/保存按钮',
    sections: [
        {
            label: '行编辑（双击触发 + 浮动层 + 验证）',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'name', field: 'name', title: '姓名', editable: true },
        { name: 'age', field: 'age', title: '年龄', editable: true, editType: 'number' },
        { name: 'email', field: 'email', title: '邮箱', editable: true },
    ],
    data: [...],
    editTrigger: 'dblclick',  // 或 'click'
    editRules: {
        name: { required: true },
        age: { required: true, min: 18, max: 65 },
        email: { required: true, pattern: '^[^@]+@[^@]+', message: '邮箱格式不正确' },
    },
} }

// 双击行 → 浮动层覆盖行 → 编辑所有 editable 列
// 底部统一操作栏：取消 + 保存
// 验证失败时显示错误信息，必须点取消才能关闭`,
            component: TableEditDemoComponent,
        },
    ],
};
