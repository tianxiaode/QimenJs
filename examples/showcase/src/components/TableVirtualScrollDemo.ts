import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { VIRTUAL_SCROLL_COLUMNS, VIRTUAL_SCROLL_DATA, generateVirtualData } from './table-demo-data';

const ENTITY_KEY = 'demo-virtual-scroll-entity';

class VirtualScrollEntityDemo extends Component {
    static type = 'virtual-scroll-entity-demo';

    _table: any = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__column',
            children: [
                {
                    tag: 'div',
                    name: 'tableContainer',
                    classes: 'q-demo__column',
                },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('tableContainer');
        if (!container) return;

        Promise.all([
            import('@qimenjs/component'),
            import('@qimenjs/entity'),
        ]).then(([{ TableComponent }]) => {
            this._table = new TableComponent({
                columns: VIRTUAL_SCROLL_COLUMNS,
                entityKey: ENTITY_KEY,
                entityType: 'mock-virtual-scroll',
                virtualScroll: true,
                itemHeight: 36,
                height: '400px',
            });

            container.appendChild(this._table.el);
        });
    }
}

export const TABLE_VIRTUAL_SCROLL_DEMO: DemoConfig = {
    title: 'Table 虚拟滚动',
    description: '虚拟滚动 — 大数据量场景下只渲染可见区域行，DOM 节点数恒定，滚动流畅',
    sections: [
        {
            label: '虚拟滚动（10000行，本地数据）',
            code: `{ type: 'table', options: {
    columns: [...],
    data: [...], // 10000 行数据
    virtualScroll: true,
    itemHeight: 36,
    virtualBuffer: 5,
} }

// virtualScroll: true — 开启虚拟滚动，只渲染可见区域行
// itemHeight: 36 — 每行固定高度（px），用于计算可视范围
// height: '400px' — 表格容器高度，虚拟滚动必须有固定高度才能产生内部滚动
// virtualBuffer: 5 — 可视区域上下额外渲染的缓冲行数
// 适合大数据量场景（1000+行），DOM 节点数恒定，滚动流畅`,
            template: {
                tag: 'div',
                classes: 'q-demo__column',
                children: [
                    {
                        type: 'table',
                        options: {
                            columns: VIRTUAL_SCROLL_COLUMNS,
                            data: VIRTUAL_SCROLL_DATA,
                            virtualScroll: true,
                            itemHeight: 36,
                            height: '400px',
                        },
                    },
                ],
            },
        },
        {
            label: '虚拟滚动 + EntityManager（10000行，按需加载）',
            code: `// Table 通过 entityType='mock-virtual-scroll' 连接 EM
// DataDispatchCenter 自动创建 MockVirtualScrollEntityManager 实例
// EM 内部生成 mock 数据，按需加载可见范围
new TableComponent({
    columns: [...],
    entityKey: 'demo-virtual-scroll',
    entityType: 'mock-virtual-scroll',
    virtualScroll: true,
    itemHeight: 36,
    height: '400px',
});

// EM 只加载可见范围内的数据（LOAD_RANGE 命令）
// 滚动时自动请求新范围，未加载行不渲染`,
            component: VirtualScrollEntityDemo,
        },
    ],
};
