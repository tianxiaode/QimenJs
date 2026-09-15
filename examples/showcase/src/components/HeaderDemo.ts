import type { DemoConfig } from './types';

export const HEADER_DEMO: DemoConfig = {
    title: 'Header',
    description: '头部组件，由 icon + title + subtitle + toolsLeft + toolsRight + action 组成',
    sections: [
        {
            label: '基础标题',
            code: `{ type: 'header', options: { title: '页面标题' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'header', options: { title: '页面标题' } },
                ],
            },
        },
        {
            label: '带图标',
            code: `{ type: 'header', options: { title: '通知中心', icon: '🔔' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'header', options: { title: '通知中心', icon: '🔔' } },
                ],
            },
        },
        {
            label: '带副标题',
            code: `{ type: 'header', options: { title: '数据概览', subtitle: '2026年度报告' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'header', options: { title: '数据概览', subtitle: '2026年度报告' } },
                ],
            },
        },
        {
            label: '带操作按钮 (action)',
            code: `{ type: 'header', options: { title: '用户管理', action: { text: '新增' } } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '用户管理',
                            action: { text: '新增' },
                        } as any,
                    },
                ],
            },
        },
        {
            label: '完整结构',
            code: `{ type: 'header', options: { title: '项目设置', icon: '⚙', subtitle: '配置管理', action: { text: '保存' } } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'header',
                        options: {
                            title: '项目设置',
                            icon: '⚙',
                            subtitle: '配置管理',
                            action: { text: '保存' },
                        } as any,
                    },
                ],
            },
        },
    ],
};
