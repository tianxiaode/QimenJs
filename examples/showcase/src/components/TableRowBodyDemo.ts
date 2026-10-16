import { Component, type TemplateDecl } from '@qimenjs/component-core';
import { dataDispatchCenter, LocalReadonlyEntityManager } from '@qimenjs/entity';
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

const NESTED_ORDER_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'orderNo', field: 'orderNo', title: '订单号', width: 140 },
    { name: 'customer', field: 'customer', title: '客户', width: 100 },
    { name: 'date', field: 'date', title: '下单日期', width: 110 },
    { name: 'total', field: 'total', title: '订单金额', width: 110, align: 'right', format: 'currency' },
    { name: 'status', field: 'status', title: '状态', width: 90, align: 'center' },
];

const NESTED_TABLE_DATA = [
    {
        orderNo: 'ORD-2024-001', customer: '张三', date: '2024-03-15', total: 997, status: '已发货',
        products: [
            { sku: 'SKU-1001', name: '机械键盘', qty: 2, price: 399, batches: [
                { batch: 'B2401A', warehouse: '北京仓', stock: 45, shelf: 'A-12-3' },
                { batch: 'B2312C', warehouse: '上海仓', stock: 120, shelf: 'C-05-1' },
            ] },
            { sku: 'SKU-2002', name: '无线鼠标', qty: 1, price: 199, batches: [
                { batch: 'B2402B', warehouse: '广州仓', stock: 88, shelf: 'B-03-7' },
            ] },
        ],
    },
    {
        orderNo: 'ORD-2024-002', customer: '李四', date: '2024-03-18', total: 1897, status: '运输中',
        products: [
            { sku: 'SKU-3003', name: '27寸显示器', qty: 1, price: 1299, batches: [
                { batch: 'B2403A', warehouse: '北京仓', stock: 12, shelf: 'D-08-2' },
            ] },
            { sku: 'SKU-4004', name: 'USB-C 扩展坞', qty: 2, price: 299, batches: [
                { batch: 'B2403C', warehouse: '深圳仓', stock: 210, shelf: 'E-01-5' },
                { batch: 'B2401D', warehouse: '北京仓', stock: 66, shelf: 'A-15-8' },
            ] },
        ],
    },
    {
        orderNo: 'ORD-2024-003', customer: '王五', date: '2024-03-20', total: 2498, status: '待发货',
        products: [
            { sku: 'SKU-5005', name: '人体工学椅', qty: 1, price: 899, batches: [
                { batch: 'B2404A', warehouse: '杭州仓', stock: 30, shelf: 'F-02-1' },
            ] },
            { sku: 'SKU-6006', name: '电动升降桌', qty: 1, price: 1599, batches: [
                { batch: 'B2404B', warehouse: '杭州仓', stock: 18, shelf: 'F-02-6' },
                { batch: 'B2402E', warehouse: '成都仓', stock: 52, shelf: 'G-07-3' },
            ] },
        ],
    },
];

const nestedTableRowBody: RowBodyConfig = {
    type: 'table',
    dataField: 'products',
    tableOptions: {
        columns: [
            { name: 'sku', field: 'sku', title: 'SKU', width: 100 },
            { name: 'name', field: 'name', title: '商品名称', width: 150 },
            { name: 'qty', field: 'qty', title: '数量', width: 70, align: 'right' },
            { name: 'price', field: 'price', title: '单价', width: 100, align: 'right', format: 'currency' },
        ],
        rowBody: {
            type: 'table',
            dataField: 'batches',
            tableOptions: {
                columns: [
                    { name: 'batch', field: 'batch', title: '批次号', width: 110 },
                    { name: 'warehouse', field: 'warehouse', title: '仓库', width: 100 },
                    { name: 'stock', field: 'stock', title: '批次库存', width: 90, align: 'right' },
                    { name: 'shelf', field: 'shelf', title: '货位', width: 100 },
                ],
            },
        },
    },
};

const ENTITY_KEY = 'demo-row-body-entity';
const MOCK_ENTITY_TYPE = 'mock-row-body';

