import type { DemoConfig } from './types';

export const DIVIDER_DEMO: DemoConfig = {
    title: 'Divider',
    description: '分割线组件，支持水平/垂直方向、文字标签和虚线样式',
    sections: [
        {
            label: '水平分割线（默认）',
            code: `{ type: 'divider' }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { tag: 'p', options: { text: '上方内容' } },
                    { type: 'divider' },
                    { tag: 'p', options: { text: '下方内容' } },
                ],
            },
        },
        {
            label: '带文字标签',
            code: `{ type: 'divider', options: { text: '或者' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { tag: 'p', options: { text: '方式一' } },
                    { type: 'divider', options: { text: '或者' } },
                    { tag: 'p', options: { text: '方式二' } },
                ],
            },
        },
        {
            label: '虚线分割线',
            code: `{ type: 'divider', options: { dashed: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { tag: 'p', options: { text: '上方内容' } },
                    { type: 'divider', options: { dashed: true } },
                    { tag: 'p', options: { text: '下方内容' } },
                ],
            },
        },
        {
            label: '垂直分割线',
            code: `{ type: 'divider', options: { vertical: true } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', height: '40px', gap: '12px' },
                children: [
                    { tag: 'span', options: { text: '左' } },
                    { type: 'divider', options: { vertical: true } },
                    { tag: 'span', options: { text: '中' } },
                    { type: 'divider', options: { vertical: true } },
                    { tag: 'span', options: { text: '右' } },
                ],
            },
        },
        {
            label: '垂直虚线分割线',
            code: `{ type: 'divider', options: { vertical: true, dashed: true } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', height: '40px', gap: '12px' },
                children: [
                    { tag: 'span', options: { text: 'A' } },
                    { type: 'divider', options: { vertical: true, dashed: true } },
                    { tag: 'span', options: { text: 'B' } },
                ],
            },
        },
    ],
};
