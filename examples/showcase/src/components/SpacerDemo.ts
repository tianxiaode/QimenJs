import type { DemoConfig } from './types';

export const SPACER_DEMO: DemoConfig = {
    title: 'Spacer',
    description: '弹性间距组件，在 flex 布局中自动填充剩余空间，或通过 size 指定固定宽度',
    sections: [
        {
            label: '弹性填充（默认）',
            code: `{ type: 'spacer' } — 在 flex 容器中自动填充剩余空间`,
            template: {
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', width: '100%', border: '1px solid #dcdfe6', padding: '8px' },
                children: [
                    { tag: 'span', options: { text: '左侧' } },
                    { type: 'spacer' },
                    { tag: 'span', options: { text: '右侧' } },
                ],
            },
        },
        {
            label: '多个 Spacer 分配空间',
            code: `左 | spacer | 中 | spacer | 右`,
            template: {
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', width: '100%', border: '1px solid #dcdfe6', padding: '8px' },
                children: [
                    { tag: 'span', options: { text: '左' } },
                    { type: 'spacer' },
                    { tag: 'span', options: { text: '中' } },
                    { type: 'spacer' },
                    { tag: 'span', options: { text: '右' } },
                ],
            },
        },
        {
            label: 'Spacer 在按钮组中的应用',
            code: `按钮 | spacer | 按钮组`,
            template: {
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', width: '100%', border: '1px solid #dcdfe6', padding: '8px', gap: '8px' },
                children: [
                    { type: 'button', options: { text: '保存', color: 'primary', size: 'sm' } },
                    { type: 'spacer' },
                    { type: 'button', options: { text: '取消', size: 'sm' } },
                    { type: 'button', options: { text: '删除', color: 'error', size: 'sm' } },
                ],
            },
        },
    ],
};
