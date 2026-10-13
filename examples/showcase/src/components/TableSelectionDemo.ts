import { Component, ListenItem, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import {
    TABLE_DATA,
    CHECKBOX_SELECT_COLUMNS,
    RADIO_SELECT_COLUMNS,
    ROWNUMBER_COLUMNS,
    ROWNUMBER_DATA,
    DISABLED_SELECT_DATA,
    ROW_CLICK_COLUMNS,
} from './table-demo-data';

class RowSelectDemo extends Component {
    get tpl(): TemplateDecl {
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

    listens: ListenItem[] = [{ node: 'btnGroup', events: { select: '_onToggleSelectMode' } }];

    _onToggleSelectMode(data: any) {
        const table = this.getComponent('table');
        if (!table) return;
        const ctx = data?.data ?? data;
        const index = ctx?.index ?? ctx?.lastToggleIndex ?? ctx?.selectedIndex;
        if (index === 0) {
            table.selectable = 'single';
        } else if (index === 1) {
            table.selectable = 'multiple';
        }
    }
}

export const TABLE_SELECTION_DEMO: DemoConfig = {
    title: 'Table 行选择',
    description: '表格行选择功能 — 多选、单选、行号列、行点击选择、禁选行',
    sections: [
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
// 表头显示全选 checkbox，点击行也可选中
// checkbox 列默认禁止调整列宽（resizable: false）`,
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
// cellType: 'radio' — 单选框选择列
// radio 列默认禁止调整列宽（resizable: false）`,
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
            label: '行号列',
            code: `{ type: 'table', options: {
    columns: [
        { name: '#', cellType: 'rownumber' },
        { name: 'check', cellType: 'checkbox', selection: true, width: 40 },
        { name: 'name', field: 'name', title: '姓名', width: 120 },
        { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
        { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
        { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    ],
    data: [...],
    selectable: 'multiple',
} }

// cellType: 'rownumber' — 行号列，自动显示行序号（从1开始）
// 行号列默认禁止调整列宽（resizable: false）和菜单（menuDisabled: true）
// 列宽自动适配：根据总行数位数动态计算（1位数40px，2位数48px...）
// checkbox/radio/rownumber 列均默认禁止 resize`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: ROWNUMBER_COLUMNS,
                            data: ROWNUMBER_DATA,
                            selectable: 'multiple',
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
        },
        {
            label: '禁选行（数据标记）',
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
        {
            label: '禁选行（函数配置）',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'check', cellType: 'checkbox', selection: true, width: 40 },
        { name: 'name', field: 'name', title: '姓名', width: 120 },
        { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
        { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    ],
    data: [...],
    selectable: 'multiple',
    selectDisabled: (row) => row.dept === '管理层',
} }

// selectDisabled: (row) => boolean — 函数式禁选配置
// 对每行数据求值，返回 true 则该行禁止选择
// 无需在数据中添加 _selectDisabled 标记`,
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
                            selectDisabled: (row: any) => row.dept === '管理层',
                        },
                    },
                ],
            },
        },
    ],
};
