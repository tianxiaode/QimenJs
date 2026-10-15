import type { DemoConfig } from './types';
import type { ColumnDefOrGroup, RowBodyConfig } from '@qimenjs/component';

const ROW_BODY_DATA = [
    { id: 1, name: '张三', age: 28, salary: 15000, dept: '技术部', email: 'zhangsan@co.com', phone: '138-0001', address: '北京市海淀区中关村南大街5号', status: '在职', joinDate: '2022-03-15', level: 'P5', manager: '赵总监', projectCount: 8, lastReview: '2024-Q4 优秀', skills: ['前端', '后端', '架构'], remote: true },
    { id: 2, name: '李四', age: 35, salary: 22000, dept: '市场部', email: 'lisi@company.com', phone: '139-0002-8888', address: '上海市浦东区陆家嘴金融中心', status: '在职', joinDate: '2019-08-01', level: 'P6', manager: '钱总监', projectCount: 12, lastReview: '2024-Q3 良好', skills: ['策划', '运营'], remote: false },
    { id: 3, name: '王五', age: 42, salary: 30000, dept: '管理层', email: 'wangwu@company.com', phone: '137-0003', address: '深圳市南山区科技园', status: '在职', joinDate: '2015-01-10', level: 'M2', manager: 'CEO', projectCount: 25, lastReview: '2024-Q4 卓越', skills: ['管理', '战略', '投资'], remote: false },
];

const ROW_BODY_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
];

const propertyGridRowBody: RowBodyConfig = {
    type: 'property-grid',
    i18nScope: 'employee',
    fields: [
        { key: 'name', labelKey: 'name' },
        { key: 'age', labelKey: 'age', type: 'number' },
        { key: 'dept', labelKey: 'dept' },
        { key: 'salary', labelKey: 'salary', type: 'number', format: '#,##0' },
        { key: 'email', labelKey: 'email', span: 2 },
        { key: 'phone', labelKey: 'phone' },
        { key: 'address', labelKey: 'address', span: 2 },
    ],
    cols: 2,
};

const longLabelRowBody: RowBodyConfig = {
    type: 'property-grid',
    fields: [
        { key: 'name', labelKey: '姓名' },
        { key: 'status', labelKey: '在职状态' },
        { key: 'joinDate', labelKey: '入职日期' },
        { key: 'level', labelKey: '职级等级' },
        { key: 'manager', labelKey: '直属上级负责人' },
        { key: 'projectCount', labelKey: '负责项目数量', type: 'number' },
        { key: 'lastReview', labelKey: '最近一次绩效评审结果' },
        { key: 'remote', labelKey: '是否远程办公', type: 'boolean' },
        { key: 'skills', labelKey: '专业技能标签', type: 'array', span: 2 },
        { key: 'address', labelKey: '居住地址详细信息', span: 2 },
    ],
    cols: 2,
};

const excludeColumnsRowBody: RowBodyConfig = {
    type: 'property-grid',
    excludeColumns: true,
    cols: 2,
    i18nScope: 'employee',
};

const htmlRowBody: RowBodyConfig = {
    type: 'html',
    html: (data: any) => `
        <div style="padding:8px;">
            <h4 style="margin:0 0 6px;">${data.name} 的详细信息</h4>
            <p style="margin:0;color:#666;">部门: ${data.dept} | 年龄: ${data.age} | 薪资: ¥${data.salary}</p>
            <p style="margin:4px 0 0;color:#666;">邮箱: ${data.email} | 电话: ${data.phone}</p>
            <p style="margin:4px 0 0;color:#666;">地址: ${data.address}</p>
        </div>
    `,
};

