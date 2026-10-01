import type { DemoConfig } from './types';
import { Component, type TemplateDecl } from '@qimenjs/component-core';
import { TableComponent } from '@qimenjs/component';
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
    { name: 'name', field: 'name', title: '姓名', width: 120, sortable: true },
    {
        name: 'baseInfo',
        title: '基本信息',
        children: [
            { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', sortable: true },
            { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center', sortable: true, groupable: true, groupAggregator: 'label' },
        ],
    },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', sortable: true, groupAggregator: 'sum' },
];

class ComprehensiveTableDemo extends Component {
    static type = 'comprehensive-table-demo';
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
                        { tag: 'button', name: 'swapColumns', classes: 'q-demo__btn', options: { text: '交换 姓名←→薪资' } },
                    ],
                },
                { tag: 'div', name: 'container', classes: 'q-table' },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('container') as HTMLElement;
        if (!container) return;
        this._table = new TableComponent({ columns: COMPREHENSIVE_COLUMNS, data: TABLE_DATA, groupField: 'dept' });
        container.appendChild(this._table.el);

        const toggleAgeBtn = this.getNodeEl('toggleAge');
        const swapColumnsBtn = this.getNodeEl('swapColumns');
        let ageHidden = false;

        this.bind(toggleAgeBtn, 'click');
        this.on('dom:click', (e: any) => {
            if (e?.target === toggleAgeBtn || toggleAgeBtn?.contains(e?.target)) {
                ageHidden = !ageHidden;
                if (ageHidden) this._table?.hideColumn('age');
                else this._table?.showColumn('age');
            }
        });
        this.bind(swapColumnsBtn, 'click');
        this.on('dom:click', (e: any) => {
            if (e?.target === swapColumnsBtn || swapColumnsBtn?.contains(e?.target)) {
                this._table?.moveColumn(0, 3);
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
    description: '表格组件 — 综合演示：排序、分组列头、隐藏/显示列、交换列位置、列宽调整',
    sections: [
        {
            label: '综合表格',
            code: `const columns = [
    { name: 'name', field: 'name', title: '姓名', width: 120, sortable: true },
    {
        name: 'baseInfo', title: '基本信息', children: [
            { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', sortable: true },
            { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center', sortable: true, groupable: true, groupAggregator: 'label' },
        ]
    },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', sortable: true, groupAggregator: 'sum' },
];
const table = new TableComponent({ columns, data, groupField: 'dept' });

// 点击表头排序（sortable 列）
// 表头菜单：分组（groupable 列）、隐藏/显示列
// 拖拽表头边缘调整列宽（resizable 列）
// table.hideColumn('age') / table.showColumn('age')
// table.moveColumn(0, 3)`,
            component: ComprehensiveTableDemo,
        },
    ],
};
