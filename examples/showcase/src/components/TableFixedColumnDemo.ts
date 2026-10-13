import { Component, ListenItem, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { FIXED_COLUMNS, FIXED_DATA } from './table-demo-data';

class FixedColumnBgDemo extends Component {
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
                            { text: '默认条纹', value: 'default' },
                            { text: '无条纹', value: 'no-stripe' },
                            { text: '绿色背景', value: 'green' },
                            { text: '自定义条纹', value: 'custom-stripe' },
                        ],
                    },
                },
                {
                    tag: 'div',
                    name: 'tableContainer',
                    classes: 'q-demo__column',
                },
            ],
        };
    }

    listens: ListenItem[] = [{ node: 'btnGroup', events: { select: '_onBgModeSelect' } }];

    private _table: any = null;

    onAfterInit(): void {
        const container = this.getNodeEl('tableContainer');
        if (!container) return;
        import('@qimenjs/component').then(({ TableComponent }) => {
            this._table = new TableComponent({
                columns: FIXED_COLUMNS,
                data: FIXED_DATA,
                selectable: 'multiple',
                container,
            });
        });
    }

    _onBgModeSelect(data: any): void {
        if (!this._table) return;
        const ctx = data?.data ?? data;
        const index = ctx?.index ?? ctx?.lastToggleIndex ?? ctx?.selectedIndex;
        switch (index) {
            case 0:
                this._table.setData('stripe', true);
                this._table.setData('rowBg', null);
                this._table.setData('stripeBg', null);
                break;
            case 1:
                this._table.setData('stripe', false);
                this._table.setData('rowBg', null);
                this._table.setData('stripeBg', null);
                break;
            case 2:
                this._table.setData('stripe', false);
                this._table.setData('rowBg', '#e8f5e9');
                this._table.setData('stripeBg', null);
                break;
            case 3:
                this._table.setData('stripe', true);
                this._table.setData('rowBg', '#fff3e0');
                this._table.setData('stripeBg', '#ffe0b2');
                break;
        }
    }
}

export const TABLE_FIXED_COLUMN_DEMO: DemoConfig = {
    title: 'Table 固定列',
    description: '表格固定列与自定义行背景 — 左右固定列、条纹、自定义行背景色',
    sections: [
        {
            label: '固定列 + 自定义行背景',
            code: `{ type: 'table', options: {
    columns: [
        { name: 'check', cellType: 'checkbox', selection: true, width: 40, fixed: 'left' },
        { name: 'name', field: 'name', title: '姓名', width: 120, fixed: 'left' },
        // ... 中间列 ...
        { name: 'status', field: 'status', title: '状态', width: 100, fixed: 'right' },
    ],
    data: [...],
    selectable: 'multiple',
    stripe: true,       // 默认条纹
    rowBg: null,        // 自定义奇数行背景色
    stripeBg: null,     // 自定义偶数行背景色
} }

// fixed: 'left'/'right' — 固定列，水平滚动时不移动
// stripe: false — 禁用条纹，所有行统一背景色
// rowBg: '#e8f5e9' — 自定义行背景色
// stripeBg: '#ffe0b2' — 自定义条纹背景色
// 固定列自动跟随行背景色变化
// 点击上方按钮切换不同的行背景模式`,
            component: FixedColumnBgDemo,
        },
    ],
};