const loaderRowBody: RowBodyConfig = {
    type: 'property-grid',
    fields: [
        { key: 'name', labelKey: '姓名' },
        { key: 'dept', labelKey: '部门' },
        { key: 'performance', labelKey: '绩效评分', type: 'number', format: '#,##0' },
        { key: 'projectCount', labelKey: '项目数', type: 'number' },
        { key: 'lastReview', labelKey: '最近评审' },
        { key: 'level', labelKey: '职级' },
    ],
    cols: 2,
    loader: async (_rowId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            performance: 85 + Math.floor(Math.random() * 15),
            projectCount: 3 + Math.floor(Math.random() * 8),
            lastReview: '2024-Q4',
            level: 'P' + (4 + Math.floor(Math.random() * 4)),
        };
    },
    loadingText: '加载详细数据...',
};

const entityRowBody: RowBodyConfig = {
    type: 'property-grid',
    i18nScope: 'employee',
    excludeColumns: true,
    cols: 2,
    entityAction: 'get',
    entityParamField: 'id',
    loadingText: '加载详细数据...',
};

export const TABLE_ROW_BODY_DEMO: DemoConfig = {
    title: 'Table Row Body',
    description: '行展开/折叠 — 点击展开图标显示行详细信息，支持 property-grid、html、loader 异步加载',
    sections: [
        {
            label: 'Property Grid（行数据展开）',
            code: `{ type: 'table', options: {
    columns: [...],
    data: [...],
    rowBody: {
        type: 'property-grid',
        fields: [...],
        cols: 2,
    }
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: ROW_BODY_COLUMNS,
                            data: ROW_BODY_DATA,
                            rowBody: propertyGridRowBody,
                        },
                    },
                ],
            },
        },
        {
            label: '长标签 & 多类型（overflow/boolean/array）',
            code: `{ type: 'table', options: {
    columns: [...],
    data: [...],
    rowBody: {
        type: 'property-grid',
        fields: [
            { key: 'manager', labelKey: '直属上级负责人' },
            { key: 'lastReview', labelKey: '最近一次绩效评审结果' },
            { key: 'remote', labelKey: '是否远程办公', type: 'boolean' },
            { key: 'skills', labelKey: '专业技能标签', type: 'array' },
            ...
        ],
        cols: 2,
    }
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: ROW_BODY_COLUMNS,
                            data: ROW_BODY_DATA,
                            rowBody: longLabelRowBody,
                        },
                    },
                ],
            },
        },
        {
            label: 'Exclude Columns（自动排除已显示列）',
            code: `{ type: 'table', options: {
    columns: [...],
    data: [...],
    rowBody: {
        type: 'property-grid',
        excludeColumns: true,
        cols: 2,
    }
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: ROW_BODY_COLUMNS,
                            data: ROW_BODY_DATA,
                            rowBody: excludeColumnsRowBody,
                        },
                    },
                ],
            },
        },
        {
            label: 'HTML 内容（自定义展开内容）',
            code: `{ type: 'table', options: {
    columns: [...],
    data: [...],
    rowBody: {
        type: 'html',
        html: (data) => \`<div>...</div>\`,
    }
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: ROW_BODY_COLUMNS,
                            data: ROW_BODY_DATA,
                            rowBody: htmlRowBody,
                        },
                    },
                ],
            },
        },
        {
            label: 'Loader 异步加载（展开时加载详细数据）',
            code: `{ type: 'table', options: {
    columns: [...],
    data: [...],
    rowBody: {
        type: 'property-grid',
        fields: [...],
        cols: 2,
        loader: async (rowId, rowData) => fetchDetail(rowId),
        loadingText: '加载详细数据...',
    }
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: ROW_BODY_COLUMNS,
                            data: ROW_BODY_DATA,
                            rowBody: loaderRowBody,
                        },
                    },
                ],
            },
        },
        {
            label: 'Entity 模式（通过 table entityKey 加载详情）',
            code: `{ type: 'table', options: {
    columns: [...],
    data: [...],
    entityKey: 'employee',
    rowBody: {
        type: 'property-grid',
        excludeColumns: true,
        i18nScope: 'employee',
        entityAction: 'get',
        entityParamField: 'id',
        loadingText: '加载详细数据...',
    }
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: ROW_BODY_COLUMNS,
                            data: ROW_BODY_DATA,
                            rowBody: entityRowBody,
                        },
                    },
                ],
            },
        },
    ],
};