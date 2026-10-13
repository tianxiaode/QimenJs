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
    { name: 'name', field: 'name', title: '姓名', width: 120, sortable: true, draggable: true },
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
                draggable: true,
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
                draggable: true,
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
        draggable: true,
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

const ROWNUMBER_COLUMNS: ColumnDefOrGroup[] = [
    { name: '#', cellType: 'rownumber' },
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

const ROWNUMBER_DATA = [
    { id: 1, name: '张三', age: 28, salary: 15000, dept: '技术部' },
    { id: 2, name: '李四', age: 35, salary: 22000, dept: '市场部' },
    { id: 3, name: '王五', age: 42, salary: 30000, dept: '管理层' },
    { id: 4, name: '赵六', age: 24, salary: 8000, dept: '技术部' },
    { id: 5, name: '孙七', age: 31, salary: 18000, dept: '市场部' },
    { id: 6, name: '周八', age: 26, salary: 12000, dept: '技术部' },
    { id: 7, name: '吴九', age: 38, salary: 25000, dept: '管理层' },
    { id: 8, name: '郑十', age: 29, salary: 16000, dept: '市场部' },
    { id: 9, name: '钱十一', age: 33, salary: 20000, dept: '技术部' },
    { id: 10, name: '冯十二', age: 27, salary: 14000, dept: '市场部' },
    { id: 11, name: '陈十三', age: 45, salary: 35000, dept: '管理层' },
    { id: 12, name: '褚十四', age: 22, salary: 9000, dept: '技术部' },
];

const FIXED_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'check', cellType: 'checkbox', selection: true, width: 40, align: 'center', fixed: 'left' },
    { name: 'name', field: 'name', title: '姓名', width: 120, fixed: 'left' },
    { name: 'empNo', field: 'empNo', title: '工号', width: 100, align: 'center' },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    { name: 'hireDate', field: 'hireDate', title: '入职日期', width: 120, align: 'center' },
    { name: 'email', field: 'email', title: '邮箱', width: 180 },
    { name: 'phone', field: 'phone', title: '电话', width: 130 },
    { name: 'address', field: 'address', title: '地址', width: 200 },
    { name: 'status', field: 'status', title: '状态', width: 100, align: 'center', fixed: 'right' },
];

const FIXED_DATA = [
    { id: 1, name: '张三', empNo: 'E001', age: 28, salary: 15000, dept: '技术部', hireDate: '2023-03', email: 'zhangsan@co.com', phone: '138-0001', address: '北京市海淀区', status: '在职' },
    { id: 2, name: '李四', empNo: 'E002', age: 35, salary: 22000, dept: '市场部', hireDate: '2021-06', email: 'lisi@co.com', phone: '139-0002', address: '上海市浦东区', status: '在职' },
    { id: 3, name: '王五', empNo: 'E003', age: 42, salary: 30000, dept: '管理层', hireDate: '2019-01', email: 'wangwu@co.com', phone: '137-0003', address: '深圳市南山区', status: '离职' },
    { id: 4, name: '赵六', empNo: 'E004', age: 24, salary: 8000, dept: '技术部', hireDate: '2024-07', email: 'zhaoliu@co.com', phone: '136-0004', address: '杭州市西湖区', status: '在职' },
    { id: 5, name: '孙七', empNo: 'E005', age: 31, salary: 18000, dept: '市场部', hireDate: '2022-09', email: 'sunqi@co.com', phone: '135-0005', address: '广州市天河区', status: '在职' },
    { id: 6, name: '周八', empNo: 'E006', age: 26, salary: 12000, dept: '技术部', hireDate: '2023-11', email: 'zhouba@co.com', phone: '134-0006', address: '成都市武侯区', status: '离职' },
    { id: 7, name: '吴九', empNo: 'E007', age: 38, salary: 25000, dept: '管理层', hireDate: '2020-04', email: 'wujiu@co.com', phone: '133-0007', address: '武汉市洪山区', status: '在职' },
    { id: 8, name: '郑十', empNo: 'E008', age: 29, salary: 16000, dept: '市场部', hireDate: '2022-12', email: 'zhengshi@co.com', phone: '132-0008', address: '南京市鼓楼区', status: '在职' },
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

export const TABLE_DEMO: DemoConfig = {
    title: 'Table',
    description: '表格组件 — 综合演示：排序、分组列头、列拖拽重排序、列宽调整、列统计行、行选择',
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
        } satisfies DemoSection,
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
        {
            label: '固定列（左右）',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'check', cellType: 'checkbox', selection: true, width: 40, fixed: 'left' },
        { name: 'name', field: 'name', title: '姓名', width: 120, fixed: 'left' },
        { name: 'empNo', field: 'empNo', title: '工号', width: 100 },
        { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
        { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
        { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
        { name: 'hireDate', field: 'hireDate', title: '入职日期', width: 120 },
        { name: 'email', field: 'email', title: '邮箱', width: 180 },
        { name: 'phone', field: 'phone', title: '电话', width: 130 },
        { name: 'address', field: 'address', title: '地址', width: 200 },
        { name: 'status', field: 'status', title: '状态', width: 100, fixed: 'right' },
    ],
    data: [...],
    selectable: 'multiple',
} }

// fixed: 'left' — 列固定在左侧，水平滚动时不移动
// fixed: 'right' — 列固定在右侧
// 多列固定时偏移量自动叠加（第二列左固定偏移 = 第一列宽度）
// 固定列边界有 shadow 视觉分隔`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: FIXED_COLUMNS,
                            data: FIXED_DATA,
                            selectable: 'multiple',
                        },
                    },
                ],
            },
        },
        {
            label: '自定义行背景',
            code: `{ type: 'table', options: {
    columns: [...],
    data: [...],
    stripe: false,
    rowBg: '#e8f5e9',
} }

// stripe: false — 禁用条纹，所有行统一背景色
// rowBg: '#e8f5e9' — 自定义行背景色（奇数行/无条纹时）
// stripeBg: '#c8e6c9' — 自定义条纹背景色（偶数行，stripe:true 时生效）
// 固定列自动跟随行背景色变化`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: FIXED_COLUMNS,
                            data: FIXED_DATA,
                            selectable: 'multiple',
                            stripe: false,
                            rowBg: '#e8f5e9',
                        },
                    },
                ],
            },
        },
    ],
};
