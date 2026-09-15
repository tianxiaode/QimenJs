import type { DemoConfig } from './types';

export const TABS_DEMO: DemoConfig = {
    title: 'Tabs',
    description: '标签栏组件，支持 position(top/bottom/left/right) + selectedIndex，items 含 label/icon/closable',
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
            label: '带图标',
            code: `{ type: 'tab-bar', options: {
    items: [{ label: '首页', icon: '🏠' }, { label: '设置', icon: '⚙' }, { label: '搜索', icon: '🔍' }],
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
                                { label: '首页', icon: '🏠' },
                                { label: '设置', icon: '⚙' },
                                { label: '搜索', icon: '🔍' },
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
            code: `{ type: 'tab-bar', options: { position: 'left', items: [{ label: 'A' }, { label: 'B' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            position: 'left',
                            selectedIndex: 0,
                            items: [{ label: 'A' }, { label: 'B' }],
                        },
                    },
                ],
            },
        },
        {
            label: '右侧位置 (right)',
            code: `{ type: 'tab-bar', options: { position: 'right', items: [{ label: 'A' }, { label: 'B' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            position: 'right',
                            selectedIndex: 0,
                            items: [{ label: 'A' }, { label: 'B' }],
                        },
                    },
                ],
            },
        },
    ],
};
