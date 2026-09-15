import type { DemoConfig } from './types';

export const ICON_DEMO: DemoConfig = {
    title: 'Icon',
    description: '图标组件，通过 iconCls 指定 CSS 类名渲染图标，支持 size 尺寸和 color 颜色控制',
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
            code: `{ type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'xs' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'sm' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'md' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'lg' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'xl' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'xs' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'sm' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'md' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'lg' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-home', size: 'xl' } },
                ],
            },
        },
        {
            label: '颜色 (color)',
            code: `{ type: 'icon', options: { iconCls: 'fa-solid fa-home', color: 'primary' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-check', color: 'success' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-triangle-exclamation', color: 'warning' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-xmark', color: 'error' } }
{ type: 'icon', options: { iconCls: 'fa-solid fa-circle-info', color: 'info' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'icon', options: { iconCls: 'fa-solid fa-home', color: 'primary' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-check', color: 'success' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-triangle-exclamation', color: 'warning' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-xmark', color: 'error' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-circle-info', color: 'info' } },
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
            label: '颜色 + 尺寸组合',
            code: `{ type: 'icon', options: { iconCls: 'fa-solid fa-heart', color: 'error', size: 'xl' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'icon', options: { iconCls: 'fa-solid fa-heart', color: 'error', size: 'xl' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-star', color: 'warning', size: 'lg' } },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-check', color: 'success', size: 'sm' } },
                ],
            },
        },
    ],
};
