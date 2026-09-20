import { Component, type TemplateDecl, type DomEventsMap } from '@qimenjs/component-core';
import type { DemoConfig, DemoSection } from './types';

/** TreeNav 选中项交互演示 */
class TreeNavSelectDemo extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
            children: [
                {
                    type: 'tree-nav',
                    name: 'treeNav',
                    options: {
                        activeIndex: 0,
                        items: [
                            {
                                text: '组件',
                                iconCls: 'fa-solid fa-cube',
                                children: [
                                    { text: 'Button', path: '/components/Button' },
                                    { text: 'Card', path: '/components/Card' },
                                ],
                            },
                            {
                                text: '布局',
                                iconCls: 'fa-solid fa-table-cells',
                                children: [
                                    { text: 'Panel', path: '/components/Panel' },
                                    { text: 'Tabs', path: '/components/Tabs' },
                                ],
                            },
                            { text: '设置', iconCls: 'fa-solid fa-gear' },
                        ],
                    },
                },
                {
                    tag: 'div',
                    name: 'result',
                    classes: 'q-demo__hint',
                    options: { text: '点击树导航项查看效果' },
                },
            ],
        };
    }

    domEvents: DomEventsMap = {
        select: { path: 'treeNav', handler: '_onTreeNavSelect' },
    };

    _onTreeNavSelect(domEvt: any): void {
        const data = domEvt?.data?.data ?? domEvt?.data ?? domEvt;
        const index = data?.index;
        const path = data?.path;
        const result = this.getNodeEl('result');
        if (result) {
            if (path) {
                result.textContent = `选中: path=${path}`;
            } else if (index !== undefined) {
                result.textContent = `选中: index=${index}`;
            }
        }
    }
}

export const TREENAV_DEMO: DemoConfig = {
    title: 'TreeNav',
    description: '树形导航组件，支持嵌套展开/折叠、图标、路由导航、多级子项',
    sections: [
        {
            label: '基本树导航',
            code: `{
    type: 'tree-nav',
    options: {
        activeIndex: 0,
        items: [
            { text: '组件', children: [
                { text: 'Button' },
                { text: 'Card' },
            ]},
            { text: '布局', children: [
                { text: 'Panel' },
                { text: 'Tabs' },
            ]},
            { text: '设置' },
        ],
    }
}`,
            template: {
                type: 'tree-nav',
                options: {
                    activeIndex: 0,
                    items: [
                        {
                            text: '组件',
                            children: [{ text: 'Button' }, { text: 'Card' }],
                        },
                        {
                            text: '布局',
                            children: [{ text: 'Panel' }, { text: 'Tabs' }],
                        },
                        { text: '设置' },
                    ],
                },
            },
        },
        {
            label: '带图标',
            code: `{
    type: 'tree-nav',
    options: {
        activeIndex: 0,
        items: [
            { text: '组件', iconCls: 'fa-solid fa-cube', children: [
                { text: 'Button' },
                { text: 'Card' },
            ]},
            { text: '设置', iconCls: 'fa-solid fa-gear' },
        ],
    }
}`,
            template: {
                type: 'tree-nav',
                options: {
                    activeIndex: 0,
                    items: [
                        {
                            text: '组件',
                            iconCls: 'fa-solid fa-cube',
                            children: [{ text: 'Button' }, { text: 'Card' }],
                        },
                        {
                            text: '布局',
                            iconCls: 'fa-solid fa-table-cells',
                            children: [{ text: 'Panel' }, { text: 'Tabs' }],
                        },
                        { text: '设置', iconCls: 'fa-solid fa-gear' },
                    ],
                },
            },
        },
        {
            label: '带路由路径',
            code: `{
    type: 'tree-nav',
    options: {
        activeIndex: 0,
        items: [
            { text: '组件', children: [
                { text: 'Button', path: '/components/Button' },
                { text: 'Card', path: '/components/Card' },
            ]},
        ],
    }
}`,
            template: {
                type: 'tree-nav',
                options: {
                    activeIndex: 0,
                    items: [
                        {
                            text: '组件',
                            iconCls: 'fa-solid fa-cube',
                            children: [
                                { text: 'Button', path: '/components/Button' },
                                { text: 'Card', path: '/components/Card' },
                            ],
                        },
                        {
                            text: '布局',
                            iconCls: 'fa-solid fa-table-cells',
                            children: [
                                { text: 'Panel', path: '/components/Panel' },
                                { text: 'Tabs', path: '/components/Tabs' },
                            ],
                        },
                    ],
                },
            },
        },
        {
            label: '选中项交互',
            code: `// select 事件中通过 data.index 或 data.path 获取选中项
treeNav.on('select', (data) => {
    console.log(data.index, data.path);
})`,
            component: TreeNavSelectDemo,
        } satisfies DemoSection,
    ],
};
