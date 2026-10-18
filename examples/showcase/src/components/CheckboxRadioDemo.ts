import type { DemoConfig } from './types';

const HOBBY_ITEMS = [
    { label: '阅读', value: 'reading' },
    { label: '运动', value: 'sports' },
    { label: '音乐', value: 'music' },
    { label: '旅行', value: 'travel' },
];

const GENDER_ITEMS = [
    { label: '男', value: 'male' },
    { label: '女', value: 'female' },
];

export const CHECKBOX_DEMO: DemoConfig = {
    title: 'Checkbox',
    description: '复选框组组件，支持 items/direction(vertical/horizontal)/value/label/required',
    sections: [
        {
            label: '基础复选框组',
            code: `{ type: 'checkbox-group', options: {
    items: [{ label: '阅读', value: 'reading' }, ...],
    label: '兴趣爱好',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'checkbox-group', options: { items: HOBBY_ITEMS, label: '兴趣爱好' } },
                ],
            },
        },
        {
            label: '默认选中（value）',
            code: `{ type: 'checkbox-group', options: {
    items: [...],
    value: ['reading', 'music'],
    label: '已选阅读和音乐',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'checkbox-group', options: { items: HOBBY_ITEMS, value: ['reading', 'music'], label: '已选阅读和音乐' } },
                ],
            },
        },
        {
            label: '水平排列（direction: horizontal）',
            code: `{ type: 'checkbox-group', options: {
    items: [...],
    direction: 'horizontal',
    label: '水平排列',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'checkbox-group', options: { items: HOBBY_ITEMS, direction: 'horizontal', label: '水平排列' } },
                ],
            },
        },
        {
            label: '禁用选项',
            code: `{ type: 'checkbox-group', options: {
    items: [{ label: '可选项', value: 'a' }, { label: '禁用项', value: 'b', disabled: true }, ...],
    label: '含禁用项',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    {
                        type: 'checkbox-group',
                        options: {
                            items: [
                                { label: '可选项', value: 'a' },
                                { label: '禁用项', value: 'b', disabled: true },
                                { label: '可选项2', value: 'c' },
                            ],
                            label: '含禁用项',
                        },
                    },
                ],
            },
        },
    ],
};

export const RADIO_DEMO: DemoConfig = {
    title: 'Radio',
    description: '单选框组组件，支持 items/direction(vertical/horizontal)/value/label/required',
    sections: [
        {
            label: '基础单选框组',
            code: `{ type: 'radio-group', options: {
    items: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }],
    label: '性别',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'radio-group', options: { items: GENDER_ITEMS, label: '性别' } },
                ],
            },
        },
        {
            label: '默认选中（value）',
            code: `{ type: 'radio-group', options: {
    items: [...],
    value: 'male',
    label: '默认选中男',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'radio-group', options: { items: GENDER_ITEMS, value: 'male', label: '默认选中男' } },
                ],
            },
        },
        {
            label: '水平排列（direction: horizontal）',
            code: `{ type: 'radio-group', options: {
    items: [...],
    direction: 'horizontal',
    label: '水平排列',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'radio-group', options: { items: GENDER_ITEMS, direction: 'horizontal', label: '水平排列' } },
                ],
            },
        },
        {
            label: '必填标记（required）',
            code: `{ type: 'radio-group', options: {
    items: [...],
    required: true,
    label: '必选项',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'radio-group', options: { items: GENDER_ITEMS, required: true, label: '必选项' } },
                ],
            },
        },
    ],
};
