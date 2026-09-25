import type { DemoConfig } from './types';
import { Component, type TemplateDecl } from '@qimenjs/component-core';
import { TableComponent } from '@qimenjs/component';
import type { ColumnDef, ColumnDefOrGroup } from '@qimenjs/component';
import '@/component/table/row/row.css';
import '@/component/table/header/header.css';

const TABLE_DATA = [
    { name: '张三', age: 28, salary: 15000, dept: '技术部' },
    { name: '李四', age: 35, salary: 22000, dept: '市场部' },
    { name: '王五', age: 42, salary: 30000, dept: '管理层' },
    { name: '赵六', age: 24, salary: 8000, dept: '技术部' },
    { name: '孙七', age: 31, salary: 18000, dept: '市场部' },
];

const BASIC_COLUMNS: ColumnDef[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    { name: 'dept', field: 'dept', title: '部门', width: 120 },
];

const SORTABLE_COLUMNS: ColumnDef[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120, sortable: true },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', sortable: true },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', sortable: true },
    { name: 'dept', field: 'dept', title: '部门', width: 120, sortable: true },
];

const REORDERABLE_COLUMNS: ColumnDef[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120, reorderable: true, resizable: true },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', reorderable: true, resizable: true },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', reorderable: true, resizable: true },
    { name: 'dept', field: 'dept', title: '部门', width: 120, reorderable: true, resizable: true },
];

const GROUPED_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    {
        name: 'baseInfo',
        title: '基本信息',
        children: [
            { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
            { name: 'dept', field: 'dept', title: '部门', width: 120 },
        ],
    },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
];

class BasicTableDemo extends Component {
    static type = 'basic-table-demo';
    _table: TableComponent | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__row',
            children: [{ tag: 'div', name: 'container', classes: 'q-table' }],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('container') as HTMLElement;
        if (!container) return;
        this._table = new TableComponent({ columns: BASIC_COLUMNS, data: TABLE_DATA });
        container.appendChild(this._table.el);
    }

    onDestroy(): void {
        this._table?.dispose();
        this._table = null;
    }
}

class SortableTableDemo extends Component {
    static type = 'sortable-table-demo';
    _table: TableComponent | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__row',
            children: [{ tag: 'div', name: 'container', classes: 'q-table' }],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('container') as HTMLElement;
        if (!container) return;
        this._table = new TableComponent({ columns: SORTABLE_COLUMNS, data: TABLE_DATA });
        container.appendChild(this._table.el);
    }

    onDestroy(): void {
        this._table?.dispose();
        this._table = null;
    }
}

class ReorderableTableDemo extends Component {
    static type = 'reorderable-table-demo';
    _table: TableComponent | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__row',
            children: [{ tag: 'div', name: 'container', classes: 'q-table' }],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('container') as HTMLElement;
        if (!container) return;
        this._table = new TableComponent({ columns: REORDERABLE_COLUMNS, data: TABLE_DATA });
        container.appendChild(this._table.el);
    }

    onDestroy(): void {
        this._table?.dispose();
        this._table = null;
    }
}

class GroupedTableDemo extends Component {
    static type = 'grouped-table-demo';
    _table: TableComponent | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__row',
            children: [{ tag: 'div', name: 'container', classes: 'q-table' }],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('container') as HTMLElement;
        if (!container) return;
        this._table = new TableComponent({ columns: GROUPED_COLUMNS, data: TABLE_DATA });
        container.appendChild(this._table.el);
    }

    onDestroy(): void {
        this._table?.dispose();
        this._table = null;
    }
}

class HideColumnTableDemo extends Component {
    static type = 'hide-column-table-demo';
    _table: TableComponent | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__column',
            children: [
                {
                    tag: 'div',
                    classes: 'q-demo__controls',
                    children: [
                        { tag: 'button', name: 'toggleAge', classes: 'q-demo__btn', options: { text: '隐藏/显示 年龄列' } },
                        { tag: 'button', name: 'toggleSalary', classes: 'q-demo__btn', options: { text: '隐藏/显示 薪资列' } },
                    ],
                },
                { tag: 'div', name: 'container', classes: 'q-table' },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('container') as HTMLElement;
        if (!container) return;
        this._table = new TableComponent({ columns: BASIC_COLUMNS, data: TABLE_DATA });
        container.appendChild(this._table.el);

        const toggleAgeBtn = this.getNodeEl('toggleAge');
        const toggleSalaryBtn = this.getNodeEl('toggleSalary');
        let ageHidden = false;
        let salaryHidden = false;

        this.bind(toggleAgeBtn, 'click');
        this.on('dom:click', (e: any) => {
            if (e?.target === toggleAgeBtn || toggleAgeBtn?.contains(e?.target)) {
                ageHidden = !ageHidden;
                if (ageHidden) this._table?.hideColumn('age');
                else this._table?.showColumn('age');
            }
        });
        this.bind(toggleSalaryBtn, 'click');
        this.on('dom:click', (e: any) => {
            if (e?.target === toggleSalaryBtn || toggleSalaryBtn?.contains(e?.target)) {
                salaryHidden = !salaryHidden;
                if (salaryHidden) this._table?.hideColumn('salary');
                else this._table?.showColumn('salary');
            }
        });
    }

    onDestroy(): void {
        this._table?.dispose();
        this._table = null;
    }
}

export const TABLE_DEMO: DemoConfig = {
    title: 'Table',
    description: '表格组件，option 驱动渲染，支持排序、列拖拽 reorder、隐藏/显示列、分组列头、列宽调整',
    sections: [
        {
            label: '基础表格',
            code: `const columns = [
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    { name: 'dept', field: 'dept', title: '部门', width: 120 },
];
const table = new TableComponent({ columns, data });`,
            component: BasicTableDemo,
        },
        {
            label: '排序（点击表头排序）',
            code: `{ name: 'age', field: 'age', title: '年龄', sortable: true }
// 点击表头切换 asc → desc → none`,
            component: SortableTableDemo,
        },
        {
            label: '列拖拽 reorder + resize',
            code: `{ name: 'name', title: '姓名', reorderable: true, resizable: true }
// 拖拽表头单元格交换列位置，拖拽右侧手柄调整列宽`,
            component: ReorderableTableDemo,
        },
        {
            label: '分组列头（多表头）',
            code: `{
    name: 'baseInfo', title: '基本信息', children: [
        { name: 'age', field: 'age', title: '年龄' },
        { name: 'dept', field: 'dept', title: '部门' },
    ]
}`,
            component: GroupedTableDemo,
        },
        {
            label: '隐藏/显示列',
            code: `table.hideColumn('age');
table.showColumn('age');`,
            component: HideColumnTableDemo,
        },
    ],
};
