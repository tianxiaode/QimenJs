import { Component, type TemplateDecl, type ListenItem } from '@qimenjs/component-core';
import type { DemoConfig, DemoSection } from './types';

/** Nav 选中项交互演示 */
class NavSelectDemo extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
            children: [
                {
                    type: 'nav',
                    name: 'nav',
                    options: {
                        activeIndex: 0,
                        items: [
                            { text: '首页', iconCls: 'fa-solid fa-house' },
                            { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
                            { text: '消息', iconCls: 'fa-solid fa-bell' },
                            { text: '设置', iconCls: 'fa-solid fa-gear' },
                        ],
                    },
                },
                {
                    tag: 'div',
                    name: 'result',
                    classes: 'q-demo__hint',
                    options: { text: '点击导航项查看效果' },
                },
            ],
        };
    }

    listens: ListenItem[] = [
        { node: 'nav', events: { select: { handler: '_onNavSelect' } } },
    ];

    _onNavSelect(ctx: any): void {
        const data = ctx?.data ?? {};
        const index = data?.index;
        const result = this.getNodeEl('result');
        if (result && index !== undefined) {
            result.textContent = `选中导航项: index=${index}`;
        }
    }
}

export const NAV_DEMO: DemoConfig = {
    title: 'Nav',
    description: '导航项组组件，支持 expanded/collapsed 模式、图标、路由导航、嵌套浮层',
    sections: [
        {
            label: '基本导航',
            code: `{
    type: 'nav',
    options: {
        activeIndex: 0,
        items: [
            { text: '首页' },
            { text: '搜索' },
            { text: '消息' },
            { text: '设置' },
        ],
    }
}`,
            template: {
                type: 'nav',
                options: {
                    activeIndex: 0,
                    items: [{ text: '首页' }, { text: '搜索' }, { text: '消息' }, { text: '设置' }],
                },
            },
        },
        {
            label: '带图标',
            code: `{
    type: 'nav',
    options: {
        activeIndex: 0,
        items: [
            { text: '首页', iconCls: 'fa-solid fa-house' },
            { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
            { text: '消息', iconCls: 'fa-solid fa-bell' },
        ],
    }
}`,
            template: {
                type: 'nav',
                options: {
                    activeIndex: 0,
                    items: [
                        { text: '首页', iconCls: 'fa-solid fa-house' },
                        { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
                        { text: '消息', iconCls: 'fa-solid fa-bell' },
                    ],
                },
            },
        },
        {
            label: '折叠模式 (collapsed)',
            code: `{
    type: 'nav',
    options: {
        mode: 'collapsed',
        activeIndex: 0,
        items: [
            { text: '首页', iconCls: 'fa-solid fa-house' },
            { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
        ],
    }
}`,
            template: {
                type: 'nav',
                options: {
                    mode: 'collapsed',
                    activeIndex: 0,
                    items: [
                        { text: '首页', iconCls: 'fa-solid fa-house' },
                        { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
                        { text: '消息', iconCls: 'fa-solid fa-bell' },
                        { text: '设置', iconCls: 'fa-solid fa-gear' },
                    ],
                },
            },
        },
        {
            label: '嵌套子菜单',
            code: `{
    type: 'nav',
    options: {
        activeIndex: 0,
        items: [
            { text: '组件', iconCls: 'fa-solid fa-cube', children: [
                { text: 'Button', href: '/components/Button' },
                { text: 'Card', href: '/components/Card' },
            ]},
            { text: '布局', iconCls: 'fa-solid fa-table-cells', children: [
                { text: 'Panel', href: '/components/Panel' },
                { text: 'Tabs', href: '/components/Tabs' },
            ]},
            { text: '设置', iconCls: 'fa-solid fa-gear' },
        ],
    }
}`,
            template: {
                type: 'nav',
                options: {
                    activeIndex: 0,
                    items: [
                        {
                            text: '组件',
                            iconCls: 'fa-solid fa-cube',
                            children: [
                                { text: 'Button', href: '/components/Button' },
                                { text: 'Card', href: '/components/Card' },
                            ],
                        },
                        {
                            text: '布局',
                            iconCls: 'fa-solid fa-table-cells',
                            children: [
                                { text: 'Panel', href: '/components/Panel' },
                                { text: 'Tabs', href: '/components/Tabs' },
                            ],
                        },
                        { text: '设置', iconCls: 'fa-solid fa-gear' },
                    ],
                },
            },
        },
        {
            label: '选中项交互',
            code: `// select 事件中通过 data.index 获取选中项索引
nav.on('select', (data) => {
    console.log(data.index);
})`,
            component: NavSelectDemo,
        } satisfies DemoSection,
    ],
};
