import type { DemoConfig } from './types';

const BASIC_OPTIONS = [
    { label: '技术部', value: 'tech' },
    { label: '市场部', value: 'market' },
    { label: '财务部', value: 'finance' },
    { label: '管理层', value: 'manage' },
];

const DISABLED_OPTIONS = [
    { label: '可选项', value: 'a' },
    { label: '禁用项', value: 'b', disabled: true },
    { label: '可选项2', value: 'c' },
];

const GROUP_OPTIONS = [
    { label: '北京', value: 'bj', group: '华北' },
    { label: '上海', value: 'sh', group: '华东' },
    { label: '广州', value: 'gz', group: '华南' },
    { label: '深圳', value: 'sz', group: '华南' },
];

const SEARCH_OPTIONS = [
    { label: 'JavaScript', value: 'js' },
    { label: 'TypeScript', value: 'ts' },
    { label: 'Python', value: 'py' },
    { label: 'Java', value: 'java' },
    { label: 'Go', value: 'go' },
    { label: 'Rust', value: 'rust' },
    { label: 'C++', value: 'cpp' },
    { label: 'Ruby', value: 'rb' },
    { label: 'Swift', value: 'swift' },
    { label: 'Kotlin', value: 'kotlin' },
];

export const SELECT_DEMO: DemoConfig = {
    title: 'Select',
    description: '下拉选择组件，支持单选/多选/分组/禁用/搜索',
    sections: [
        {
            label: '基础单选',
            code: `{ type: 'select', options: {
    options: [{ label: '技术部', value: 'tech' }, ...],
    placeholder: '请选择部门',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'select', options: { options: BASIC_OPTIONS, placeholder: '请选择部门' } },
                    { type: 'select', options: { options: BASIC_OPTIONS, value: 'tech', label: '默认选中' } },
                ],
            },
        },
        {
            label: '禁用选项',
            code: `{ type: 'select', options: {
    options: [{ label: '可选项', value: 'a' }, { label: '禁用项', value: 'b', disabled: true }, ...],
    placeholder: '禁用选项示例',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'select', options: { options: DISABLED_OPTIONS, placeholder: '禁用选项示例' } },
                ],
            },
        },
        {
            label: '分组选项',
            code: `{ type: 'select', options: {
    options: [{ label: '北京', value: 'bj', group: '华北' }, ...],
    placeholder: '分组选择',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'select', options: { options: GROUP_OPTIONS, placeholder: '分组选择' } },
                ],
            },
        },
        {
            label: '多选模式（multiple）',
            code: `{ type: 'select', options: {
    options: [{ label: '技术部', value: 'tech' }, ...],
    multiple: true,
    placeholder: '多选部门',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'select', options: { options: BASIC_OPTIONS, multiple: true, placeholder: '多选部门' } },
                ],
            },
        },
        {
            label: '搜索过滤（searchable）',
            code: `{ type: 'select', options: {
    options: [{ label: 'JavaScript', value: 'js' }, ...],
    searchable: true,
    placeholder: '搜索选择语言',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'select', options: { options: SEARCH_OPTIONS, searchable: true, placeholder: '搜索选择语言' } },
                ],
            },
        },
    ],
};
