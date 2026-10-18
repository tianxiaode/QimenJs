import type { DemoConfig } from './types';

export const SLIDER_DEMO: DemoConfig = {
    title: 'Slider',
    description: '滑块组件，支持 min/max/step/value/showValue/label/required',
    sections: [
        {
            label: '基础滑块',
            code: `{ type: 'slider', options: { min: 0, max: 100, step: 1 } }
{ type: 'slider', options: { value: 30, min: 0, max: 100, label: '默认值30' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'slider', options: { min: 0, max: 100, step: 1 } },
                    { type: 'slider', options: { value: 30, min: 0, max: 100, label: '默认值30' } },
                ],
            },
        },
        {
            label: '步长（step）',
            code: `{ type: 'slider', options: { min: 0, max: 100, step: 10, value: 50, label: '步长10' } }
{ type: 'slider', options: { min: 0, max: 1, step: 0.1, value: 0.5, label: '步长0.1' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'slider', options: { min: 0, max: 100, step: 10, value: 50, label: '步长10' } },
                    { type: 'slider', options: { min: 0, max: 1, step: 0.1, value: 0.5, label: '步长0.1' } },
                ],
            },
        },
        {
            label: '不显示当前值（showValue: false）',
            code: `{ type: 'slider', options: {
    min: 0, max: 100, step: 1, value: 50,
    showValue: false,
    label: '不显示数值',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'slider', options: { min: 0, max: 100, step: 1, value: 50, showValue: false, label: '不显示数值' } },
                ],
            },
        },
    ],
};

export const TEXTAREA_DEMO: DemoConfig = {
    title: 'Textarea',
    description: '多行文本输入组件，支持 rows/maxLength/readonly/autoSize/placeholder/label',
    sections: [
        {
            label: '基础多行文本',
            code: `{ type: 'textarea', options: { placeholder: '请输入内容' } }
{ type: 'textarea', options: { value: '预填内容', label: '备注' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'textarea', options: { placeholder: '请输入内容' } },
                    { type: 'textarea', options: { value: '预填内容', label: '备注' } },
                ],
            },
        },
        {
            label: '指定行数（rows）',
            code: `{ type: 'textarea', options: { rows: 3, placeholder: '3行高度' } }
{ type: 'textarea', options: { rows: 6, placeholder: '6行高度' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'textarea', options: { rows: 3, placeholder: '3行高度' } },
                    { type: 'textarea', options: { rows: 6, placeholder: '6行高度' } },
                ],
            },
        },
        {
            label: '最大长度（maxLength）',
            code: `{ type: 'textarea', options: { maxLength: 50, placeholder: '最多50字' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'textarea', options: { maxLength: 50, placeholder: '最多50字' } },
                ],
            },
        },
        {
            label: '自适应高度（autoSize）',
            code: `{ type: 'textarea', options: {
    autoSize: { minRows: 2, maxRows: 6 },
    placeholder: '自适应高度（2-6行）',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'textarea', options: { autoSize: { minRows: 2, maxRows: 6 }, placeholder: '自适应高度（2-6行）' } },
                ],
            },
        },
        {
            label: '只读（readonly）',
            code: `{ type: 'textarea', options: { readonly: true, value: '只读内容不可编辑' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'textarea', options: { readonly: true, value: '只读内容不可编辑' } },
                ],
            },
        },
    ],
};
