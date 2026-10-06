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
                    {
                        type: 'icon',
                        options: { iconCls: 'fa-solid fa-triangle-exclamation', color: 'warning' },
                    },
                    { type: 'icon', options: { iconCls: 'fa-solid fa-xmark', color: 'error' } },
                    {
                        type: 'icon',
                        options: { iconCls: 'fa-solid fa-circle-info', color: 'info' },
                    },
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
                    {
                        type: 'icon',
                        options: { iconCls: 'fa-solid fa-heart', color: 'error', size: 'xl' },
                    },
                    {
                        type: 'icon',
                        options: { iconCls: 'fa-solid fa-star', color: 'warning', size: 'lg' },
                    },
                    {
                        type: 'icon',
                        options: { iconCls: 'fa-solid fa-check', color: 'success', size: 'sm' },
                    },
                ],
            },
        },
        {
            label: 'QIcon 字体图标',
            code: `{ type: 'icon', options: { iconCls: 'q-icon-check' } }
{ type: 'icon', options: { iconCls: 'q-icon-close' } }
{ type: 'icon', options: { iconCls: 'q-icon-search' } }
{ type: 'icon', options: { iconCls: 'q-icon-home' } }
{ type: 'icon', options: { iconCls: 'q-icon-settings' } }
{ type: 'icon', options: { iconCls: 'q-icon-edit' } }
{ type: 'icon', options: { iconCls: 'q-icon-delete' } }
{ type: 'icon', options: { iconCls: 'q-icon-menu' } }
{ type: 'icon', options: { iconCls: 'q-icon-more' } }
{ type: 'icon', options: { iconCls: 'q-icon-add' } }
{ type: 'icon', options: { iconCls: 'q-icon-filter' } }
{ type: 'icon', options: { iconCls: 'q-icon-refresh' } }
{ type: 'icon', options: { iconCls: 'q-icon-caret-down' } }
{ type: 'icon', options: { iconCls: 'q-icon-caret-up' } }
{ type: 'icon', options: { iconCls: 'q-icon-arrow-down' } }
{ type: 'icon', options: { iconCls: 'q-icon-arrow-up' } }
{ type: 'icon', options: { iconCls: 'q-icon-arrow-left' } }
{ type: 'icon', options: { iconCls: 'q-icon-arrow-right' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'icon', options: { iconCls: 'q-icon-check' } },
                    { type: 'icon', options: { iconCls: 'q-icon-close' } },
                    { type: 'icon', options: { iconCls: 'q-icon-search' } },
                    { type: 'icon', options: { iconCls: 'q-icon-home' } },
                    { type: 'icon', options: { iconCls: 'q-icon-settings' } },
                    { type: 'icon', options: { iconCls: 'q-icon-edit' } },
                    { type: 'icon', options: { iconCls: 'q-icon-delete' } },
                    { type: 'icon', options: { iconCls: 'q-icon-menu' } },
                    { type: 'icon', options: { iconCls: 'q-icon-more' } },
                    { type: 'icon', options: { iconCls: 'q-icon-add' } },
                    { type: 'icon', options: { iconCls: 'q-icon-filter' } },
                    { type: 'icon', options: { iconCls: 'q-icon-refresh' } },
                    { type: 'icon', options: { iconCls: 'q-icon-caret-down' } },
                    { type: 'icon', options: { iconCls: 'q-icon-caret-up' } },
                    { type: 'icon', options: { iconCls: 'q-icon-arrow-down' } },
                    { type: 'icon', options: { iconCls: 'q-icon-arrow-up' } },
                    { type: 'icon', options: { iconCls: 'q-icon-arrow-left' } },
                    { type: 'icon', options: { iconCls: 'q-icon-arrow-right' } },
                ],
            },
        },
        {
            label: 'QIcon Checkbox/Radio',
            code: `{ type: 'icon', options: { iconCls: 'q-icon-checkbox' } }
{ type: 'icon', options: { iconCls: 'q-icon-checkbox-check' } }
{ type: 'icon', options: { iconCls: 'q-icon-radio' } }
{ type: 'icon', options: { iconCls: 'q-icon-radio-check' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'icon', options: { iconCls: 'q-icon-checkbox' } },
                    { type: 'icon', options: { iconCls: 'q-icon-checkbox-check', color: 'primary' } },
                    { type: 'icon', options: { iconCls: 'q-icon-radio' } },
                    { type: 'icon', options: { iconCls: 'q-icon-radio-check', color: 'primary' } },
                ],
            },
        },
        {
            label: 'QIcon + 颜色',
            code: `{ type: 'icon', options: { iconCls: 'q-icon-check', color: 'success' } }
{ type: 'icon', options: { iconCls: 'q-icon-close', color: 'error' } }
{ type: 'icon', options: { iconCls: 'q-icon-search', color: 'primary' } }
{ type: 'icon', options: { iconCls: 'q-icon-home', color: 'warning' } }
{ type: 'icon', options: { iconCls: 'q-icon-settings', color: 'info' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'icon', options: { iconCls: 'q-icon-check', color: 'success' } },
                    { type: 'icon', options: { iconCls: 'q-icon-close', color: 'error' } },
                    { type: 'icon', options: { iconCls: 'q-icon-search', color: 'primary' } },
                    { type: 'icon', options: { iconCls: 'q-icon-home', color: 'warning' } },
                    { type: 'icon', options: { iconCls: 'q-icon-settings', color: 'info' } },
                ],
            },
        },
    ],
};
