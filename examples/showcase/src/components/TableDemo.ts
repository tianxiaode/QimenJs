import type { DemoConfig } from './types';
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

const SUMMARY_DATA = [
    { product: '笔记本电脑', q1: 120, q2: 150, q3: 180, q4: 200 },
    { product: '手机', q1: 300, q2: 280, q3: 320, q4: 350 },
    { product: '平板', q1: 80, q2: 90, q3: 110, q4: 130 },
    { product: '耳机', q1: 200, q2: 220, q3: 250, q4: 280 },
];

const SUMMARY_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'product', field: 'product', title: '产品', width: 140, sortable: true, summary: { label: '合计' } },
    { name: 'q1', field: 'q1', title: 'Q1', width: 100, align: 'right', sortable: true, summary: { aggregator: 'sum' } },
    { name: 'q2', field: 'q2', title: 'Q2', width: 100, align: 'right', sortable: true, summary: { aggregator: 'sum' } },
    { name: 'q3', field: 'q3', title: 'Q3', width: 100, align: 'right', sortable: true, summary: { aggregator: 'sum' } },
    { name: 'q4', field: 'q4', title: 'Q4', width: 100, align: 'right', sortable: true, summary: { aggregator: 'sum' } },
];

export const TABLE_DEMO: DemoConfig = {
    title: 'Table',
    description: '表格组件 — 综合演示：排序、分组列头、列拖拽重排序、列宽调整、列统计行',
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
    ],
};
