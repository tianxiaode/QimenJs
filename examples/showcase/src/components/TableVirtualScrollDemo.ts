import type { DemoConfig } from './types';
import { VIRTUAL_SCROLL_COLUMNS, VIRTUAL_SCROLL_DATA } from './table-demo-data';

export const TABLE_VIRTUAL_SCROLL_DEMO: DemoConfig = {
    title: 'Table 虚拟滚动',
    description: '虚拟滚动 — 大数据量场景下只渲染可见区域行，DOM 节点数恒定，滚动流畅',
    sections: [
        {
            label: '虚拟滚动（10000行）',
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
    ],
};
