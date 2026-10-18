import type { DemoConfig } from './types';

export const DATEPICKER_DEMO: DemoConfig = {
    title: 'DatePicker',
    description: '日期时间选择器组件，支持年/月/日/时/分/秒选择、showSeconds、startDayOfWeek',
    sections: [
        {
            label: '基础日期选择',
            code: `{ type: 'date-picker', options: { placeholder: '请选择日期' } }
{ type: 'date-picker', options: { label: '入职日期', placeholder: '选择日期' } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { placeholder: '请选择日期' } },
                    { type: 'date-picker', options: { label: '入职日期', placeholder: '选择日期' } },
                ],
            },
        },
        {
            label: '默认值（value）',
            code: `{ type: 'date-picker', options: {
    value: new Date('2024-01-15'),
    label: '默认2024-01-15',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { value: new Date('2024-01-15'), label: '默认2024-01-15' } },
                ],
            },
        },
        {
            label: '不显示秒（showSeconds: false）',
            code: `{ type: 'date-picker', options: {
    showSeconds: false,
    label: '精确到分钟',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { showSeconds: false, label: '精确到分钟' } },
                ],
            },
        },
        {
            label: '周起始日（startDayOfWeek）',
            code: `{ type: 'date-picker', options: {
    startDayOfWeek: 1,
    label: '周一起始',
} }
{ type: 'date-picker', options: {
    startDayOfWeek: 0,
    label: '周日起始（默认）',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { startDayOfWeek: 1, label: '周一起始' } },
                    { type: 'date-picker', options: { startDayOfWeek: 0, label: '周日起始（默认）' } },
                ],
            },
        },
    ],
};
