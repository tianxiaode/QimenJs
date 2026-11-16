import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { DatePanelComponent } from '@/component/date/DatePanelComponent';
import { YearPanelComponent } from '@/component/date/YearPanelComponent';
import { MonthPanelComponent } from '@/component/date/MonthPanelComponent';
import { HourPanelComponent } from '@/component/date/HourPanelComponent';
import { MinutePanelComponent } from '@/component/date/MinutePanelComponent';
import { SecondPanelComponent } from '@/component/date/SecondPanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

type PanelType = 'date' | 'year' | 'month' | 'hour' | 'minute' | 'second';

class DateTimePanelDemoComponent extends Component {
    _panel: any = null;
    _value: DateTimeValue = createDateTimeValue();
    _currentPanel: PanelType = 'date';

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
            children: [
                {
                    tag: 'div',
                    name: 'valueDisplay',
                    style: {
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        padding: '4px',
                        color: 'var(--q-color-primary, #3b82f6)',
                    },
                    options: { text: '----' },
                },
                {
                    tag: 'div',
                    name: 'tabRow',
                    style: { display: 'flex', gap: '4px', justifyContent: 'center' },
                    children: [
                        { tag: 'button', name: 'tabDate', cls: 'q-demo__tab-btn q-demo__tab-btn--active', options: { text: '日期' } },
                        { tag: 'button', name: 'tabHour', cls: 'q-demo__tab-btn', options: { text: '时' } },
                        { tag: 'button', name: 'tabMinute', cls: 'q-demo__tab-btn', options: { text: '分' } },
                        { tag: 'button', name: 'tabSecond', cls: 'q-demo__tab-btn', options: { text: '秒' } },
                    ],
                },
                {
                    tag: 'div',
                    name: 'panelContainer',
                    style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden', width: '280px', alignSelf: 'center' },
                },
            ],
        };
    }

    domEvents: DomEventsMap = {
        click: [
            { path: 'tabDate', handler: 'onTabDateClick' },
            { path: 'tabHour', handler: 'onTabHourClick' },
            { path: 'tabMinute', handler: 'onTabMinuteClick' },
            { path: 'tabSecond', handler: 'onTabSecondClick' },
        ],
    };

    onAfterInit(): void {
        this._renderPanel('date');
        this._updateValue();
    }

    onBeforeDispose(): void {
        try { this._panel?.dispose(); } catch (e) { /* ignore */ }
    }

    _switchTab(tab: PanelType): void {
        const tabs: Record<string, string> = { date: 'tabDate', hour: 'tabHour', minute: 'tabMinute', second: 'tabSecond' };
        for (const [key, nodeName] of Object.entries(tabs)) {
            if (key === tab) {
                this.addCls('q-demo__tab-btn--active', nodeName);
            } else {
                this.removeCls('q-demo__tab-btn--active', nodeName);
            }
        }
        this._renderPanel(tab);
    }

    onTabDateClick(): void { this._switchTab('date'); }
    onTabHourClick(): void { this._switchTab('hour'); }
    onTabMinuteClick(): void { this._switchTab('minute'); }
    onTabSecondClick(): void { this._switchTab('second'); }

    _renderPanel(type: PanelType): void {
        const container = this.getNodeEl('panelContainer');
        if (!container) return;

        if (this._panel) {
            try { this._panel.dispose(); } catch (e) { /* ignore */ }
            this._panel = null;
        }
        container.innerHTML = '';
        this._currentPanel = type;

        const wrapper = document.createElement('div');
        wrapper.className = 'q-demo__panel-fade';
        container.appendChild(wrapper);

        if (type === 'date') {
            const cmp = new DatePanelComponent({ value: this._value, showPrevField: false, showConfirm: false, showCancel: false });
            cmp.on('daySelect', (ctx: any) => {
                this._value = { ...this._value, year: ctx.data.value.year, month: ctx.data.value.month, day: ctx.data.value.day };
                this._updateValue();
            });
            cmp.on('navigate', (ctx: any) => {
                const target = ctx.data?.target;
                if (target === 'year') this._renderPanel('year');
                else if (target === 'month') this._renderPanel('month');
            });
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        } else if (type === 'year') {
            const cmp = new YearPanelComponent({ value: this._value, showPrevField: false, showNextField: true, showConfirm: true, showCancel: true });
            cmp.on('yearSelect', (ctx: any) => {
                this._value = { ...this._value, year: ctx.data.value.year };
                this._updateValue();
                this._renderPanel('month');
            });
            cmp.on('nextField', () => this._renderPanel('month'));
            cmp.on('confirm', (ctx: any) => {
                if (ctx.data?.value) { this._value = { ...this._value, ...ctx.data.value }; this._updateValue(); }
                this._renderPanel('date');
            });
            cmp.on('cancel', () => this._renderPanel('date'));
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        } else if (type === 'month') {
            const cmp = new MonthPanelComponent({ value: this._value, showPrevField: true, showNextField: false, showConfirm: true, showCancel: true });
            cmp.on('monthSelect', (ctx: any) => {
                this._value = { ...this._value, month: ctx.data.value.month };
                this._updateValue();
                this._renderPanel('date');
            });
            cmp.on('prevField', () => this._renderPanel('year'));
            cmp.on('confirm', (ctx: any) => {
                if (ctx.data?.value) { this._value = { ...this._value, ...ctx.data.value }; this._updateValue(); }
                this._renderPanel('date');
            });
            cmp.on('cancel', () => this._renderPanel('date'));
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        } else if (type === 'hour') {
            const cmp = new HourPanelComponent({ value: this._value, showPrevField: false, showNextField: false, showConfirm: false, showCancel: false });
            cmp.on('hourSelect', (ctx: any) => {
                this._value = { ...this._value, hour: ctx.data.value.hour };
                this._updateValue();
            });
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        } else if (type === 'minute') {
            const cmp = new MinutePanelComponent({ value: this._value, showPrevField: false, showNextField: false, showConfirm: false, showCancel: false });
            cmp.on('minuteSelect', (ctx: any) => {
                this._value = { ...this._value, minute: ctx.data.value.minute };
                this._updateValue();
            });
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        } else if (type === 'second') {
            const cmp = new SecondPanelComponent({ value: this._value, showPrevField: false, showNextField: false, showConfirm: false, showCancel: false });
            cmp.on('secondSelect', (ctx: any) => {
                this._value = { ...this._value, second: ctx.data.value.second };
                this._updateValue();
            });
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        }

        requestAnimationFrame(() => {
            wrapper.classList.add('q-demo__panel-fade--in');
        });
    }

    _updateValue(): void {
        const v = this._value;
        const dateStr = `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}`;
        const timeStr = `${String(v.hour).padStart(2, '0')}:${String(v.minute).padStart(2, '0')}:${String(v.second ?? 0).padStart(2, '0')}`;
        this.setNodeText(`${dateStr} ${timeStr}`, 'valueDisplay');
    }
}

export const DATETIMEPANEL_DEMO: DemoConfig = {
    title: 'DateTimePanel',
    description: '日期时间组合面板，在一个界面中切换日期/时/分/秒面板，测试日期和时间的组合选择',
    sections: [
        {
            label: '组合面板',
            code: `// 日期时间组合面板
// 顶部显示完整日期时间值
// 底部标签切换：日期 | 时 | 分 | 秒
// 日期面板中点击年份/月份标签可切换到对应选择面板`,
            component: DateTimePanelDemoComponent,
        },
    ],
};
