import type { DemoConfig } from './types';
import { Component, type TemplateDecl } from '@qimenjs/component-core';
import { TableComponent } from '@qimenjs/component';
import type { ColumnDef } from '@qimenjs/component';
import '@/component/table/row/row.css';
import '@/component/table/header/header.css';

const TABLE_DATA = [
    { name: '张三', age: 28, salary: 15000, dept: '技术部' },
    { name: '李四', age: 35, salary: 22000, dept: '市场部' },
    { name: '王五', age: 42, salary: 30000, dept: '管理层' },
    { name: '赵六', age: 24, salary: 8000, dept: '技术部' },
];

const BASIC_COLUMNS: ColumnDef[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    { name: 'dept', field: 'dept', title: '部门', width: 120 },
];

const FORMATTED_COLUMNS: ColumnDef[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'salary', field: 'salary', title: '薪资', width: 140, align: 'right', format: 'currency' },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
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

class FormattedTableDemo extends Component {
    static type = 'formatted-table-demo';
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
        this._table = new TableComponent({ columns: FORMATTED_COLUMNS, data: TABLE_DATA });
        container.appendChild(this._table.el);
    }

    onDestroy(): void {
        this._table?.dispose();
        this._table = null;
    }
}

export const TABLE_DEMO: DemoConfig = {
    title: 'Table',
    description: '表格组件，通过 columns/data option 驱动渲染，支持格式化、对齐、列隐藏/显示/排序',
    sections: [
        {
            label: '基础表格',
            code: `const columns = [
    { name: 'name', field: 'name', title: '姓名' },
    { name: 'age', field: 'age', title: '年龄', align: 'right' },
    { name: 'salary', field: 'salary', title: '薪资', align: 'right', format: 'currency' },
    { name: 'dept', field: 'dept', title: '部门' },
];
const table = new TableComponent({ columns, data });`,
            component: BasicTableDemo,
        },
        {
            label: '格式化列 (format: currency)',
            code: `{ name: 'salary', field: 'salary', title: '薪资', align: 'right', format: 'currency' }`,
            component: FormattedTableDemo,
        },
    ],
};
