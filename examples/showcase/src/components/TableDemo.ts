import type { DemoConfig } from './types';
import { Component, type TemplateDecl } from '@qimenjs/component-core';
import { TableComponent, TableSummaryRowComponent } from '@qimenjs/component';
import type { ColumnDefOrGroup } from '@qimenjs/component';
import '@/component/table/row/row.css';
import '@/component/table/header/header.css';

const TABLE_DATA = [
    { name: '张三', age: 28, salary: 15000, dept: '技术部' },
    { name: '李四', age: 35, salary: 22000, dept: '市场部' },
    { name: '王五', age: 42, salary: 30000, dept: '管理层' },
    { name: '赵六', age: 24, salary: 8000, dept: '技术部' },
    { name: '孙七', age: 31, salary: 18000, dept: '市场部' },
];

const COMPREHENSIVE_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120, sortable: true, reorderable: true },
    {
        name: 'baseInfo',
        title: '基本信息',
        children: [
            { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', sortable: true, reorderable: true },
            { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center', sortable: true, groupable: true, groupAggregator: 'label', reorderable: true },
        ],
    },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', sortable: true, groupAggregator: 'sum', reorderable: true },
];

class ComprehensiveTableDemo extends Component {
    static type = 'comprehensive-table-demo';
    _table: TableComponent | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__column',
            children: [
                { tag: 'div', name: 'container', classes: 'q-table' },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('container') as HTMLElement;
        if (!container) return;
        this._table = new TableComponent({ columns: COMPREHENSIVE_COLUMNS, data: TABLE_DATA, groupField: 'dept' });
        container.appendChild(this._table.el);
    }

    onDestroy(): void {
        this._table?.dispose();
        this._table = null;
    }
}

const SUMMARY_DATA = [
    { product: '笔记本电脑', q1: 120, q2: 150, q3: 180, q4: 200 },
    { product: '手机', q1: 300, q2: 280, q3: 320, q4: 350 },
    { product: '平板', q1: 80, q2: 90, q3: 110, q4: 130 },
    { product: '耳机', q1: 200, q2: 220, q3: 250, q4: 280 },
];

const SUMMARY_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'product', field: 'product', title: '产品', width: 140, sortable: true },
    { name: 'q1', field: 'q1', title: 'Q1', width: 100, align: 'right', sortable: true },
    { name: 'q2', field: 'q2', title: 'Q2', width: 100, align: 'right', sortable: true },
    { name: 'q3', field: 'q3', title: 'Q3', width: 100, align: 'right', sortable: true },
    { name: 'q4', field: 'q4', title: 'Q4', width: 100, align: 'right', sortable: true },
];

function computeColumnSummary(data: any[], columns: ColumnDefOrGroup[]): Record<string, any> {
    const summary: Record<string, any> = {};
    for (const col of columns) {
        if ('children' in col) continue;
        const field = (col as any).field;
        if (!field) continue;
        const values = data.map(row => row[field]).filter(v => typeof v === 'number');
        if (values.length > 0) {
            summary[(col as any).name] = values.reduce((sum, v) => sum + v, 0);
        }
    }
    summary.product = '合计';
    return summary;
}

class SummaryTableDemo extends Component {
    static type = 'summary-table-demo';
    _table: TableComponent | null = null;
    _summaryRow: any = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__column',
            children: [
                { tag: 'div', name: 'container', classes: 'q-table' },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('container') as HTMLElement;
        if (!container) return;

        this._table = new TableComponent({ columns: SUMMARY_COLUMNS, data: SUMMARY_DATA });
        container.appendChild(this._table.el);

        this._table.ready.then(() => {
            const columnMetas = this._table!._columnMetaManager?.getAll() ?? [];
            const summaryData = computeColumnSummary(SUMMARY_DATA, SUMMARY_COLUMNS);
            this._summaryRow = new TableSummaryRowComponent({ columnMetas });
            this._summaryRow.update(summaryData);
            this._table!.el.appendChild(this._summaryRow.el);
        });
    }

    onDestroy(): void {
        this._summaryRow?.dispose?.();
        this._summaryRow = null;
        this._table?.dispose();
        this._table = null;
    }
}

export const TABLE_DEMO: DemoConfig = {
    title: 'Table',
    description: '表格组件 — 综合演示：排序、分组列头、列拖拽重排序、列宽调整、统计行',
    sections: [
        {
            label: '综合表格',
            code: `const columns = [
    { name: 'name', field: 'name', title: '姓名', width: 120, sortable: true, reorderable: true },
    {
        name: 'baseInfo', title: '基本信息', children: [
            { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', sortable: true, reorderable: true },
            { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center', sortable: true, groupable: true, groupAggregator: 'label', reorderable: true },
        ]
    },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', sortable: true, groupAggregator: 'sum', reorderable: true },
];
const table = new TableComponent({ columns, data, groupField: 'dept' });

// 点击表头排序（sortable 列）
// 拖拽表头列重排序（reorderable 列）
// 拖拽表头边缘调整列宽（resizable 列）
// 表头菜单：分组（groupable 列）、隐藏/显示列`,
            component: ComprehensiveTableDemo,
        },
        {
            label: '列统计行',
            code: `const columns = [
    { name: 'product', field: 'product', title: '产品', width: 140 },
    { name: 'q1', field: 'q1', title: 'Q1', width: 100, align: 'right' },
    { name: 'q2', field: 'q2', title: 'Q2', width: 100, align: 'right' },
    { name: 'q3', field: 'q3', title: 'Q3', width: 100, align: 'right' },
    { name: 'q4', field: 'q4', title: 'Q4', width: 100, align: 'right' },
];
const table = new TableComponent({ columns, data });

// 使用 TableSummaryRowComponent 在表格底部显示各列合计`,
            component: SummaryTableDemo,
        },
    ],
};
