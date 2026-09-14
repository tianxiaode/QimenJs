import type { DemoConfig } from './types';

export const AVATAR_DEMO: DemoConfig = {
    title: 'Avatar',
    description: '头像组件，支持 src(图片)/text(文字首字母)/iconCls(图标) 三种模式，size/color option',
    sections: [
        {
            label: 'Size',
            code: `{ type: 'avatar', options: { text: 'A', size: 'xs' } }
{ type: 'avatar', options: { text: 'A', size: 'sm' } }
{ type: 'avatar', options: { text: 'A', size: 'md' } }
{ type: 'avatar', options: { text: 'A', size: 'lg' } }
{ type: 'avatar', options: { text: 'A', size: 'xl' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'avatar', options: { text: 'A', size: 'xs' } },
                    { type: 'avatar', options: { text: 'A', size: 'sm' } },
                    { type: 'avatar', options: { text: 'A', size: 'md' } },
                    { type: 'avatar', options: { text: 'A', size: 'lg' } },
                    { type: 'avatar', options: { text: 'A', size: 'xl' } },
                ],
            },
        },
        {
            label: 'Color',
            code: `{ type: 'avatar', options: { text: 'P', color: 'primary' } }
{ type: 'avatar', options: { text: 'S', color: 'secondary' } }
{ type: 'avatar', options: { text: 'G', color: 'success' } }
{ type: 'avatar', options: { text: 'W', color: 'warning' } }
{ type: 'avatar', options: { text: 'E', color: 'error' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'avatar', options: { text: 'P', color: 'primary' } },
                    { type: 'avatar', options: { text: 'S', color: 'secondary' } },
                    { type: 'avatar', options: { text: 'G', color: 'success' } },
                    { type: 'avatar', options: { text: 'W', color: 'warning' } },
                    { type: 'avatar', options: { text: 'E', color: 'error' } },
                ],
            },
        },
        {
            label: 'Image (src)',
            code: `{ type: 'avatar', options: { src: '/avatar-1.svg', size: 'sm' } }
{ type: 'avatar', options: { src: '/avatar-2.svg', size: 'md' } }
{ type: 'avatar', options: { src: '/avatar-3.svg', size: 'lg' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'avatar', options: { src: '/avatar-1.svg', size: 'sm' } },
                    { type: 'avatar', options: { src: '/avatar-2.svg', size: 'md' } },
                    { type: 'avatar', options: { src: '/avatar-3.svg', size: 'lg' } },
                ],
            },
        },
        {
            label: 'Text',
            code: `{ type: 'avatar', options: { text: 'Alice', size: 'sm' } }
{ type: 'avatar', options: { text: 'Bob', size: 'md' } }
{ type: 'avatar', options: { text: 'Charlie', size: 'lg' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'avatar', options: { text: 'Alice', size: 'sm' } },
                    { type: 'avatar', options: { text: 'Bob', size: 'md' } },
                    { type: 'avatar', options: { text: 'Charlie', size: 'lg' } },
                ],
            },
        },
        {
            label: 'Icon (iconCls)',
            code: `{ type: 'avatar', options: { iconCls: 'fa-solid fa-user', size: 'sm' } }
{ type: 'avatar', options: { iconCls: 'fa-solid fa-user', size: 'md' } }
{ type: 'avatar', options: { iconCls: 'fa-solid fa-user', size: 'lg' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'avatar', options: { iconCls: 'fa-solid fa-user', size: 'sm' } },
                    { type: 'avatar', options: { iconCls: 'fa-solid fa-user', size: 'md' } },
                    { type: 'avatar', options: { iconCls: 'fa-solid fa-user', size: 'lg' } },
                ],
            },
        },
        {
            label: 'Color + Size',
            code: `{ type: 'avatar', options: { text: 'A', color: 'primary', size: 'sm' } }
{ type: 'avatar', options: { text: 'A', color: 'success', size: 'md' } }
{ type: 'avatar', options: { text: 'A', color: 'error', size: 'lg' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'avatar', options: { text: 'A', color: 'primary', size: 'sm' } },
                    { type: 'avatar', options: { text: 'A', color: 'success', size: 'md' } },
                    { type: 'avatar', options: { text: 'A', color: 'error', size: 'lg' } },
                ],
            },
        },
    ],
};
