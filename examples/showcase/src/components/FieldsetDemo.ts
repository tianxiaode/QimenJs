import type { DemoConfig } from './types';

export const FIELDSET_DEMO: DemoConfig = {
    title: 'Fieldset',
    description: '字段集组件，legend 浮在边框上，支持 collapsible 折叠、toggleIconCls 自定义箭头、color 主题色',
    sections: [
        {
            label: '基础字段集',
            code: `{ type: 'fieldset', options: { legend: '基本信息' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { legend: '基本信息' },
                        children: [
                            { tag: 'p', name: 'content', options: { text: '字段集内容区域' } },
                        ],
                    },
                ],
            },
        },
        {
            label: '可折叠 (collapsible)',
            code: `{ type: 'fieldset', options: { legend: '高级设置', collapsible: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { legend: '高级设置', collapsible: true },
                        children: [
                            { tag: 'p', name: 'content', options: { text: '可折叠的内容区域，点击 legend 可展开/收起' } },
                        ],
                    },
                ],
            },
        },
        {
            label: '初始收起 (collapsed)',
            code: `{ type: 'fieldset', options: { legend: '隐藏内容', collapsible: true, collapsed: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { legend: '隐藏内容', collapsible: true, collapsed: true },
                        children: [
                            { tag: 'p', name: 'content', options: { text: '此内容默认不可见，需点击 legend 展开' } },
                        ],
                    },
                ],
            },
        },
        {
            label: '无标题字段集',
            code: `{ type: 'fieldset' }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        children: [
                            { tag: 'p', name: 'content', options: { text: '没有 legend 的字段集' } },
                        ],
                    },
                ],
            },
        },
        {
            label: '自定义箭头 (toggleIconCls)',
            code: `{ type: 'fieldset', options: { legend: '自定义箭头', collapsible: true, toggleIconCls: 'fa fa-chevron-down' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { legend: '自定义箭头', collapsible: true, toggleIconCls: 'fa fa-chevron-down' },
                        children: [
                            { tag: 'p', name: 'content', options: { text: '使用 FontAwesome 图标替代默认 CSS 箭头' } },
                        ],
                    },
                ],
            },
        },
        {
            label: '主题色 (color)',
            code: `{ type: 'fieldset', options: { legend: 'Primary', color: 'primary' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { legend: 'Primary', color: 'primary' },
                        children: [{ tag: 'p', name: 'content', options: { text: 'Primary 主题色边框' } }],
                    },
                    {
                        type: 'fieldset',
                        options: { legend: 'Success', color: 'success' },
                        children: [{ tag: 'p', name: 'content', options: { text: 'Success 主题色边框' } }],
                    },
                    {
                        type: 'fieldset',
                        options: { legend: 'Warning', color: 'warning' },
                        children: [{ tag: 'p', name: 'content', options: { text: 'Warning 主题色边框' } }],
                    },
                ],
            },
        },
    ],
};
