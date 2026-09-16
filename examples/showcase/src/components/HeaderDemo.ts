import type { DemoConfig } from './types';

export const HEADER_DEMO: DemoConfig = {
    title: 'Header',
    description: '头部组件，从 ItemGroupStaticComponent 派生，icon/title/action 为固定元素，items 通过 order 分区定位',
    sections: [
        {
            label: '基础标题',
            code: `{ type: 'header', options: { title: '页面标题' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'header', options: { title: '页面标题' } },
                ],
            },
        },
        {
            label: '带图标 (iconCls)',
            code: `{ type: 'header', options: { title: '通知中心', iconCls: 'fa-bell' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'header', options: { title: '通知中心', iconCls: 'fa-bell' } },
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
            code: `{ type: 'header', options: { title: '用户管理', actionCls: 'fa-plus' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'header', options: { title: '用户管理', actionCls: 'fa-plus' } },
                ],
            },
        },
        {
            label: '完整结构 (icon + title + subtitle + action)',
            code: `{ type: 'header', options: { title: '项目设置', iconCls: 'fa-cog', subtitle: '配置管理', actionCls: 'fa-save' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '项目设置',
                            iconCls: 'fa-cog',
                            subtitle: '配置管理',
                            actionCls: 'fa-save',
                        },
                    },
                ],
            },
        },
        {
            label: '带左侧 tools (order < 10000)',
            code: `{ type: 'header', options: { title: '居中标题', items: [{ type: 'icon', options: { iconCls: 'fa-search' }, order: 100 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '居中标题',
                            items: [
                                { type: 'icon', options: { iconCls: 'fa-search' }, order: 100 },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '带右侧 tools (order > 10000)',
            code: `{ type: 'header', options: { title: '居中标题', items: [{ type: 'icon', options: { iconCls: 'fa-filter' }, order: 10600 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
children: [
                    {
                        type: 'header',
                        options: {
                            title: '居中标题',
                            items: [
                                { type: 'icon', options: { iconCls: 'fa-filter' }, order: 10600 },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '左右 tools 数量不等 → 自动补位',
            code: `{ type: 'header', options: { title: '自动居中', iconCls: 'fa-home', items: [{ type: 'icon', options: { iconCls: 'fa-search' }, order: 100 }, { type: 'icon', options: { iconCls: 'fa-filter' }, order: 10600 }, { type: 'icon', options: { iconCls: 'fa-sort' }, order: 10700 }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '自动居中',
                            iconCls: 'fa-home',
                            items: [
                                { type: 'icon', options: { iconCls: 'fa-search' }, order: 100 },
                                { type: 'icon', options: { iconCls: 'fa-filter' }, order: 10600 },
                                { type: 'icon', options: { iconCls: 'fa-sort' }, order: 10700 },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
