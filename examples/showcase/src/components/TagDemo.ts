import type { DemoConfig } from './types';

export const TAG_DEMO: DemoConfig = {
    title: 'Tag',
    description: '标签组件，支持类型色（default/primary/success/warning/error/info）、可关闭、最大数量溢出、尺寸',
    sections: [
        {
            label: '基础标签',
            code: `{ type: 'tag', options: { tags: ['标签1', '标签2', '标签3'] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tag',
                        options: { tags: ['标签1', '标签2', '标签3'] },
                    },
                ],
            },
        },
        {
            label: '类型色 - primary',
            code: `{ type: 'tag', options: { tags: ['Primary'], tagType: 'primary' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tag',
                        options: { tags: ['Primary'], tagType: 'primary' },
                    },
                ],
            },
        },
        {
            label: '类型色 - success/warning/error/info',
            code: `{ type: 'tag', options: { tags: ['Success'], tagType: 'success' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                style: { gap: '8px' },
                children: [
                    {
                        type: 'tag',
                        options: { tags: ['Success'], tagType: 'success' },
                    },
                    {
                        type: 'tag',
                        options: { tags: ['Warning'], tagType: 'warning' },
                    },
                    {
                        type: 'tag',
                        options: { tags: ['Error'], tagType: 'error' },
                    },
                    {
                        type: 'tag',
                        options: { tags: ['Info'], tagType: 'info' },
                    },
                ],
            },
        },
        {
            label: '可关闭标签 (closable)',
            code: `{ type: 'tag', options: { tags: ['标签A', '标签B', '标签C'], closable: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tag',
                        options: { tags: ['标签A', '标签B', '标签C'], closable: true },
                    },
                ],
            },
        },
        {
            label: '最大数量溢出 (maxCount)',
            code: `{ type: 'tag', options: { tags: ['A', 'B', 'C', 'D', 'E'], maxCount: 3 } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tag',
                        options: { tags: ['A', 'B', 'C', 'D', 'E'], maxCount: 3 },
                    },
                ],
            },
        },
        {
            label: '尺寸 (size)',
            code: `{ type: 'tag', options: { tags: ['小', '中', '大'], size: 'sm | md | lg' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                style: { gap: '8px' },
                children: [
                    {
                        type: 'tag',
                        options: { tags: ['小尺寸'], size: 'sm' },
                    },
                    {
                        type: 'tag',
                        options: { tags: ['中尺寸'], size: 'md' },
                    },
                    {
                        type: 'tag',
                        options: { tags: ['大尺寸'], size: 'lg' },
                    },
                ],
            },
        },
        {
            label: '垂直方向 (direction)',
            code: `{ type: 'tag', options: { tags: ['A', 'B', 'C'], direction: 'vertical' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tag',
                        options: { tags: ['A', 'B', 'C'], direction: 'vertical' },
                    },
                ],
            },
        },
    ],
};
