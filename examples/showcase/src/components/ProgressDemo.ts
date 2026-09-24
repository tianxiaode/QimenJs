import type { DemoConfig } from './types';

export const PROGRESS_DEMO: DemoConfig = {
    title: 'Progress',
    description: '进度条组件，支持百分比、类型色、自定义颜色、条纹动画、文字显示及位置',
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
            label: '自定义颜色 (color)',
            code: `{ type: 'progress', options: { percent: 60, color: 'primary | secondary | success | warning | error | info' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                style: { gap: '8px' },
                children: [
                    {
                        type: 'progress',
                        options: { percent: 60, color: 'primary', showText: true },
                    },
                    {
                        type: 'progress',
                        options: { percent: 70, color: 'secondary', showText: true },
                    },
                    {
                        type: 'progress',
                        options: { percent: 80, color: 'info', showText: true },
                    },
                    {
                        type: 'progress',
                        options: { percent: 90, color: 'success', showText: true },
                    },
                ],
            },
        },
        {
            label: '文字位置 - 居中 (textPosition: center)',
            code: `{ type: 'progress', options: { percent: 60, showText: true, textPosition: 'center' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                style: { gap: '8px' },
                children: [
                    {
                        type: 'progress',
                        options: { percent: 30, showText: true, textPosition: 'center' },
                    },
                    {
                        type: 'progress',
                        options: { percent: 60, showText: true, textPosition: 'center', progressType: 'success' },
                    },
                    {
                        type: 'progress',
                        options: { percent: 85, showText: true, textPosition: 'center', progressType: 'warning' },
                    },
                    {
                        type: 'progress',
                        options: { percent: 100, showText: true, textPosition: 'center', color: 'info' },
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