class MockRowBodyEntityManager extends LocalReadonlyEntityManager {
    static entityType = MOCK_ENTITY_TYPE;

    get = async (id: string | number) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return super.get(id);
    };
}

class EntityRowBodyDemo extends Component {
    static type = 'entity-row-body-demo';

    _table: any = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__column',
            children: [
                { tag: 'div', name: 'tableContainer', classes: 'q-demo__column' },
            ],
        };
    }

    onAfterInit(): void {
        MockRowBodyEntityManager.register();

        const container = this.getNodeEl('tableContainer');
        if (!container) return;

        const mgr = dataDispatchCenter.connect(ENTITY_KEY, MOCK_ENTITY_TYPE);
        ROW_BODY_DATA.forEach(item => mgr.sourceData.set(item.id, item));
        mgr.refreshView();

        import('@qimenjs/component').then(({ TableComponent }) => {
            this._table = new TableComponent({
                columns: ROW_BODY_COLUMNS,
                entityKey: ENTITY_KEY,
                entityType: MOCK_ENTITY_TYPE,
                rowBody: entityRowBody,
            });

            container.appendChild(this._table.el);
        });

        this.onCleanup(() => {
            dataDispatchCenter.disconnect(ENTITY_KEY);
        });
    }
}

export const TABLE_ROW_BODY_DEMO: DemoConfig = {
    title: 'Table Row Body',
    description: '行展开/折叠 — 点击展开图标显示行详细信息，支持 property-grid、html、loader 异步加载、entity 实体加载、table 多层嵌套',
    sections: [
        {
            label: 'Property Grid（fields 配置 / excludeColumns 自动排除已显示列）',
            code: `{ type: 'table', options: {
    columns: [...],
    data: [...],
    rowBody: {
        type: 'property-grid',
        fields: [...],        // 方式一：显式字段配置
        cols: 2,
    }
} }

// 方式二：excludeColumns 为 true 且 fields 为空时，自动排除表格列已显示的字段
    rowBody: {
        type: 'property-grid',
        excludeColumns: true,  // 自动排除 name/age/dept/salary
        cols: 2,
    } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        tag: 'div',
                        classes: 'q-demo__column',
                        children: [
                            { tag: 'div', classes: 'q-demo__section-label', options: { text: 'fields 配置' } },
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
                    {
                        tag: 'div',
                        classes: 'q-demo__column',
                        children: [
                            { tag: 'div', classes: 'q-demo__section-label', options: { text: 'excludeColumns 自动排除' } },
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
            label: 'Entity 模式（通过 EntityManager 加载详情）',
            code: `// Table 连接 MockRowBodyEntityManager（继承 LocalReadonlyEntityManager）
// 展开行时通过 entityAction='get' 获取行详情
// EM 自动处理 loading/success/error 事件
new TableComponent({
    columns: [...],
    entityKey: 'demo-row-body',
    entityType: 'mock-row-body',
    rowBody: {
        type: 'property-grid',
        excludeColumns: true,
        i18nScope: 'employee',
        entityAction: 'get',
        entityParamField: 'id',
    }
})`,
            component: EntityRowBodyDemo,
        },
        {
            label: 'Table 嵌套（多层子表，3 层递归展开）',
            code: `// rowBody type 为 'table' 时嵌套子表，子表自身也可配置 rowBody 继续嵌套
const nestedRowBody: RowBodyConfig = {
    type: 'table',
    dataField: 'products',        // 从订单数据中取商品数组渲染第 2 层子表
    tableOptions: {
        columns: [...],
        rowBody: {                 // 第 2 层子表继续嵌套第 3 层
            type: 'table',
            dataField: 'batches',  // 从商品数据中取批次数组
            tableOptions: { columns: [...] },
        },
    },
}

{ type: 'table', options: {
    columns: [...],               // 订单列，展开列自动添加
    data: [...],                  // 每条订单含 products，每个商品含 batches
    rowBody: nestedRowBody,
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: NESTED_ORDER_COLUMNS,
                            data: NESTED_TABLE_DATA,
                            rowBody: nestedTableRowBody,
                        },
                    },
                ],
            },
        },
    ],
};