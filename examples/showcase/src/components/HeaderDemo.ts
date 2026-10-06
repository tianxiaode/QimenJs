import type { DemoConfig } from './types';

export const HEADER_DEMO: DemoConfig = {
    title: 'Header',
    description:
        '头部组件，从 ItemGroupStaticComponent 派生，title 为固定元素，支持 icon/closable/expandable 内建按钮，更多自定义通过 items + order 分区定位',
    sections: [
        {
            label: '基础标题',
            code: `{ type: 'header', options: { title: '页面标题' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [{ type: 'header', options: { title: '页面标题' } }],
            },
        },
        {
            label: '带图标 (iconCls)',
            code: `{ type: 'header', options: { title: '通知中心', iconCls: 'q-icon-info' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [{ type: 'header', options: { title: '通知中心', iconCls: 'q-icon-info' } }],
            },
        },
        {
            label: '可关闭 (closable)',
            code: `{ type: 'header', options: { title: '可关闭面板', closable: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [{ type: 'header', options: { title: '可关闭面板', closable: true } }],
            },
        },
        {
            label: '可展开 (expandable)',
            code: `{ type: 'header', options: { title: '可折叠面板', expandable: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [{ type: 'header', options: { title: '可折叠面板', expandable: true } }],
            },
        },
        {
            label: '完整内建按钮 (icon + closable + expandable)',
            code: `{ type: 'header', options: { title: '完整面板', iconCls: 'q-icon-settings', expandable: true, closable: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: { title: '完整面板', iconCls: 'q-icon-settings', expandable: true, closable: true },
                    },
                ],
            },
        },
        {
            label: '带副标题',
            code: `{ type: 'header', options: { title: '数据概览', subtitle: '2026年度报告' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'header', options: { title: '数据概览', subtitle: '2026年度报告' } },
                ],
            },
        },
        {
            label: '带操作按钮 (right item, order=20000)',
            code: `{ type: 'header', options: { title: '用户管理', items: [{ iconCls: 'q-icon-add', order: 20000, clickable: true }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '用户管理',
                            items: [
                                {
                                    iconCls: 'q-icon-add',
                                    order: 20000,
                                    clickable: true,
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '完整结构 (iconCls + title + subtitle + action)',
            code: `{ type: 'header', options: { title: '项目设置', subtitle: '配置管理', iconCls: 'q-icon-settings', items: [{ iconCls: 'fa fa-floppy-o', order: 20000, clickable: true }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '项目设置',
                            subtitle: '配置管理',
                            iconCls: 'q-icon-settings',
                            items: [
                                {
                                    iconCls: 'fa fa-floppy-o',
                                    order: 20000,
                                    clickable: true,
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '带左侧 tools (order=100)',
            code: `{ type: 'header', options: { title: '居中标题', items: [{ iconCls: 'q-icon-search', order: 100 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '居中标题',
                            items: [{ iconCls: 'q-icon-search', order: 100 }],
                        },
                    },
                ],
            },
        },
        {
            label: '带右侧 tools (order=10600)',
            code: `{ type: 'header', options: { title: '居中标题', items: [{ iconCls: 'q-icon-filter', order: 10600 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '居中标题',
                            items: [{ iconCls: 'q-icon-filter', order: 10600 }],
                        },
                    },
                ],
            },
        },
        {
            label: '右侧多 → 左侧补位 (nR>nL)',
            code: `{ type: 'header', options: { title: '自动居中', items: [{  iconCls: 'q-icon-filter', order: 10600 }, {  iconCls: 'q-icon-more', order: 10700 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '自动居中',
                            items: [
                                { iconCls: 'q-icon-filter', order: 10600 },
                                { iconCls: 'q-icon-more', order: 10700 },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '左侧多 → 右侧补位 (nL>nR)',
            code: `{ type: 'header', options: { title: '自动居中', items: [{ iconCls: 'q-icon-home', order: 0 }, {  iconCls: 'q-icon-search', order: 100 }, { iconCls: 'q-icon-edit', order: 200 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '自动居中',
                            items: [
                                { iconCls: 'q-icon-home', order: 0 },
                                { iconCls: 'q-icon-search', order: 100 },
                                { iconCls: 'q-icon-edit', order: 200 },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '左右数量相等 (2 left = 2 right)',
            code: `{ type: 'header', options: { title: '自动居中', items: [{  iconCls: 'q-icon-home', order: 0 }, {  iconCls: 'q-icon-search', order: 100 }, {  iconCls: 'q-icon-filter', order: 10600 }, {  iconCls: 'q-icon-settings', order: 20000 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '自动居中',
                            items: [
                                { iconCls: 'q-icon-home', order: 0 },
                                { iconCls: 'q-icon-search', order: 100 },
                                { iconCls: 'q-icon-filter', order: 10600 },
                                { iconCls: 'q-icon-settings', order: 20000 },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
