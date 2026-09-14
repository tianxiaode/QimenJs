import type { DemoConfig } from './types';

export const BUTTON_DEMO: DemoConfig = {
    title: 'Button',
    description: '按钮组件，支持 size/color/ghost/pressed/iconCls/iconAlign/busy/arrowCls 等 option',
    sections: [
        {
            label: 'Size',
            code: `{ type: 'button', options: { text: 'XS', size: 'xs' } }
{ type: 'button', options: { text: 'SM', size: 'sm' } }
{ type: 'button', options: { text: 'MD', size: 'md' } }
{ type: 'button', options: { text: 'LG', size: 'lg' } }
{ type: 'button', options: { text: 'XL', size: 'xl' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'XS', size: 'xs' } },
                    { type: 'button', options: { text: 'SM', size: 'sm' } },
                    { type: 'button', options: { text: 'MD', size: 'md' } },
                    { type: 'button', options: { text: 'LG', size: 'lg' } },
                    { type: 'button', options: { text: 'XL', size: 'xl' } },
                ],
            },
        },
        {
            label: 'Color',
            code: `{ type: 'button', options: { text: 'Primary', color: 'primary' } }
{ type: 'button', options: { text: 'Secondary', color: 'secondary' } }
{ type: 'button', options: { text: 'Success', color: 'success' } }
{ type: 'button', options: { text: 'Warning', color: 'warning' } }
{ type: 'button', options: { text: 'Error', color: 'error' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Primary', color: 'primary' } },
                    { type: 'button', options: { text: 'Secondary', color: 'secondary' } },
                    { type: 'button', options: { text: 'Success', color: 'success' } },
                    { type: 'button', options: { text: 'Warning', color: 'warning' } },
                    { type: 'button', options: { text: 'Error', color: 'error' } },
                ],
            },
        },
        {
            label: 'Ghost (幽灵按钮)',
            code: `{ type: 'button', options: { text: 'Primary', color: 'primary', ghost: true } }
{ type: 'button', options: { text: 'Success', color: 'success', ghost: true } }
{ type: 'button', options: { text: 'Error', color: 'error', ghost: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Primary', color: 'primary', ghost: true } },
                    { type: 'button', options: { text: 'Success', color: 'success', ghost: true } },
                    { type: 'button', options: { text: 'Error', color: 'error', ghost: true } },
                ],
            },
        },
        {
            label: 'Pressed (按下状态)',
            code: `{ type: 'button', options: { text: 'Normal' } }
{ type: 'button', options: { text: 'Pressed', pressed: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Normal' } },
                    { type: 'button', options: { text: 'Pressed', pressed: true } },
                ],
            },
        },
        {
            label: 'Icon (iconCls)',
            code: `{ type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Home' } }
{ type: 'button', options: { iconCls: 'fa-solid fa-gear' } }
{ type: 'button', options: { iconCls: 'fa-solid fa-trash', color: 'error' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Home' } },
                    { type: 'button', options: { iconCls: 'fa-solid fa-gear' } },
                    { type: 'button', options: { iconCls: 'fa-solid fa-trash', color: 'error' } },
                ],
            },
        },
        {
            label: 'Icon Align (iconAlign)',
            code: `{ type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Left', iconAlign: 'left' } }
{ type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Right', iconAlign: 'right' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Left', iconAlign: 'left' } },
                    { type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Right', iconAlign: 'right' } },
                ],
            },
        },
        {
            label: 'Busy (加载状态)',
            code: `{ type: 'button', options: { text: 'Loading', busy: true } }
{ type: 'button', options: { text: 'Normal' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Loading', busy: true } },
                    { type: 'button', options: { text: 'Normal' } },
                ],
            },
        },
        {
            label: 'Arrow (arrowCls)',
            code: `{ type: 'button', options: { text: 'Dropdown', arrowCls: 'fa-solid fa-chevron-down' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Dropdown', arrowCls: 'fa-solid fa-chevron-down' } },
                ],
            },
        },
        {
            label: 'Disable',
            code: `{ type: 'button', options: { text: 'Disabled', disable: true } }
{ type: 'button', options: { text: 'Disabled Ghost', disable: true, ghost: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Disabled', disable: true } },
                    { type: 'button', options: { text: 'Disabled Ghost', disable: true, ghost: true } },
                ],
            },
        },
    ],
};
