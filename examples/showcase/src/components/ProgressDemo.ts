import type { DemoConfig } from './types';

export const PROGRESS_DEMO: DemoConfig = {
    title: 'Progress',
    description: '进度条组件，支持百分比、类型色（default/success/warning/error）、条纹动画、文字显示',
    sections: [
        {
            label: '基础进度条',
            code: `{ type: 'progress', options: { percent: 60 } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'progress',
                        options: { percent: 60 },
                    },
                ],
            },
        },
        {
            label: '显示百分比文字 (showText)',
            code: `{ type: 'progress', options: { percent: 45, showText: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'progress',
                        options: { percent: 45, showText: true },
                    },
                ],
            },
        },
        {
            label: '类型色 - success',
            code: `{ type: 'progress', options: { percent: 100, progressType: 'success', showText: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'progress',
                        options: { percent: 100, progressType: 'success', showText: true },
                    },
                ],
            },
        },
        {
            label: '类型色 - warning',
            code: `{ type: 'progress', options: { percent: 75, progressType: 'warning', showText: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'progress',
                        options: { percent: 75, progressType: 'warning', showText: true },
                    },
                ],
            },
        },
        {
            label: '类型色 - error',
            code: `{ type: 'progress', options: { percent: 30, progressType: 'error', showText: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'progress',
                        options: { percent: 30, progressType: 'error', showText: true },
                    },
                ],
            },
        },
        {
            label: '条纹动画 (striped)',
            code: `{ type: 'progress', options: { percent: 50, striped: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'progress',
                        options: { percent: 50, striped: true },
                    },
                ],
            },
        },
        {
            label: '不同百分比对比',
            code: `{ type: 'progress', options: { percent: 25 | 50 | 75 | 100, showText: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                style: { gap: '8px' },
                children: [
                    {
                        type: 'progress',
                        options: { percent: 25, showText: true },
                    },
                    {
                        type: 'progress',
                        options: { percent: 50, showText: true },
                    },
                    {
                        type: 'progress',
                        options: { percent: 75, showText: true },
                    },
                    {
                        type: 'progress',
                        options: { percent: 100, progressType: 'success', showText: true },
                    },
                ],
            },
        },
    ],
};
