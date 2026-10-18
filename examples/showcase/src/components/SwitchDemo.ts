import type { DemoConfig } from './types';

export const SWITCH_DEMO: DemoConfig = {
    title: 'Switch',
    description: '开关组件，支持 checked/activeText/inactiveText/label/required',
    sections: [
        {
            label: '基础开关',
            code: `{ type: 'switch', options: { checked: false } }
{ type: 'switch', options: { checked: true } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', gap: '24px', alignItems: 'center' },
                children: [
                    { type: 'switch', options: { checked: false } },
                    { type: 'switch', options: { checked: true } },
                ],
            },
        },
        {
            label: '带文字开关（activeText/inactiveText）',
            code: `{ type: 'switch', options: { activeText: '开启', inactiveText: '关闭' } }
{ type: 'switch', options: { activeText: 'ON', inactiveText: 'OFF', checked: true } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', gap: '24px', alignItems: 'center' },
                children: [
                    { type: 'switch', options: { activeText: '开启', inactiveText: '关闭' } },
                    { type: 'switch', options: { activeText: 'ON', inactiveText: 'OFF', checked: true } },
                ],
            },
        },
        {
            label: '带标签（label + required）',
            code: `{ type: 'switch', options: { label: '启用通知', checked: true } }
{ type: 'switch', options: { label: '必选项', required: true } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'switch', options: { label: '启用通知', checked: true } },
                    { type: 'switch', options: { label: '必选项', required: true } },
                ],
            },
        },
    ],
};
