import { Component, ListenItem, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig, DemoSection } from './types';
import type { ColumnDefOrGroup } from '@qimenjs/component';
import '@/component/table/row/row.css';
import '@/component/table/header/header.css';

const TABLE_DATA = [
    { id: 1, name: '张三', age: 28, salary: 15000, dept: '技术部' },
    { id: 2, name: '李四', age: 35, salary: 22000, dept: '市场部' },
    { id: 3, name: '王五', age: 42, salary: 30000, dept: '管理层' },
    { id: 4, name: '赵六', age: 24, salary: 8000, dept: '技术部' },
    { id: 5, name: '孙七', age: 31, salary: 18000, dept: '市场部' },
];

const COMPREHENSIVE_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120, sortable: true, reorderable: true },
    {
        name: 'baseInfo',
        title: '基本信息',
        children: [
            {
                name: 'age',
                field: 'age',
                title: '年龄',
                width: 80,
                align: 'right',
                sortable: true,
                reorderable: true,
            },
            {
                name: 'dept',
                field: 'dept',
                title: '部门',
                width: 120,
                align: 'center',
                sortable: true,
                groupable: true,
                groupAggregator: 'label',
                reorderable: true,
            },
        ],
    },
    {
        name: 'salary',
        field: 'salary',
        title: '薪资',
        width: 120,
        align: 'right',
        format: 'currency',
        sortable: true,
        groupAggregator: 'sum',
        reorderable: true,
    },
];

const SUMMARY_DATA = [
    { product: '笔记本电脑', q1: 120, q2: 150, q3: 180, q4: 200 },
    { product: '手机', q1: 300, q2: 280, q3: 320, q4: 350 },
    { product: '平板', q1: 80, q2: 90, q3: 110, q4: 130 },
    { product: '耳机', q1: 200, q2: 220, q3: 250, q4: 280 },
];

const SUMMARY_COLUMNS: ColumnDefOrGroup[] = [
    {
        name: 'product',
        field: 'product',
        title: '产品',
        width: 140,
        sortable: true,
        summary: { label: '合计' },
    },
    {
        name: 'q1',
        field: 'q1',
        title: 'Q1',
        width: 100,
        align: 'right',
        sortable: true,
        summary: { aggregator: 'sum' },
    },
    {
        name: 'q2',
        field: 'q2',
        title: 'Q2',
        width: 100,
        align: 'right',
        sortable: true,
        summary: { aggregator: 'sum' },
    },
    {
        name: 'q3',
        field: 'q3',
        title: 'Q3',
        width: 100,
        align: 'right',
        sortable: true,
        summary: { aggregator: 'sum' },
    },
    {
        name: 'q4',
        field: 'q4',
        title: 'Q4',
        width: 100,
        align: 'right',
        sortable: true,
        summary: { aggregator: 'sum' },
    },
];

const CHECKBOX_SELECT_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'check', cellType: 'checkbox', selection: true, width: 40, align: 'center' },
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
    {
        name: 'salary',
        field: 'salary',
        title: '薪资',
        width: 120,
        align: 'right',
        format: 'currency',
    },
];

const RADIO_SELECT_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'select', cellType: 'radio', selection: true, width: 40, align: 'center' },
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
    {
        name: 'salary',
        field: 'salary',
        title: '薪资',
        width: 120,
        align: 'right',
        format: 'currency',
    },
];

const DISABLED_SELECT_DATA = [
    { id: 1, name: '张三', age: 28, salary: 15000, dept: '技术部' },
    { id: 2, name: '李四', age: 35, salary: 22000, dept: '市场部', _selectDisabled: true },
    { id: 3, name: '王五', age: 42, salary: 30000, dept: '管理层' },
    { id: 4, name: '赵六', age: 24, salary: 8000, dept: '技术部', _selectDisabled: true },
    { id: 5, name: '孙七', age: 31, salary: 18000, dept: '市场部' },
];

const ROW_CLICK_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
    {
        name: 'salary',
        field: 'salary',
        title: '薪资',
        width: 120,
        align: 'right',
        format: 'currency',
    },
];

class RowSelectDemo extends Component {
    onBeforeInit(): void {
        console.log('[RowSelectDemo] onBeforeInit');
    }

    get tpl(): TemplateDecl {
        console.log('[RowSelectDemo] tpl getter called');
        return {
            tag: 'div',
            classes: 'q-demo__column',
            children: [
                {
                    type: 'button-group',
                    name: 'btnGroup',
                    options: {
                        mode: 'single',
                        selectedIndex: 0,
                        items: [
                            { text: '单选', value: 'single' },
                            { text: '多选', value: 'multiple' },
                        ],
                    },
                },
                {
                    type: 'table',
                    name: 'table',
                    options: {
                        columns: ROW_CLICK_COLUMNS,
                        data: TABLE_DATA,
                        selectable: 'single',
                    },
                },
            ],
        };
    }

    listens?: ListenItem[] | undefined = [
        { node: 'btnGroup', events: { select: '_onToggelSelectMode' } },
    ];

