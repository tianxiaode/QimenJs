import type { DemoConfig } from './types';

export const ICON_DEMO: DemoConfig = {
    title: 'Icon',
    description: '图标组件，通过 iconCls 指定 CSS 类名渲染图标，支持 size 尺寸控制',
    sections: [
        {
            label: '基础图标',
            code: `{ type: 'icon', options: { iconCls: 'fa-solid fa-home' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'icon', options: { iconCls: 'fa-solid fa-home' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-gear' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-trash' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-user' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-heart' } },
                ],
            },
        },
        {
            label: '尺寸 (size)',
            code: `{ type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'sm' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'md' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'lg' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'sm' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'md' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'lg' } },
                ],
            },
        },
        {
            label: '不同图标类型',
            code: `{ type: 'icon', options: { iconCls: 'fa-solid fa-check' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-xmark' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-circle-info' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-triangle-exclamation' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'icon', options: { iconCls: 'fa-solid fa-check' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-xmark' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-circle-info' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-triangle-exclamation' } },
                ],
            },
        },
        {
            label: '带文字组合',
            code: `{ type: 'icon', options: { iconCls: 'fa-solid fa-download' } } + Text`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        tag: 'span',
                        style: { display: 'inline-flex', alignItems: 'center', gap: '6px' },
                        children: [
                            { type: 'icon', options: { iconCls: 'fa-solid fa-download' } },
                            { tag: 'span', options: { text: '下载' } },
                        ],
                    },
                    {
                        tag: 'span',
                        style: { display: 'inline-flex', alignItems: 'center', gap: '6px' },
                        children: [
                            { type: 'icon', options: { iconCls: 'fa-solid fa-upload' } },
                            { tag: 'span', options: { text: '上传' } },
                        ],
                    },
                    {
                        tag: 'span',
                        style: { display: 'inline-flex', alignItems: 'center', gap: '6px' },
                        children: [
                            { type: 'icon', options: { iconCls: 'fa-solid fa-search' } },
                            { tag: 'span', options: { text: '搜索' } },
                        ],
                    },
                ],
            },
        },
    ],
};
