import type { DemoConfig } from './types';

export const TABS_DEMO: DemoConfig = {
    title: 'Tabs',
    description:
        '标签栏/标签页组件，支持 position(top/bottom/left/right) + selectedIndex + size + content(字符串/组件/模板)',
    sections: [
        {
            label: '基础标签栏 (top)',
            code: `{ type: 'tab-bar', options: {
    position: 'top',
    selectedIndex: 0,
    items: [{ label: '首页' }, { label: '设置' }, { label: '关于' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            position: 'top',
                            selectedIndex: 0,
                            items: [{ label: '首页' }, { label: '设置' }, { label: '关于' }],
                        },
                    },
                ],
            },
        },
        {
            label: '带图标 (iconCls)',
            code: `{ type: 'tab-bar', options: {
    items: [{ label: '首页', iconCls: 'fa fa-home' }, { label: '设置', iconCls: 'fa fa-cog' }, { label: '搜索', iconCls: 'fa fa-search' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            selectedIndex: 0,
                            items: [
                                { label: '首页', iconCls: 'fa fa-home' },
                                { label: '设置', iconCls: 'fa fa-cog' },
                                { label: '搜索', iconCls: 'fa fa-search' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '可关闭标签 (closable)',
            code: `{ type: 'tab-bar', options: {
    items: [{ label: '首页' }, { label: '编辑', closable: true }, { label: '预览', closable: true }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            selectedIndex: 0,
                            items: [
                                { label: '首页' },
                                { label: '编辑', closable: true },
                                { label: '预览', closable: true },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '尺寸 (size)',
            code: `{ type: 'tab-bar', options: {
    size: 'sm',
    items: [{ label: '小' }, { label: '标签' }],
} }
{ type: 'tab-bar', options: {
    size: 'lg',
    items: [{ label: '大' }, { label: '标签' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            size: 'sm',
                            selectedIndex: 0,
                            items: [{ label: '小' }, { label: '标签' }],
                        },
                    },
                    {
                        type: 'tab-bar',
                        options: {
                            size: 'lg',
                            selectedIndex: 0,
                            items: [{ label: '大' }, { label: '标签' }],
                        },
                    },
                ],
            },
        },
        {
            label: '标签页内容 (tabs + content)',
            code: `{ type: 'tabs', options: {
    selectedIndex: 0,
    items: [
        { label: '首页', content: '<p>首页内容区域</p>' },
        { label: '设置', content: '<p>设置内容区域</p>' },
    ],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tabs',
                        options: {
                            selectedIndex: 0,
                            items: [
                                { label: '首页', content: '<p>首页内容区域</p>' },
                                { label: '设置', content: '<p>设置内容区域</p>' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '路由切换 (route)',
            code: `{ type: 'tabs', options: {
    selectedIndex: 0,
    items: [
        { label: '首页', route: '/components/Tabs/home', content: '<p>首页 - 路由 /components/Tabs/home</p>' },
        { label: '设置', route: '/components/Tabs/settings', content: '<p>设置 - 路由 /components/Tabs/settings</p>' },
        { label: '关于', content: '<p>关于 - 无路由，纯事件切换</p>' },
    ],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tabs',
                        options: {
                            selectedIndex: 0,
                            items: [
                                { label: '首页', route: '/components/Tabs/home', content: '<p>首页 - 路由 /components/Tabs/home</p>' },
                                { label: '设置', route: '/components/Tabs/settings', content: '<p>设置 - 路由 /components/Tabs/settings</p>' },
                                { label: '关于', content: '<p>关于 - 无路由，纯事件切换</p>' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '底部位置 (bottom)',
            code: `{ type: 'tab-bar', options: { position: 'bottom', items: [{ label: 'A' }, { label: 'B' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            position: 'bottom',
                            selectedIndex: 0,
                            items: [{ label: 'A' }, { label: 'B' }],
                        },
                    },
                ],
            },
        },
        {
            label: '左侧位置 (left)',
            code: `{ type: 'tabs', options: { position: 'left', items: [{ label: 'A', content: '<p>A</p>' }, { label: 'B', content: '<p>B</p>' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tabs',
                        options: {
                            position: 'left',
                            selectedIndex: 0,
                            items: [
                                { label: 'A', content: '<p>左侧 A 内容</p>' },
                                { label: 'B', content: '<p>左侧 B 内容</p>' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '右侧位置 (right)',
            code: `{ type: 'tabs', options: { position: 'right', items: [{ label: 'A', content: '<p>A</p>' }, { label: 'B', content: '<p>B</p>' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tabs',
                        options: {
                            position: 'right',
                            selectedIndex: 0,
                            items: [
                                { label: 'A', content: '<p>右侧 A 内容</p>' },
                                { label: 'B', content: '<p>右侧 B 内容</p>' },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
