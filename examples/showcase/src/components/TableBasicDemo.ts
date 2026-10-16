import { type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import type { ColumnDefOrGroup } from '@qimenjs/component';
import {
    TABLE_DATA,
    COMPREHENSIVE_COLUMNS,
    SUMMARY_DATA,
    SUMMARY_COLUMNS,
} from './table-demo-data';

const I18N_DATA = [
    { id: 1, name: '张三', age: 28, dept: '技术部', salary: 15000 },
    { id: 2, name: '李四', age: 35, dept: '市场部', salary: 22000 },
    { id: 3, name: '王五', age: 42, dept: '管理层', salary: 30000 },
];

const I18N_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', displayKey: 'name', width: 120 },
    { name: 'age', field: 'age', displayKey: 'age', width: 80, align: 'right' },
    { name: 'dept', field: 'dept', displayKey: 'dept', width: 120, align: 'center' },
    { name: 'salary', field: 'salary', displayKey: 'salary', width: 120, align: 'right', format: 'currency' },
];

const ENUM_MAP_DATA = [
    { id: 1, name: '张三', dept: '技术部', status: 'active' },
    { id: 2, name: '李四', dept: '市场部', status: 'on_leave' },
    { id: 3, name: '王五', dept: '管理层', status: 'active' },
    { id: 4, name: '赵六', dept: '技术部', status: 'inactive' },
];

const ENUM_MAP_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', displayKey: 'name', width: 120 },
    { name: 'dept', field: 'dept', displayKey: 'dept', width: 120, align: 'center' },
    {
        name: 'status',
        field: 'status',
        displayKey: 'status',
        width: 100,
        align: 'center',
        enumMap: {
            active: '@employee.statusActive',
            inactive: '@employee.statusInactive',
            on_leave: '@employee.statusOnLeave',
        },
    },
];

export const TABLE_BASIC_DEMO: DemoConfig = {
    title: 'Table 基础',
    description: '表格基础功能 — 排序、分组列头、列拖拽重排序、列宽调整、列统计行、列标题本地化、枚举值本地化',
    sections: [
        {
            label: '综合表格',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'name', field: 'name', title: '姓名', width: 120, sortable: true, draggable: true },
        { name: 'baseInfo', title: '基本信息', children: [
            { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right', sortable: true, draggable: true },
            { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center', sortable: true, groupable: true, draggable: true },
        ]},
        { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency', sortable: true, draggable: true },
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
            label: '列标题本地化（i18nScope + displayKey）',
            code: `{ type: 'table', options: {
    i18nScope: 'employee',   // 统一 scope 前缀
    columns: [
        { name: 'name', field: 'name', displayKey: 'name', ... },  // title 走 @employee.name
        { name: 'age',  displayKey: 'age', ... },
    ],
    data: [...],
} }
// displayKey 配置后优先于 title；未配置的列 title 保持纯文本
// 语言切换时表头自动刷新`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            i18nScope: 'employee',
                            columns: I18N_COLUMNS,
                            data: I18N_DATA,
                        },
                    },
                ],
            },
        },
        {
            label: '枚举值本地化（enumMap + i18n）',
            code: `{ type: 'table', options: {
    i18nScope: 'employee',
    columns: [
        { name: 'name', field: 'name', displayKey: 'name' },
        { name: 'status', field: 'status', displayKey: 'status',
          enumMap: {
            active: '@employee.statusActive',
            inactive: '@employee.statusInactive',
            on_leave: '@employee.statusOnLeave',
          }
        },
    ],
    data: [{ status: 'active' }, { status: 'on_leave' }, ...],
} }
// enumMap 优先于 format：命中映射值后走 setNodeText 自动翻译
// 未命中的值 fallback 到原始值
// 语言切换时单元格自动刷新`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            i18nScope: 'employee',
                            columns: ENUM_MAP_COLUMNS,
                            data: ENUM_MAP_DATA,
                        },
                    },
                ],
            },
        },
    ],
};