    onAfterInit(): void {
        const btnGroup = this.getComponent('btnGroup');
        const table = this.getComponent('table');
        super.onAfterInit();
        if (btnGroup) {
            btnGroup.on('select', (data: any) => {
                console.log('[RowSelectDemo] btnGroup select event', data);
                if (data.index === 0) {
                    table && (table.selectable = 'single');
                } else if (data.index === 1) {
                    table && (table.selectable = 'multiple');
                }
            });
            console.log('[RowSelectDemo] btnGroup count:', btnGroup.count);
            if (btnGroup.el) {
                btnGroup.el.addEventListener('click', (e) => {
                    console.log('[RowSelectDemo] btnGroup DOM click', e.target);
                });
            }
            for (let i = 0; i < btnGroup.count; i++) {
                const btn = btnGroup.getAt?.(i);
                if (btn?.el) {
                    btn.el.addEventListener('click', (e) => {
                        console.log(`[RowSelectDemo] btn[${i}] DOM click`, btn.pressed);
                    });
                }
            }
        } else {
            console.warn('[RowSelectDemo] btnGroup not found!');
        }
    }

    _onToggelSelectMode(data: any) {
        console.log('[RowSelectDemo] _onToggelSelectMode', data);
        const table = this.getComponent('table');
        if (!table) return;
        if (data.index === 0) {
            table.selectable = 'single';
        } else if (data.index === 1) {
            table.selectable = 'multiple';
        }
    }
}

export const TABLE_DEMO: DemoConfig = {
    title: 'Table',
    description: '表格组件 — 综合演示：排序、分组列头、列拖拽重排序、列宽调整、列统计行、行选择',
    sections: [
        {
            label: '综合表格',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'name', field: 'name', title: '姓名', width: 120, sortable: true, reorderable: true },
        { name: 'baseInfo', title: '基本信息', children: [
            { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', sortable: true, reorderable: true },
            { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center', sortable: true, groupable: true, reorderable: true },
        ]},
        { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', sortable: true, reorderable: true },
    ],
    data: [...],
    groupField: 'dept',
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: COMPREHENSIVE_COLUMNS,
                            data: TABLE_DATA,
                            groupField: 'dept',
                        },
                    },
                ],
            },
        },
        {
            label: '列统计行',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'product', field: 'product', title: '产品', summary: { label: '合计' } },
        { name: 'q1', field: 'q1', title: 'Q1', align: 'right', summary: { aggregator: 'sum' } },
        { name: 'q2', field: 'q2', title: 'Q2', align: 'right', summary: { aggregator: 'sum' } },
        { name: 'q3', field: 'q3', title: 'Q3', align: 'right', summary: { aggregator: 'sum' } },
        { name: 'q4', field: 'q4', title: 'Q4', align: 'right', summary: { aggregator: 'sum' } },
    ],
    data: [...],
} }

// summary.label = 显示固定文字（如 "合计"）
// summary.aggregator = 计算聚合值（sum/avg/count/min/max）`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: SUMMARY_COLUMNS,
                            data: SUMMARY_DATA,
                        },
                    },
                ],
            },
        },
        {
            label: '多选（checkbox）',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'check', cellType: 'checkbox', selection: true, width: 40 },
        { name: 'name', field: 'name', title: '姓名', width: 120 },
        { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
        { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    ],
    data: [...],
    selectable: 'multiple',
} }

// selectable: 'multiple' — 多选模式
// selection: true — 标记该列为选择列
// 表头显示全选 checkbox，点击行也可选中`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: CHECKBOX_SELECT_COLUMNS,
                            data: TABLE_DATA,
                            selectable: 'multiple',
                        },
                    },
                ],
            },
        },
        {
            label: '单选（radio）',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'select', cellType: 'radio', selection: true, width: 40 },
        { name: 'name', field: 'name', title: '姓名', width: 120 },
        { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
        { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    ],
    data: [...],
    selectable: 'single',
} }

// selectable: 'single' — 单选模式
// cellType: 'radio' — 单选框选择列`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: RADIO_SELECT_COLUMNS,
                            data: TABLE_DATA,
                            selectable: 'single',
                        },
                    },
                ],
            },
        },
        {
            label: '行点击选择（无选择列）',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'name', field: 'name', title: '姓名', width: 120 },
        { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
        { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
        { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    ],
    data: [...],
    selectable: 'single',
} }

// selectable: 'single' — 单选模式，无需选择列
// 点击行即可选中，选中行高亮显示
// 也可设为 'multiple' 支持多选`,
            component: RowSelectDemo,
        } satisfies DemoSection,
        {
            label: '禁选行',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'check', cellType: 'checkbox', selection: true, width: 40 },
        { name: 'name', field: 'name', title: '姓名', width: 120 },
        { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
        { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    ],
    data: [
        { id: 1, name: '张三', ... },
        { id: 2, name: '李四', ..., _selectDisabled: true },
        { id: 3, name: '王五', ... },
    ],
    selectable: 'multiple',
} }

// _selectDisabled: true — 该行禁止选择
// checkbox 显示禁用样式，点击行不触发选中`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: CHECKBOX_SELECT_COLUMNS,
                            data: DISABLED_SELECT_DATA,
                            selectable: 'multiple',
                        },
                    },
                ],
            },
        },
    ],
};
