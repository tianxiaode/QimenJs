import type { DemoConfig } from './types';

export const FIELDSET_DEMO: DemoConfig = {
    title: 'Fieldset',
    description: '字段集组件，legend 浮在边框上，支持 collapsible 折叠、toggleIconCls 自定义箭头、color 主题色、content 内容',
    sections: [
        {
            label: '基础字段集',
            code: `{ type: 'fieldset', options: { legend: '基本信息', content: '字段集内容区域' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { legend: '基本信息', content: '字段集内容区域' },
                        style: { width: '300px' },
                    },
                ],
            },
        },
        {
            label: '可折叠 (collapsible)',
            code: `{ type: 'fieldset', options: { legend: '高级设置', collapsible: true, content: '可折叠的内容区域' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { legend: '高级设置', collapsible: true, content: '可折叠的内容区域，点击 legend 可展开/收起' },
                        style: { width: '300px' },
                    },
                ],
            },
        },
        {
            label: '初始收起 (collapsed)',
            code: `{ type: 'fieldset', options: { legend: '隐藏内容', collapsible: true, collapsed: true, content: '...' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { legend: '隐藏内容', collapsible: true, collapsed: true, content: '此内容默认不可见，需点击 legend 展开' },
                        style: { width: '300px' },
                    },
                ],
            },
        },
        {
            label: '无标题字段集',
            code: `{ type: 'fieldset', options: { content: '没有 legend 的字段集' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { content: '没有 legend 的字段集' },
                        style: { width: '300px' },
                    },
                ],
            },
        },
        {
            label: '自定义箭头 (toggleIconCls)',
            code: `{ type: 'fieldset', options: { legend: '自定义箭头', collapsible: true, toggleIconCls: 'fa fa-chevron-down', content: '...' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { legend: '自定义箭头', collapsible: true, toggleIconCls: 'fa fa-chevron-down', content: '使用 FontAwesome 图标替代默认 CSS 箭头' },
                        style: { width: '300px' },
                    },
                ],
            },
        },
        {
            label: '主题色 (color)',
            code: `{ type: 'fieldset', options: { legend: 'Primary', color: 'primary', content: '...' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: { legend: 'Primary', color: 'primary', content: 'Primary 主题色边框' },
                        style: { width: '200px' },
                    },
                    {
                        type: 'fieldset',
                        options: { legend: 'Success', color: 'success', content: 'Success 主题色边框' },
                        style: { width: '200px' },
                    },
                    {
                        type: 'fieldset',
                        options: { legend: 'Warning', color: 'warning', content: 'Warning 主题色边框' },
                        style: { width: '200px' },
                    },
                ],
            },
        },
        {
            label: 'TemplateDecl 内容',
            code: `{ type: 'fieldset', options: { legend: '复杂内容', content: { tag: 'div', children: [...] } } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'fieldset',
                        options: {
                            legend: '复杂内容',
                            content: {
                                tag: 'div',
                                children: [
                                    { tag: 'p', options: { text: '第一段内容' } },
                                    { tag: 'p', options: { text: '第二段内容' } },
                                ],
                            },
                        },
                        style: { width: '300px' },
                    },
                ],
            },
        },
    ],
};
