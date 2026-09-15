import type { DemoConfig } from './types';

export const TEXT_DEMO: DemoConfig = {
    title: 'Text',
    description: '文本组件，支持 text 内容、tag HTML标签、size 尺寸、color 颜色',
    sections: [
        {
            label: '基础文本',
            code: `{ type: 'text', options: { text: 'Hello World' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { type: 'text', options: { text: '普通文本内容' } },
                    { type: 'text', options: { text: '另一段文本' } },
                ],
            },
        },
        {
            label: '尺寸 (size)',
            code: `{ type: 'text', options: { text: 'XS', size: 'xs' } }
{ type: 'text', options: { text: 'SM', size: 'sm' } }
{ type: 'text', options: { text: 'MD', size: 'md' } }
{ type: 'text', options: { text: 'LG', size: 'lg' } }
{ type: 'text', options: { text: 'XL', size: 'xl' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { type: 'text', options: { text: 'XS 尺寸文本', size: 'xs' } },
                    { type: 'text', options: { text: 'SM 尺寸文本', size: 'sm' } },
                    { type: 'text', options: { text: 'MD 尺寸文本（默认）', size: 'md' } },
                    { type: 'text', options: { text: 'LG 尺寸文本', size: 'lg' } },
                    { type: 'text', options: { text: 'XL 尺寸文本', size: 'xl' } },
                ],
            },
        },
        {
            label: '颜色 (color)',
            code: `{ type: 'text', options: { text: 'Primary', color: 'primary' } }
{ type: 'text', options: { text: 'Success', color: 'success' } }
{ type: 'text', options: { text: 'Warning', color: 'warning' } }
{ type: 'text', options: { text: 'Error', color: 'error' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { type: 'text', options: { text: 'Primary 颜色文本', color: 'primary' } },
                    { type: 'text', options: { text: 'Success 颜色文本', color: 'success' } },
                    { type: 'text', options: { text: 'Warning 颜色文本', color: 'warning' } },
                    { type: 'text', options: { text: 'Error 颜色文本', color: 'error' } },
                    { type: 'text', options: { text: 'Info 颜色文本', color: 'info' } },
                ],
            },
        },
        {
            label: 'HTML 标签 (tag)',
            code: `{ type: 'text', options: { text: '标题', tag: 'h2' } }
{ type: 'text', options: { text: '段落', tag: 'p' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { type: 'text', options: { text: 'H1 标题', tag: 'h1' } },
                    { type: 'text', options: { text: 'H2 标题', tag: 'h2' } },
                    { type: 'text', options: { text: 'H3 标题', tag: 'h3' } },
                    { type: 'text', options: { text: '段落文本', tag: 'p' } },
                ],
            },
        },
        {
            label: '颜色 + 尺寸组合',
            code: `{ type: 'text', options: { text: '大号成功', color: 'success', size: 'lg' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                children: [
                    { type: 'text', options: { text: '大号 Primary', color: 'primary', size: 'lg' } },
                    { type: 'text', options: { text: '大号 Success', color: 'success', size: 'lg' } },
                    { type: 'text', options: { text: '小号 Error', color: 'error', size: 'sm' } },
                    { type: 'text', options: { text: '小号 Warning', color: 'warning', size: 'sm' } },
                ],
            },
        },
    ],
};
