import type { DemoConfig } from './types';
import { Component, type TemplateDecl } from '@qimenjs/component-core';
import { ColumnMetaManager } from '@/component/table/engine/ColumnMetaManager';
import { TableEngine } from '@/component/table/engine/TableEngine';
import type { ColumnDef } from '@/component/table/column-types';
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

function buildTable(container: HTMLElement, columns: ColumnDef[], data: any[]): void {
    const mgr = new ColumnMetaManager();
    mgr.compile(columns);
    const compiled = TableEngine.compile(mgr);

    const header = new compiled.HeaderClass();
    container.appendChild(header.el);

    for (const row of data) {
        const rowComp = new compiled.RowClass();
        container.appendChild(rowComp.el);
        rowComp.update(row);
    }
}

const BASIC_TABLE_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-demo__row',
    children: [{ tag: 'div', name: 'container', classes: 'q-table' }],
};

class BasicTableDemo extends Component {
    static type = 'basic-table-demo';
    get tpl(): TemplateDecl { return BASIC_TABLE_TPL; }

    onAfterInit(): void {
        const container = this.getNodeEl('container') as HTMLElement;
        if (container) buildTable(container, BASIC_COLUMNS, TABLE_DATA);
    }
}

const FORMATTED_TABLE_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-demo__row',
    children: [{ tag: 'div', name: 'container', classes: 'q-table' }],
};

class FormattedTableDemo extends Component {
    static type = 'formatted-table-demo';
    get tpl(): TemplateDecl { return FORMATTED_TABLE_TPL; }

    onAfterInit(): void {
        const container = this.getNodeEl('container') as HTMLElement;
        if (container) buildTable(container, FORMATTED_COLUMNS, TABLE_DATA);
    }
}

export const TABLE_DEMO: DemoConfig = {
    title: 'Table',
    description: '表格组件，通过 ColumnMetaManager + TableEngine 编译列定义生成行/表头组件，支持格式化、对齐、排序',
    sections: [
        {
            label: '基础表格',
            code: `const columns = [
    { name: 'name', field: 'name', title: '姓名' },
    { name: 'age', field: 'age', title: '年龄', align: 'right' },
    { name: 'salary', field: 'salary', title: '薪资', align: 'right', format: 'currency' },
    { name: 'dept', field: 'dept', title: '部门' },
];
const mgr = new ColumnMetaManager();
mgr.compile(columns);
const compiled = TableEngine.compile(mgr);`,
            component: BasicTableDemo,
        },
        {
            label: '格式化列 (format: currency)',
            code: `{ name: 'salary', field: 'salary', title: '薪资', align: 'right', format: 'currency' }`,
            component: FormattedTableDemo,
        },
    ],
};
