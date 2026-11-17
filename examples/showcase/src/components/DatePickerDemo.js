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
        if (!container)
            return;
        const picker = new DatePickerComponent({
            placeholder: '请选择日期时间',
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
        }
        catch (e) {
            // ignore
        }
    }
}
export const DATEPICKER_DEMO = {
    title: 'DatePicker',
    description: '日期时间选择器组件，支持年/月/日/时/分/秒选择、showSeconds、startDayOfWeek',
    sections: [
        {
            label: '交互式完整体验',
            code: `import { DatePickerComponent } from '@/component/form/DatePickerComponent';

const picker = new DatePickerComponent({
    placeholder: '请选择日期时间',
    showSeconds: true,
});
picker.on('change', ({ value }) => {
    console.log('选中:', value);
});
container.appendChild(picker.el);`,
            component: DatePickerInteractiveDemo,
        },
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
