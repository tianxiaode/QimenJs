import type { ColumnDefOrGroup } from '@qimenjs/component';

export const TABLE_DATA = [
    { id: 1, name: '张三', age: 28, salary: 15000, dept: '技术部' },
    { id: 2, name: '李四', age: 35, salary: 22000, dept: '市场部' },
    { id: 3, name: '王五', age: 42, salary: 30000, dept: '管理层' },
    { id: 4, name: '赵六', age: 24, salary: 8000, dept: '技术部' },
    { id: 5, name: '孙七', age: 31, salary: 18000, dept: '市场部' },
];

export const COMPREHENSIVE_COLUMNS: ColumnDefOrGroup[] = [
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

export const SUMMARY_DATA = [
    { product: '笔记本电脑', q1: 120, q2: 150, q3: 180, q4: 200 },
    { product: '手机', q1: 300, q2: 280, q3: 320, q4: 350 },
    { product: '平板', q1: 80, q2: 90, q3: 110, q4: 130 },
    { product: '耳机', q1: 200, q2: 220, q3: 250, q4: 280 },
];

export const SUMMARY_COLUMNS: ColumnDefOrGroup[] = [
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

export const CHECKBOX_SELECT_COLUMNS: ColumnDefOrGroup[] = [
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

export const RADIO_SELECT_COLUMNS: ColumnDefOrGroup[] = [
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

export const ROWNUMBER_COLUMNS: ColumnDefOrGroup[] = [
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

export const ROWNUMBER_DATA = [
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

export const FIXED_COLUMNS: ColumnDefOrGroup[] = [
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

export const FIXED_DATA = [
    { id: 1, name: '张三', empNo: 'E001', age: 28, salary: 15000, dept: '技术部', hireDate: '2023-03', email: 'zhangsan@co.com', phone: '138-0001', address: '北京市海淀区', status: '在职' },
    { id: 2, name: '李四', empNo: 'E002', age: 35, salary: 22000, dept: '市场部', hireDate: '2021-06', email: 'lisi@co.com', phone: '139-0002', address: '上海市浦东区', status: '在职' },
    { id: 3, name: '王五', empNo: 'E003', age: 42, salary: 30000, dept: '管理层', hireDate: '2019-01', email: 'wangwu@co.com', phone: '137-0003', address: '深圳市南山区', status: '离职' },
    { id: 4, name: '赵六', empNo: 'E004', age: 24, salary: 8000, dept: '技术部', hireDate: '2024-07', email: 'zhaoliu@co.com', phone: '136-0004', address: '杭州市西湖区', status: '在职' },
    { id: 5, name: '孙七', empNo: 'E005', age: 31, salary: 18000, dept: '市场部', hireDate: '2022-09', email: 'sunqi@co.com', phone: '135-0005', address: '广州市天河区', status: '在职' },
    { id: 6, name: '周八', empNo: 'E006', age: 26, salary: 12000, dept: '技术部', hireDate: '2023-11', email: 'zhouba@co.com', phone: '134-0006', address: '成都市武侯区', status: '离职' },
    { id: 7, name: '吴九', empNo: 'E007', age: 38, salary: 25000, dept: '管理层', hireDate: '2020-04', email: 'wujiu@co.com', phone: '133-0007', address: '武汉市洪山区', status: '在职' },
    { id: 8, name: '郑十', empNo: 'E008', age: 29, salary: 16000, dept: '市场部', hireDate: '2022-12', email: 'zhengshi@co.com', phone: '132-0008', address: '南京市鼓楼区', status: '在职' },
];

export const VIRTUAL_SCROLL_COLUMNS: ColumnDefOrGroup[] = [
    { name: '#', cellType: 'rownumber' },
    { name: 'id', field: 'id', title: 'ID', width: 80, align: 'right' },
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'age', field: 'age', title: '年龄', width: 80, align: 'right' },
    { name: 'dept', field: 'dept', title: '部门', width: 120, align: 'center' },
    { name: 'salary', field: 'salary', title: '薪资', width: 120, align: 'right', format: 'currency' },
    { name: 'email', field: 'email', title: '邮箱', width: 200 },
    { name: 'phone', field: 'phone', title: '电话', width: 130 },
];

export function generateVirtualData(count: number): any[] {
    const depts = ['技术部', '市场部', '管理层', '财务部', '运营部'];
    const names = ['张', '李', '王', '赵', '孙', '周', '吴', '郑', '钱', '冯',
        '陈', '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '尤'];
    const data: any[] = [];
    for (let i = 1; i <= count; i++) {
        data.push({
            id: i,
            name: `${names[i % names.length]}${i}`,
            age: 20 + (i % 30),
            dept: depts[i % depts.length],
            salary: 8000 + (i % 10) * 2000,
            email: `user${i}@co.com`,
            phone: `1${String(30000000 + i).slice(0, 8)}`,
        });
    }
    return data;
}

export const VIRTUAL_SCROLL_DATA = generateVirtualData(10000);

export const DISABLED_SELECT_DATA = [
    { id: 1, name: '张三', age: 28, salary: 15000, dept: '技术部' },
    { id: 2, name: '李四', age: 35, salary: 22000, dept: '市场部', _selectDisabled: true },
    { id: 3, name: '王五', age: 42, salary: 30000, dept: '管理层' },
    { id: 4, name: '赵六', age: 24, salary: 8000, dept: '技术部', _selectDisabled: true },
    { id: 5, name: '孙七', age: 31, salary: 18000, dept: '市场部' },
];

export const ROW_CLICK_COLUMNS: ColumnDefOrGroup[] = [
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
