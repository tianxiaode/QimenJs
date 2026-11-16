import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { YearPanelComponent } from '@/component/date/YearPanelComponent';
import { MonthPanelComponent } from '@/component/date/MonthPanelComponent';
import { DatePanelComponent } from '@/component/date/DatePanelComponent';
import { HourPanelComponent } from '@/component/date/HourPanelComponent';
import { MinutePanelComponent } from '@/component/date/MinutePanelComponent';
import { SecondPanelComponent } from '@/component/date/SecondPanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

function formatValue(v: DateTimeValue): string {
    return `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')} ${String(v.hour).padStart(2, '0')}:${String(v.minute).padStart(2, '0')}:${String(v.second).padStart(2, '0')}`;
}

class DatePanelDemoComponent extends Component {
    _panels: Record<string, any> = {};
    _value: DateTimeValue = createDateTimeValue();

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '24px' },
            children: [
                {
                    tag: 'div',
                    style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
                    children: [
                        {
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                            children: [
                                { tag: 'h4', options: { text: 'YearPanel 年份面板' } },
                                { tag: 'div', name: 'yearPanel', style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' } },
                                { tag: 'div', name: 'yearValue', classes: 'q-demo__value-tag', options: { text: `年份: ${this._value.year}` } },
                            ],
                        },
                        {
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                            children: [
                                { tag: 'h4', options: { text: 'MonthPanel 月份面板' } },
                                { tag: 'div', name: 'monthPanel', style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' } },
                                { tag: 'div', name: 'monthValue', classes: 'q-demo__value-tag', options: { text: `月份: ${String(this._value.month).padStart(2, '0')}` } },
                            ],
                        },
                    ],
                },
                {
                    tag: 'div',
                    style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                    children: [
                        { tag: 'h4', options: { text: 'DatePanel 日历面板' } },
                        { tag: 'div', name: 'datePanel', style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden', maxWidth: '400px' } },
                        { tag: 'div', name: 'dateValue', classes: 'q-demo__value-tag', options: { text: `日期: ${this._value.year}-${String(this._value.month).padStart(2, '0')}-${String(this._value.day).padStart(2, '0')}` } },
                    ],
                },
                {
                    tag: 'div',
                    style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' },
                    children: [
                        {
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                            children: [
                                { tag: 'h4', options: { text: 'HourPanel 小时面板' } },
                                { tag: 'div', name: 'hourPanel', style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' } },
                                { tag: 'div', name: 'hourValue', classes: 'q-demo__value-tag', options: { text: `小时: ${String(this._value.hour).padStart(2, '0')}` } },
                            ],
                        },
                        {
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                            children: [
                                { tag: 'h4', options: { text: 'MinutePanel 分钟面板' } },
                                { tag: 'div', name: 'minutePanel', style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' } },
                                { tag: 'div', name: 'minuteValue', classes: 'q-demo__value-tag', options: { text: `分钟: ${String(this._value.minute).padStart(2, '0')}` } },
                            ],
                        },
                        {
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                            children: [
                                { tag: 'h4', options: { text: 'SecondPanel 秒面板' } },
                                { tag: 'div', name: 'secondPanel', style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' } },
                                { tag: 'div', name: 'secondValue', classes: 'q-demo__value-tag', options: { text: `秒: ${String(this._value.second).padStart(2, '0')}` } },
                            ],
                        },
                    ],
                },
                {
                    tag: 'div',
                    name: 'fullValue',
                    classes: 'q-demo__value-tag',
                    style: { fontSize: '16px', fontWeight: 'bold' },
                    options: { text: `完整值: ${formatValue(this._value)}` },
                },
            ],
        };
    }

    onAfterInit(): void {
        this._mountYearPanel();
        this._mountMonthPanel();
        this._mountDatePanel();
        this._mountHourPanel();
        this._mountMinutePanel();
        this._mountSecondPanel();
    }

    onBeforeDispose(): void {
        Object.values(this._panels).forEach(p => {
            try {
                p?.dispose();
            } catch (e) {
                // ignore
            }
        });
        this._panels = {};
    }

    _mountYearPanel(): void {
        const container = this.getNodeEl('yearPanel');
        if (!container) return;
        const cmp = new YearPanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false,
        });
        cmp.on('yearSelect', (data: any) => {
            this._value = { ...this._value, year: data.value.year };
            this._updateValues();
        });
        cmp.on('confirm', (data: any) => {
            this._value = { ...this._value, ...data.value };
            this._updateValues();
        });
        container.appendChild(cmp.el);
        this._panels.year = cmp;
    }

    _mountMonthPanel(): void {
        const container = this.getNodeEl('monthPanel');
        if (!container) return;
        const cmp = new MonthPanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false,
        });
        cmp.on('monthSelect', (data: any) => {
            this._value = { ...this._value, month: data.value.month };
            this._updateValues();
        });
        cmp.on('confirm', (data: any) => {
            this._value = { ...this._value, ...data.value };
            this._updateValues();
        });
        container.appendChild(cmp.el);
        this._panels.month = cmp;
    }

    _mountDatePanel(): void {
        const container = this.getNodeEl('datePanel');
        if (!container) return;
        const cmp = new DatePanelComponent({ value: this._value });
        cmp.on('daySelect', (data: any) => {
            this._value = { ...this._value, year: data.value.year, month: data.value.month, day: data.value.day };
            this._updateValues();
        });
        cmp.on('confirm', (data: any) => {
            this._value = { ...this._value, ...data.value };
            this._updateValues();
        });
        container.appendChild(cmp.el);
        this._panels.date = cmp;
    }

    _mountHourPanel(): void {
        const container = this.getNodeEl('hourPanel');
        if (!container) return;
        const cmp = new HourPanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false,
        });
        cmp.on('hourSelect', (data: any) => {
            this._value = { ...this._value, hour: data.value.hour };
            this._updateValues();
        });
        cmp.on('confirm', (data: any) => {
            this._value = { ...this._value, ...data.value };
            this._updateValues();
        });
        container.appendChild(cmp.el);
        this._panels.hour = cmp;
    }

    _mountMinutePanel(): void {
        const container = this.getNodeEl('minutePanel');
        if (!container) return;
        const cmp = new MinutePanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false,
        });
        cmp.on('minuteSelect', (data: any) => {
            this._value = { ...this._value, minute: data.value.minute };
            this._updateValues();
        });
        cmp.on('confirm', (data: any) => {
            this._value = { ...this._value, ...data.value };
            this._updateValues();
        });
        container.appendChild(cmp.el);
        this._panels.minute = cmp;
    }

    _mountSecondPanel(): void {
        const container = this.getNodeEl('secondPanel');
        if (!container) return;
        const cmp = new SecondPanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false,
        });
        cmp.on('secondSelect', (data: any) => {
            this._value = { ...this._value, second: data.value.second };
            this._updateValues();
        });
        cmp.on('confirm', (data: any) => {
            this._value = { ...this._value, ...data.value };
            this._updateValues();
        });
        container.appendChild(cmp.el);
        this._panels.second = cmp;
    }

    _updateValues(): void {
        this.setNodeText(`年份: ${this._value.year}`, 'yearValue');
        this.setNodeText(`月份: ${String(this._value.month).padStart(2, '0')}`, 'monthValue');
        this.setNodeText(`日期: ${this._value.year}-${String(this._value.month).padStart(2, '0')}-${String(this._value.day).padStart(2, '0')}`, 'dateValue');
        this.setNodeText(`小时: ${String(this._value.hour).padStart(2, '0')}`, 'hourValue');
        this.setNodeText(`分钟: ${String(this._value.minute).padStart(2, '0')}`, 'minuteValue');
        this.setNodeText(`秒: ${String(this._value.second).padStart(2, '0')}`, 'secondValue');
        this.setNodeText(`完整值: ${formatValue(this._value)}`, 'fullValue');
    }
}

