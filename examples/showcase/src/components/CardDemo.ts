import type { DemoConfig } from './types';

export const CARD_DEMO: DemoConfig = {
    title: 'Card',
    description: '卡片组件，由 header（icon + title + action）+ body + footer 三区组成，支持 color 主题色',
    sections: [
        {
            label: '基础卡片',
            code: `{ type: 'card', options: { title: '用户信息' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'card',
                        options: { title: '用户信息' },
                        children: [{ tag: 'p', name: 'body', options: { text: '这里是卡片内容区域' } }],
                    },
                ],
            },
        },
        {
            label: '带图标和操作按钮',
            code: `{ type: 'card', options: { title: '通知', icon: '🔔', action: '✕' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'card',
                        options: { title: '通知', icon: '🔔', action: '✕' },
                        children: [{ tag: 'p', name: 'body', options: { text: '有3条新消息待处理' } }],
                    },
                ],
            },
        },
        {
            label: '带底部区域 (footer)',
            code: `{ type: 'card', options: { title: '订单详情', footer: '总计: ¥299' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'card',
                        options: { title: '订单详情', footer: '总计: ¥299' },
                        children: [{ tag: 'p', name: 'body', options: { text: '商品A × 2, 商品B × 1' } }],
                    },
                ],
            },
        },
        {
            label: '主题色 (color)',
            code: `{ type: 'card', options: { title: '成功卡片', color: 'success' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'card',
                        options: { title: 'Primary 卡片', color: 'primary' },
                        children: [{ tag: 'p', name: 'body', options: { text: 'Primary 主题色卡片' } }],
                    },
                    {
                        type: 'card',
                        options: { title: 'Success 卡片', color: 'success' },
                        children: [{ tag: 'p', name: 'body', options: { text: 'Success 主题色卡片' } }],
                    },
                    {
                        type: 'card',
                        options: { title: 'Warning 卡片', color: 'warning' },
                        children: [{ tag: 'p', name: 'body', options: { text: 'Warning 主题色卡片' } }],
                    },
                ],
            },
        },
        {
            label: '完整结构',
            code: `{ type: 'card', options: { title: '完整卡片', icon: '📋', action: '⚙', footer: '更新时间: 2026-01' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'card',
                        options: { title: '完整卡片', icon: '📋', action: '⚙', footer: '更新时间: 2026-01' },
                        children: [
                            {
                                tag: 'div',
                                name: 'body',
                                children: [
                                    { tag: 'p', options: { text: '卡片正文内容第一段' } },
                                    { tag: 'p', options: { text: '卡片正文内容第二段' } },
                                ],
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
