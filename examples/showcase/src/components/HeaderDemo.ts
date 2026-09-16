import type { DemoConfig } from './types';

export const HEADER_DEMO: DemoConfig = {
    title: 'Header',
    description:
        '头部组件，从 ItemGroupStaticComponent 派生，icon/title/action 为固定元素，items 通过 order 分区定位',
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
            code: `{ type: 'header', options: { title: '通知中心', iconCls: 'fa fa-bell' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'header', options: { title: '通知中心', iconCls: 'fa fa-bell' } },
                ],
            },
        },
        {
            label: '带图标颜色 (iconColor)',
            code: `{ type: 'header', options: { title: '通知中心', iconCls: 'fa fa-bell', iconColor: 'primary' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '通知中心',
                            iconCls: 'fa fa-bell',
                            iconColor: 'primary',
                        },
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
            label: '带操作按钮 (actionCls)',
            code: `{ type: 'header', options: { title: '用户管理', actionCls: 'fa fa-plus' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'header', options: { title: '用户管理', actionCls: 'fa fa-plus' } },
                ],
            },
        },
        {
            label: '带操作按钮颜色 (actionColor)',
            code: `{ type: 'header', options: { title: '用户管理', actionCls: 'fa fa-plus', actionColor: 'error' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '用户管理',
                            actionCls: 'fa fa-plus',
                            actionColor: 'error',
                        },
                    },
                ],
            },
        },
        {
            label: '完整结构 (icon + title + subtitle + action)',
            code: `{ type: 'header', options: { title: '项目设置', iconCls: 'fa fa-cog', subtitle: '配置管理', actionCls: 'fa fa-save' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '项目设置',
                            iconCls: 'fa fa-cog',
                            subtitle: '配置管理',
                            actionCls: 'fa fa-save',
                        },
                    },
                ],
            },
        },
        {
            label: '带左侧 tools (order=100)',
            code: `{ type: 'header', options: { title: '居中标题', items: [{ iconCls: 'fa fa-search', order: 100 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '居中标题',
                            items: [{ iconCls: 'fa fa-search', order: 100 }],
                        },
                    },
                ],
            },
        },
        {
            label: '带右侧 tools (order=10600)',
            code: `{ type: 'header', options: { title: '居中标题', items: [{ iconCls: 'fa fa-filter', order: 10600 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '居中标题',
                            items: [{ iconCls: 'fa fa-filter', order: 10600 }],
                        },
                    },
                ],
            },
        },
        {
            label: '右侧多 → 左侧补位 (nR>nL)',
            code: `{ type: 'header', options: { title: '自动居中', items: [{ iconCls: 'fa fa-filter', order: 10600 }, { iconCls: 'fa fa-sort', order: 10700 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '自动居中',
                            items: [
                                { iconCls: 'fa fa-filter', order: 10600 },
                                { iconCls: 'fa fa-sort', order: 10700 },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '左侧多 → 右侧补位 (nL>nR)',
            code: `{ type: 'header', options: { title: '自动居中', iconCls: 'fa fa-home', items: [{ iconCls: 'fa fa-search', order: 100 }, { iconCls: 'fa fa-edit', order: 200 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '自动居中',
                            iconCls: 'fa fa-home',
                            items: [
                                { iconCls: 'fa fa-search', order: 100 },
                                { iconCls: 'fa fa-edit', order: 200 },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '左右数量相等 → 无补位',
            code: `{ type: 'header', options: { title: '自动居中', iconCls: 'fa fa-home', items: [{ iconCls: 'fa fa-search', order: 100 }, { iconCls: 'fa fa-filter', order: 10600 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '自动居中',
                            iconCls: 'fa fa-home',
                            items: [
                                { iconCls: 'fa fa-search', order: 100 },
                                { iconCls: 'fa fa-filter', order: 10600 },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
