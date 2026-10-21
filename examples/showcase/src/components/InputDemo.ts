import type { TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';

export const INPUT_DEMO: DemoConfig = {
    title: 'Input',
    description: '文本输入框组件，支持 placeholder、readonly、clearable、maxLength、type（text/password/email/number 等）',
    sections: [
        {
            label: '基础文本输入',
            code: `{ type: 'input', options: { placeholder: '请输入文本' } }
{ type: 'input', options: { value: '预填值', label: '姓名' } }
{ type: 'input', options: { placeholder: '只读', readonly: true, value: '不可编辑' } }
{ type: 'input', options: { placeholder: '可清空', clearable: true } }
{ type: 'input', options: { placeholder: '最大长度5', maxLength: 5 } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'input', options: { placeholder: '请输入文本' } },
                    { type: 'input', options: { value: '预填值', label: '姓名' } },
                    { type: 'input', options: { placeholder: '只读', readonly: true, value: '不可编辑' } },
                    { type: 'input', options: { placeholder: '可清空', clearable: true } },
                    { type: 'input', options: { placeholder: '最大长度5', maxLength: 5 } },
                ],
            },
        },
        {
            label: '标签位置（labelPosition: top/left/right）',
            code: `{ type: 'input', options: { label: '顶部标签', labelPosition: 'top', placeholder: 'top' } }
{ type: 'input', options: { label: '左侧', labelPosition: 'left', placeholder: 'left' } }
{ type: 'input', options: { label: '右侧', labelPosition: 'right', placeholder: 'right' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'input', options: { label: '顶部标签', labelPosition: 'top', placeholder: 'top' } },
                    { type: 'input', options: { label: '左侧', labelPosition: 'left', placeholder: 'left' } },
                    { type: 'input', options: { label: '右侧', labelPosition: 'right', placeholder: 'right' } },
                ],
            },
        },
        {
            label: '必填标记（required + requiredMark）',
            code: `{ type: 'input', options: { label: '必填', required: true, placeholder: '必填字段' } }
{ type: 'input', options: { label: '必填', required: true, requiredMark: '*', placeholder: '自定义标记' } }
{ type: 'input', options: { label: '必填', required: true, requiredMarkPosition: 'before', placeholder: '标记在前' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'input', options: { label: '必填', required: true, placeholder: '必填字段' } },
                    { type: 'input', options: { label: '必填', required: true, requiredMark: '*', placeholder: '自定义标记' } },
                    { type: 'input', options: { label: '必填', required: true, requiredMarkPosition: 'before', placeholder: '标记在前' } },
                ],
            },
        },
        {
            label: '数字输入（NumberInput）',
            code: `{ type: 'number-input', options: { placeholder: '数字', min: 0, max: 100, step: 1 } }
{ type: 'number-input', options: { value: 50, min: 0, max: 100, step: 10, label: '步进10' } }
{ type: 'number-input', options: { value: 3.14, precision: 2, step: 0.01, label: '精度2位' } }
{ type: 'number-input', options: { value: 10, controls: false, label: '无步进按钮' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'number-input', options: { placeholder: '数字', min: 0, max: 100, step: 1 } },
                    { type: 'number-input', options: { value: 50, min: 0, max: 100, step: 10, label: '步进10' } },
                    { type: 'number-input', options: { value: 3.14, precision: 2, step: 0.01, label: '精度2位' } },
                    { type: 'number-input', options: { value: 10, controls: false, label: '无步进按钮' } },
                ],
            },
        },
        {
            label: '前缀/后缀（prefix/suffix）',
            code: `{ type: 'input', options: { prefix: { type: 'icon', iconCls: 'q-search' }, placeholder: '搜索...' } }
{ type: 'input', options: { suffix: { type: 'icon', iconCls: 'q-info' }, placeholder: '带后缀图标' } }
{ type: 'input', options: { prefix: { type: 'label', text: '¥' }, placeholder: '金额' } }
{ type: 'input', options: { prefix: { type: 'icon', iconCls: 'q-user' }, suffix: { type: 'icon', iconCls: 'q-close' }, placeholder: '前后缀' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'input', options: { prefix: { type: 'icon', iconCls: 'q-search' }, placeholder: '搜索...' } },
                    { type: 'input', options: { suffix: { type: 'icon', iconCls: 'q-info' }, placeholder: '带后缀图标' } },
                    { type: 'input', options: { prefix: { type: 'label', text: '¥' }, placeholder: '金额' } },
                    { type: 'input', options: { prefix: { type: 'icon', iconCls: 'q-user' }, suffix: { type: 'icon', iconCls: 'q-close' }, placeholder: '前后缀' } },
                ],
            },
        },
        {
            label: '密码输入（PasswordInput）',
            code: `{ type: 'password-input', options: { value: 'secret', label: '密码' } }
{ type: 'password-input', options: { placeholder: '密码强度检测', label: '密码' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'password-input', options: { value: 'secret', label: '密码' } },
                    { type: 'password-input', options: { placeholder: '密码强度检测', label: '密码' } },
                ],
            },
        },
    ],
};
