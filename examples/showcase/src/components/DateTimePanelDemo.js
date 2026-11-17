import { Component } from '@qimenjs/component-core';
import { DatePanelComponent } from '@/component/date/DatePanelComponent';
import { YearPanelComponent } from '@/component/date/YearPanelComponent';
import { MonthPanelComponent } from '@/component/date/MonthPanelComponent';
import { HourPanelComponent } from '@/component/date/HourPanelComponent';
import { MinutePanelComponent } from '@/component/date/MinutePanelComponent';
import { SecondPanelComponent } from '@/component/date/SecondPanelComponent';
import { createDateTimeValue } from '@/utils/date';
class DateTimePanelDemoComponent extends Component {
    constructor() {
        super(...arguments);
        this._panel = null;
        this._value = createDateTimeValue();
        this._currentPanel = 'date';
        this.domEvents = {
            click: [
                { path: 'hourBtn', handler: 'onHourBtnClick' },
                { path: 'minuteBtn', handler: 'onMinuteBtnClick' },
                { path: 'secondBtn', handler: 'onSecondBtnClick' },
                { path: 'hourUp', handler: 'onHourUpClick' },
                { path: 'hourDown', handler: 'onHourDownClick' },
                { path: 'minuteUp', handler: 'onMinuteUpClick' },
                { path: 'minuteDown', handler: 'onMinuteDownClick' },
                { path: 'secondUp', handler: 'onSecondUpClick' },
                { path: 'secondDown', handler: 'onSecondDownClick' },
            ],
        };
    }
    get tpl() {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' },
            children: [
                {
                    tag: 'div',
                    name: 'outerBox',
                    cls: 'q-demo__datetime-box',
                    style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden', width: '280px' },
                    children: [
                        { tag: 'div', name: 'panelContainer' },
                        {
                            tag: 'div',
                            name: 'timeBar',
                            cls: 'q-demo__time-bar',
                            children: [
                                {
                                    tag: 'div',
                                    cls: 'q-demo__time-group',
                                    children: [
                                        { tag: 'button', name: 'hourBtn', cls: 'q-demo__time-btn' },
                                        {
                                            tag: 'div',
                                            cls: 'q-demo__time-arrows',
                                            children: [
                                                { tag: 'button', name: 'hourUp', cls: 'q-demo__time-arrow' },
                                                { tag: 'button', name: 'hourDown', cls: 'q-demo__time-arrow' },
                                            ],
                                        },
                                    ],
                                },
                                { tag: 'span', cls: 'q-demo__time-sep', options: { text: ':' } },
                                {
                                    tag: 'div',
                                    cls: 'q-demo__time-group',
                                    children: [
                                        { tag: 'button', name: 'minuteBtn', cls: 'q-demo__time-btn' },
                                        {
                                            tag: 'div',
                                            cls: 'q-demo__time-arrows',
                                            children: [
                                                { tag: 'button', name: 'minuteUp', cls: 'q-demo__time-arrow' },
                                                { tag: 'button', name: 'minuteDown', cls: 'q-demo__time-arrow' },
                                            ],
                                        },
                                    ],
                                },
                                { tag: 'span', cls: 'q-demo__time-sep', options: { text: ':' } },
                                {
                                    tag: 'div',
                                    cls: 'q-demo__time-group',
                                    children: [
                                        { tag: 'button', name: 'secondBtn', cls: 'q-demo__time-btn' },
                                        {
                                            tag: 'div',
                                            cls: 'q-demo__time-arrows',
                                            children: [
                                                { tag: 'button', name: 'secondUp', cls: 'q-demo__time-arrow' },
                                                { tag: 'button', name: 'secondDown', cls: 'q-demo__time-arrow' },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }
    onAfterInit() {
        this.setNodeText('▲', 'hourUp');
        this.setNodeText('▼', 'hourDown');
        this.setNodeText('▲', 'minuteUp');
        this.setNodeText('▼', 'minuteDown');
        this.setNodeText('▲', 'secondUp');
        this.setNodeText('▼', 'secondDown');
        this._renderPanel('date');
        this._updateTimeBar();
    }
    onBeforeDispose() {
        try {
            this._panel?.dispose();
        }
        catch (e) { /* ignore */ }
    }
    onHourBtnClick() { this._renderPanel('hour'); }
    onMinuteBtnClick() { this._renderPanel('minute'); }
    onSecondBtnClick() { this._renderPanel('second'); }
    onHourUpClick() {
        this._value = { ...this._value, hour: (this._value.hour + 1) % 24 };
        this._updateTimeBar();
    }
    onHourDownClick() {
        this._value = { ...this._value, hour: (this._value.hour + 23) % 24 };
        this._updateTimeBar();
    }
    onMinuteUpClick() {
        this._value = { ...this._value, minute: (this._value.minute + 1) % 60 };
        this._updateTimeBar();
    }
    onMinuteDownClick() {
        this._value = { ...this._value, minute: (this._value.minute + 59) % 60 };
        this._updateTimeBar();
    }
    onSecondUpClick() {
        this._value = { ...this._value, second: ((this._value.second ?? 0) + 1) % 60 };
        this._updateTimeBar();
    }
    onSecondDownClick() {
        this._value = { ...this._value, second: ((this._value.second ?? 0) + 59) % 60 };
        this._updateTimeBar();
    }
    _updateTimeBar() {
        this.setNodeText(String(this._value.hour).padStart(2, '0'), 'hourBtn');
        this.setNodeText(String(this._value.minute).padStart(2, '0'), 'minuteBtn');
        this.setNodeText(String(this._value.second ?? 0).padStart(2, '0'), 'secondBtn');
    }
    _renderPanel(type) {
        const container = this.getNodeEl('panelContainer');
        if (!container)
            return;
        if (this._panel) {
            try {
                this._panel.dispose();
            }
            catch (e) { /* ignore */ }
            this._panel = null;
        }
        container.innerHTML = '';
        this._currentPanel = type;
        const wrapper = document.createElement('div');
        wrapper.className = 'q-demo__panel-fade';
        container.appendChild(wrapper);
        if (type === 'date') {
            const cmp = new DatePanelComponent({ value: this._value, showPrevField: false, showConfirm: false, showCancel: false });
            cmp.on('daySelect', (ctx) => {
                this._value = { ...this._value, year: ctx.data.value.year, month: ctx.data.value.month, day: ctx.data.value.day };
            });
            cmp.on('navigate', (ctx) => {
                const target = ctx.data?.target;
                if (target === 'year')
                    this._renderPanel('year');
                else if (target === 'month')
                    this._renderPanel('month');
            });
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        }
        else if (type === 'year') {
            const cmp = new YearPanelComponent({ value: this._value, showPrevField: false, showNextField: true, showConfirm: true, showCancel: true });
            cmp.on('yearSelect', (ctx) => {
                this._value = { ...this._value, year: ctx.data.value.year };
                this._renderPanel('month');
            });
            cmp.on('nextField', () => this._renderPanel('month'));
            cmp.on('confirm', (ctx) => {
                if (ctx.data?.value) {
                    this._value = { ...this._value, ...ctx.data.value };
                }
                this._renderPanel('date');
            });
            cmp.on('cancel', () => this._renderPanel('date'));
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        }
        else if (type === 'month') {
            const cmp = new MonthPanelComponent({ value: this._value, showPrevField: true, showNextField: false, showConfirm: true, showCancel: true });
            cmp.on('monthSelect', (ctx) => {
                this._value = { ...this._value, month: ctx.data.value.month };
                this._renderPanel('date');
            });
            cmp.on('prevField', () => this._renderPanel('year'));
            cmp.on('confirm', (ctx) => {
                if (ctx.data?.value) {
                    this._value = { ...this._value, ...ctx.data.value };
                }
                this._renderPanel('date');
            });
            cmp.on('cancel', () => this._renderPanel('date'));
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        }
        else if (type === 'hour') {
            const cmp = new HourPanelComponent({ value: this._value, showPrevField: false, showNextField: true, showConfirm: true, showCancel: true });
            cmp.on('hourSelect', (ctx) => {
                this._value = { ...this._value, hour: ctx.data.value.hour };
                this._updateTimeBar();
            });
            cmp.on('nextField', () => this._renderPanel('minute'));
            cmp.on('confirm', (ctx) => {
                if (ctx.data?.value) {
                    this._value = { ...this._value, ...ctx.data.value };
                    this._updateTimeBar();
                }
                this._renderPanel('date');
            });
            cmp.on('cancel', () => this._renderPanel('date'));
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        }
        else if (type === 'minute') {
            const cmp = new MinutePanelComponent({ value: this._value, showPrevField: true, showNextField: true, showConfirm: true, showCancel: true });
            cmp.on('minuteSelect', (ctx) => {
                this._value = { ...this._value, minute: ctx.data.value.minute };
                this._updateTimeBar();
            });
            cmp.on('prevField', () => this._renderPanel('hour'));
            cmp.on('nextField', () => this._renderPanel('second'));
            cmp.on('confirm', (ctx) => {
                if (ctx.data?.value) {
                    this._value = { ...this._value, ...ctx.data.value };
                    this._updateTimeBar();
                }
                this._renderPanel('date');
            });
            cmp.on('cancel', () => this._renderPanel('date'));
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        }
        else if (type === 'second') {
            const cmp = new SecondPanelComponent({ value: this._value, showPrevField: true, showNextField: false, showConfirm: true, showCancel: true });
            cmp.on('secondSelect', (ctx) => {
                this._value = { ...this._value, second: ctx.data.value.second };
                this._updateTimeBar();
            });
            cmp.on('prevField', () => this._renderPanel('minute'));
            cmp.on('confirm', (ctx) => {
                if (ctx.data?.value) {
                    this._value = { ...this._value, ...ctx.data.value };
                    this._updateTimeBar();
                }
                this._renderPanel('date');
            });
            cmp.on('cancel', () => this._renderPanel('date'));
            wrapper.appendChild(cmp.el);
            this._panel = cmp;
        }
        requestAnimationFrame(() => {
            wrapper.classList.add('q-demo__panel-fade--in');
        });
    }
}
export const DATETIMEPANEL_DEMO = {
    title: 'DateTimePanel',
    description: '日期时间组合面板 — 以日期面板为主，底部时间栏（HH:mm:ss 带上下箭头）可点击切换面板或直接微调',
    sections: [
        {
            label: '组合面板',
            code: `// 日期面板为主，底部时间栏在面板 border 内
// 时间数字可点击切换到对应选择面板
// 上下箭头可直接微调时/分/秒值
// 时间面板之间通过导航按钮串联`,
            component: DateTimePanelDemoComponent,
        },
    ],
};
