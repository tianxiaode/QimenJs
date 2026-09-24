import type { DemoConfig } from './types';

export const STATISTIC_DEMO: DemoConfig = {
    title: 'Statistic',
    description: '统计数值组件，支持标题、值、前缀/后缀、趋势（up/down/flat）、格式化、精度、图标',
    sections: [
        {
            label: '基础统计',
            code: `{ type: 'statistic', options: { title: '活跃用户', value: 12345 } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'statistic',
                        options: { title: '活跃用户', value: 12345 },
                    },
                ],
            },
        },
        {
            label: '带前缀和后缀 (prefix/suffix)',
            code: `{ type: 'statistic', options: { title: '月收入', value: 29999, prefix: '¥', suffix: '/月' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'statistic',
                        options: { title: '月收入', value: 29999, prefix: '¥', suffix: '/月' },
                    },
                ],
            },
        },
        {
            label: '上升趋势 (trend: up)',
            code: `{ type: 'statistic', options: { title: '销售额', value: 56000, trend: 'up', trendText: '12.5%' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'statistic',
                        options: { title: '销售额', value: 56000, trend: 'up', trendText: '12.5%' },
                    },
                ],
            },
        },
        {
            label: '下降趋势 (trend: down)',
            code: `{ type: 'statistic', options: { title: '流失率', value: 8.3, trend: 'down', trendText: '3.2%' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'statistic',
                        options: { title: '流失率', value: 8.3, trend: 'down', trendText: '3.2%' },
                    },
                ],
            },
        },
        {
            label: '格式化 (format)',
            code: `{ type: 'statistic', options: { title: '总收入', value: 1234567.89, format: 'currency' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'statistic',
                        options: { title: '总收入', value: 1234567.89, format: 'currency' },
                    },
                ],
            },
        },
        {
            label: '精度 (precision)',
            code: `{ type: 'statistic', options: { title: '转化率', value: 85.567, precision: 2, suffix: '%' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'statistic',
                        options: { title: '转化率', value: 85.567, precision: 2, suffix: '%' },
                    },
                ],
            },
        },
        {
            label: '多个统计对比',
            code: `{ type: 'statistic', options: { title: '...', value: ..., trend: 'up | down | flat' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                style: { gap: '24px' },
                children: [
                    {
                        type: 'statistic',
                        options: { title: '总用户', value: 89320, trend: 'up', trendText: '8.2%' },
                    },
                    {
                        type: 'statistic',
                        options: { title: '活跃用户', value: 45600, trend: 'up', trendText: '3.1%' },
                    },
                    {
                        type: 'statistic',
                        options: { title: '流失用户', value: 1280, trend: 'down', trendText: '1.5%' },
                    },
                ],
            },
        },
    ],
};
