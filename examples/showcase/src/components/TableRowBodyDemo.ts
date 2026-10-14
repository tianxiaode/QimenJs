import type { DemoConfig } from './types';
import type { ColumnDefOrGroup, RowBodyConfig } from '@qimenjs/component';

const ROW_BODY_DATA = [
    { id: 1, name: '张三', age: 28, salary: 15000, dept: '技术部', email: 'zhangsan@co.com', phone: '138-0001', address: '北京市海淀区' },
    { id: 2, name: '李四', age: 35, salary: 22000, dept: '市场部', email: 'lisi@co.com', phone: '139-0002', address: '上海市浦东区' },
    { id: 3, name: '王五', age: 42, salary: 30000, dept: '管理层', email: 'wangwu@co.com', phone: '137-0003', address: '深圳市南山区' },
];

const ROW_BODY_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
];

const propertyGridRowBody: RowBodyConfig = {
    type: 'property-grid',
    fields: [
        { key: 'name', labelKey: '姓名' },
        { key: 'age', labelKey: '年龄', type: 'number' },
        { key: 'dept', labelKey: '部门' },
        { key: 'salary', labelKey: '薪资', type: 'number', format: '#,##0' },
        { key: 'email', labelKey: '邮箱', span: 2 },
        { key: 'phone', labelKey: '电话' },
        { key: 'address', labelKey: '地址', span: 2 },
    ],
    cols: 2,
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
    loader: async (rowId: string) => {
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
    ],
};
