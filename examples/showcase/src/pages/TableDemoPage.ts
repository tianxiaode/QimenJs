import { Component, type TemplateDecl } from '@qimenjs/component-core';
import { TableComponent } from '@qimenjs/component';
import type { ColumnDef } from '@qimenjs/component';

const TABLE_COLUMNS: ColumnDef[] = [
    { name: 'id', field: 'id', title: 'ID', width: 60, align: 'center' },
    { name: 'name', field: 'name', title: '姓名', width: 120 },
    { name: 'dept', field: 'dept', title: '部门', width: 140 },
    { name: 'salary', field: 'salary', title: '薪资', width: 100, align: 'right', format: 'currency' },
    { name: 'status', field: 'status', title: '状态', width: 80, align: 'center' },
];

const TABLE_DATA: Record<string, any>[] = [
    { id: 1, name: '张三', dept: '技术部', salary: 15000, status: '在职' },
    { id: 2, name: '李四', dept: '产品部', salary: 12000, status: '在职' },
    { id: 3, name: '王五', dept: '设计部', salary: 18000, status: '离职' },
    { id: 4, name: '赵六', dept: '技术部', salary: 22000, status: '在职' },
    { id: 5, name: '钱七', dept: '运营部', salary: 9000, status: '在职' },
    { id: 6, name: '孙八', dept: '技术部', salary: 25000, status: '在职' },
    { id: 7, name: '周九', dept: '产品部', salary: 11000, status: '离职' },
    { id: 8, name: '吴十', dept: '设计部', salary: 16000, status: '在职' },
];

class TableDemoPage extends Component {
    _table: TableComponent | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-table-demo',
            style: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
            children: [
                { tag: 'h2', options: { text: 'Table 组件演示' } },
                {
                    tag: 'div',
                    classes: 'q-table-demo__controls',
                    style: { display: 'flex', gap: '8px' },
                    children: [
                        { tag: 'button', name: 'hideBtn', classes: 'q-table-demo__btn', options: { text: '隐藏状态列' } },
                        { tag: 'button', name: 'showBtn', classes: 'q-table-demo__btn', options: { text: '显示状态列' } },
                        { tag: 'button', name: 'moveBtn', classes: 'q-table-demo__btn', options: { text: '交换 ID<->姓名' } },
                    ],
                },
                { tag: 'div', name: 'tableContainer', classes: 'q-table-demo__container' },
            ],
        };
    }

    domEvents = {
        click: [
            { path: 'hideBtn', handler: '_onHideClick' },
            { path: 'showBtn', handler: '_onShowClick' },
            { path: 'moveBtn', handler: '_onMoveClick' },
        ],
    };

    onMounted(): void {
        const container = this.getNodeEl('tableContainer');
        if (!container) return;
        this._table = new TableComponent({ columns: TABLE_COLUMNS, data: TABLE_DATA });
        container.appendChild(this._table.el);
    }

    _onHideClick(): void {
        this._table?.hideColumn('status');
    }

    _onShowClick(): void {
        this._table?.showColumn('status');
    }

    _onMoveClick(): void {
        this._table?.moveColumn(0, 1);
    }
}

TableDemoPage.register();

export { TableDemoPage };