export const DATEPANEL_DEMO: DemoConfig = {
    title: 'DatePanel',
    description: '日期面板组件可脱离 DatePicker 独立使用，包括 YearPanel/MonthPanel/DatePanel/HourPanel/MinutePanel/SecondPanel',
    sections: [
        {
            label: '面板独立使用',
            code: `import { YearPanelComponent } from '@/component/date/YearPanelComponent';

const panel = new YearPanelComponent({
    value: createDateTimeValue(new Date()),
    showPrevField: false,
    showNextField: false,
});
panel.on('yearSelect', ({ value }) => {
    console.log('选中年份:', value.year);
});
container.appendChild(panel.el);`,
            component: DatePanelDemoComponent,
        },
        {
            label: '模板中使用（已注册组件）',
            code: `{ type: 'date-panel', options: { value: new Date() } }
{ type: 'year-panel', options: { showPrevField: false, showNextField: false } }
{ type: 'month-panel', options: { showPrevField: false, showNextField: false } }
{ type: 'hour-panel', options: { showPrevField: false, showNextField: false } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '16px' },
                children: [
                    {
                        tag: 'div',
                        style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden', maxWidth: '400px' },
                        children: [
                            { type: 'date-panel', options: {} },
                        ],
                    },
                ],
            },
        },
    ],
};
