import type { DemoConfig } from './types';

export const LABEL_DEMO: DemoConfig = {
    title: 'Label',
    description: '标签组件，支持文本、必填标记、语义角色，适用于非表单场景',
    sections: [
        {
            label: '基础标签',
            code: `{ type: 'label', options: { text: '用户名' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { type: 'label', options: { text: '用户名' } },
                    { type: 'label', options: { text: '邮箱地址' } },
                    { type: 'label', options: { text: '密码' } },
                ],
            },
        },
        {
            label: '必填标记 (required)',
            code: `{ type: 'label', options: { text: '用户名', required: true } }
{ type: 'label', options: { text: '邮箱', required: true, requiredMarkPosition: 'before' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { type: 'label', options: { text: '用户名', required: true } },
                    { type: 'label', options: { text: '邮箱', required: true, requiredMarkPosition: 'before' } },
                    { type: 'label', options: { text: '备注', required: false } },
                ],
            },
        },
        {
            label: '自定义必填符号 (requiredMark)',
            code: `{ type: 'label', options: { text: '字段A', required: true, requiredMark: '**' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { type: 'label', options: { text: '字段A', required: true, requiredMark: '**' } },
                    { type: 'label', options: { text: '字段B', required: true, requiredMark: '(必填)' } },
                ],
            },
        },
        {
            label: 'HTML 标签 (tag)',
            code: `{ type: 'label', options: { text: 'span标签', tag: 'span' } }
{ type: 'label', options: { text: 'div标签', tag: 'div' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { type: 'label', options: { text: '默认 label 标签' } },
                    { type: 'label', options: { text: 'span 标签', tag: 'span' } },
                    { type: 'label', options: { text: 'div 标签', tag: 'div' } },
                ],
            },
        },
        {
            label: '语义角色 (role)',
            code: `{ type: 'label', options: { text: '列标题', role: 'columnheader' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { type: 'label', options: { text: '列标题', role: 'columnheader' } },
                    { type: 'label', options: { text: '行标题', role: 'rowheader' } },
                ],
            },
        },
    ],
};
