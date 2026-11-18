import { Component } from '@qimenjs/component-core';
import { DatePickerComponent } from '@/component/form/DatePickerComponent';

class DatePickerInteractiveDemo extends Component {
    constructor() {
        super(...arguments);
        this._picker = null;
    }
    get tpl() {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '12px' },
            children: [
                {
                    tag: 'div',
                    name: 'pickerContainer',
                    style: { display: 'flex', gap: '8px', alignItems: 'center' },
                },
                {
                    tag: 'div',
                    name: 'valueDisplay',
                    classes: 'q-demo__value-tag',
                    style: { fontSize: '16px', fontWeight: 'bold' },
                    options: { text: '当前值: 未选择' },
                },
            ],
        };
    }
    onAfterInit() {
        const container = this.getNodeEl('pickerContainer');
        if (!container) return;
        const picker = new DatePickerComponent({
            placeholder: '请选择日期时间',
            type: 'datetime',
            showSeconds: true,
        });
        picker.on('change', (ctx) => {
            const v = ctx.data?.value;
            if (v) {
                const dateStr = `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')} ${String(v.hour).padStart(2, '0')}:${String(v.minute).padStart(2, '0')}:${String(v.second ?? 0).padStart(2, '0')}`;
                this.setNodeText(`当前值: ${dateStr}`, 'valueDisplay');
            }
        });
        container.appendChild(picker.el);
        this._picker = picker;
    }
    onBeforeDispose() {
        try {
            this._picker?.dispose();
        } catch (e) {
            // ignore
        }
    }
}

export const DATEPICKER_DEMO = {
    title: 'DatePicker',
    description: '日期时间选择器，支持 type=date/datetime/time、手动输入、范围选择、minDate/maxDate 约束',
    sections: [
        {
            label: '交互式完整体验（datetime）',
            code: `import { DatePickerComponent } from '@/component/form/DatePickerComponent';

const picker = new DatePickerComponent({
    placeholder: '请选择日期时间',
    type: 'datetime',
    showSeconds: true,
});
picker.on('change', ({ value }) => {
    console.log('选中:', value);
});
container.appendChild(picker.el);`,
            component: DatePickerInteractiveDemo,
        },
        {
            label: '纯日期选择（type: "date"，默认）',
            code: `{ type: 'date-picker', options: { placeholder: '请选择日期' } }
{ type: 'date-picker', options: { label: '入职日期' } }
// type='date' 是默认模式，点击日期自动选中并关闭面板`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { placeholder: '请选择日期' } },
                    { type: 'date-picker', options: { label: '入职日期' } },
                ],
            },
        },
        {
            label: '日期时间选择（type: "datetime"）',
            code: `{ type: 'date-picker', options: {
    type: 'datetime',
    label: '预约时间',
} }
{ type: 'date-picker', options: {
    type: 'datetime',
    showSeconds: false,
    label: '精确到分钟',
} }
// type='datetime' 选完日期后还需选时间，点确认按钮关闭
// showSeconds: false 时面板和输入框都不显示秒`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { type: 'datetime', label: '预约时间' } },
                    { type: 'date-picker', options: { type: 'datetime', showSeconds: false, label: '精确到分钟' } },
                ],
            },
        },
        {
            label: '纯时间选择（type: "time"）',
            code: `{ type: 'date-picker', options: {
    type: 'time',
    label: '打卡时间',
} }
{ type: 'date-picker', options: {
    type: 'time',
    showSeconds: false,
    label: '精确到分钟',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { type: 'time', label: '打卡时间' } },
                    { type: 'date-picker', options: { type: 'time', showSeconds: false, label: '精确到分钟' } },
                ],
            },
        },
        {
            label: '默认值（value）',
            code: `{ type: 'date-picker', options: {
    type: 'date',
    value: new Date('2024-01-15'),
    label: '默认2024-01-15',
} }
{ type: 'date-picker', options: {
    type: 'datetime',
    value: new Date('2024-06-01T09:30:00'),
    label: '默认2024-06-01 09:30',
} }
// 无 value 时输入框为空，显示 placeholder`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { type: 'date', value: new Date('2024-01-15'), label: '默认2024-01-15' } },
                    { type: 'date-picker', options: { type: 'datetime', value: new Date('2024-06-01T09:30:00'), label: '默认2024-06-01 09:30' } },
                ],
            },
        },
        {
            label: '周起始日（startDayOfWeek）',
            code: `{ type: 'date-picker', options: {
    type: 'date',
    startDayOfWeek: 1,
    label: '周一起始',
} }
{ type: 'date-picker', options: {
    type: 'date',
    startDayOfWeek: 0,
    label: '周日起始（默认）',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { type: 'date', startDayOfWeek: 1, label: '周一起始' } },
                    { type: 'date-picker', options: { type: 'date', startDayOfWeek: 0, label: '周日起始（默认）' } },
                ],
            },
        },
        {
            label: '禁止选择范围（minDate/maxDate）',
            code: `{ type: 'date-picker', options: {
    type: 'date',
    minDate: { year: 2026, month: 11, day: 10 },
    maxDate: { year: 2026, month: 11, day: 20 },
    label: '只能选11月10-20日',
} }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { type: 'date', minDate: { year: 2026, month: 11, day: 10 }, maxDate: { year: 2026, month: 11, day: 20 }, label: '只能选11月10-20日' } },
                ],
            },
        },
        {
            label: '日期范围选择（range）',
            code: `{ type: 'date-picker', options: {
    type: 'date',
    range: true,
    label: '选择日期范围',
} }
// range 模式：第一次点击选起始日期，第二次选结束日期
// 选完两个日期后自动关闭面板
// 点击早于起始日期时重置为新的起始日期`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'date-picker', options: { type: 'date', range: true, label: '选择日期范围' } },
                ],
            },
        },
    ],
};
