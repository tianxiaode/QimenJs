import type { DemoConfig } from './types';

export const PANEL_DEMO: DemoConfig = {
    title: 'Panel',
    description: '面板组件，支持 title + expandable/closable/resizable + header 高级配置',
    sections: [
        {
            label: '基础面板',
            code: `{ type: 'panel', options: { title: '数据面板' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'panel',
                        options: { title: '数据面板' },
                        children: [{ tag: 'p', name: 'body', options: { text: '面板内容区域' } }],
                    },
                ],
            },
        },
        {
            label: '带图标 (header 配置)',
            code: `{ type: 'panel', options: { title: '数据面板', header: { iconCls: 'q-icon-dashboard' } } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'panel',
                        options: { title: '数据面板', header: { iconCls: 'q-icon-dashboard' } },
                        children: [{ tag: 'p', name: 'body', options: { text: '面板内容区域' } }],
                    },
                ],
            },
        },
        {
            label: '可折叠 (expandable)',
            code: `{ type: 'panel', options: { title: '折叠面板', expandable: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'panel',
                        options: { title: '折叠面板', expandable: true },
                        children: [{ tag: 'p', name: 'body', options: { text: '点击展开/收起按钮可切换内容显示' } }],
                    },
                ],
            },
        },
        {
            label: '可关闭 (closable)',
            code: `{ type: 'panel', options: { title: '可关闭面板', closable: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'panel',
                        options: { title: '可关闭面板', closable: true },
                        children: [{ tag: 'p', name: 'body', options: { text: '点击关闭按钮可隐藏面板内容' } }],
                    },
                ],
            },
        },
        {
            label: '可调整大小 (resizable)',
            code: `{ type: 'panel', options: { title: '可缩放面板', resizable: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'panel',
                        options: { title: '可缩放面板', resizable: true },
                        children: [{ tag: 'p', name: 'body', options: { text: '拖拽右下角边缘可调整面板大小' } }],
                    },
                ],
            },
        },
        {
            label: '完整面板',
            code: `{ type: 'panel', options: { title: '完整面板', header: { iconCls: 'q-icon-dashboard' }, expandable: true, closable: true, resizable: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'panel',
                        options: { title: '完整面板', header: { iconCls: 'q-icon-dashboard' }, expandable: true, closable: true, resizable: true },
                        children: [{ tag: 'p', name: 'body', options: { text: '同时支持折叠、关闭和缩放的面板' } }],
                    },
                ],
            },
        },
    ],
};
