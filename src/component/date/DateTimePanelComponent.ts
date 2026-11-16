/**
 * DateTimePanelComponent 日期时间组合面板
 *
 * 从 DatePanelComponent 派生，复用日历网格和导航逻辑，扩展时间选择能力。
 * 统一导航栏：date 视图显示 yearGroup+monthGroup，子面板视图显示 viewLabel+backBtn。
 * 子面板导航栏通过 CSS 隐藏，confirm/cancel 由 DateTimePanel 统一接管。
 * 内聚管理面板切换（year/month/hour/minute/second），外部组件无需参与。
 *
 * type='date'：纯日期选择（同 DatePanel）
 * type='datetime'：日期 + 时间栏（HH:mm:ss 带上下箭头）
 * type='time'：纯时间选择（隐藏日期视图，默认进入小时面板）
 *
 * 事件：change / confirm / cancel
 */

import type { TemplateDecl, DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { DATETIME_PANEL_TPL } from './datetime-panel-tpl';
import { YearPanelComponent } from './YearPanelComponent';
import { MonthPanelComponent } from './MonthPanelComponent';
import { HourPanelComponent } from './HourPanelComponent';
import { MinutePanelComponent } from './MinutePanelComponent';
import { SecondPanelComponent } from './SecondPanelComponent';
import { clampDay, type DateTimeValue } from '@/utils/date';
import { DatePanelComponent } from './DatePanelComponent';
import './datetime-panel.css';

type PanelView = 'date' | 'year' | 'month' | 'hour' | 'minute' | 'second';

const VIEW_LABELS: Record<string, string> = {
    year: '年份选择',
    month: '月份选择',
    hour: '小时选择',
    minute: '分钟选择',
    second: '秒选择',
};

const DateTimePanelComponentDefs: Definitions = {
    options: {
        value: null,
        showPrevField: true,
        showConfirm: true,
        showCancel: true,
        type: 'datetime',
    },
} as const;

class DateTimePanelComponent extends DatePanelComponent {
    static type = 'datetime-panel';

    domEvents: DomEventsMap = {
        click: [
            { path: 'backBtn', handler: 'onBackBtnClick' },
            { path: 'confirmBtn', handler: 'onConfirmBtnClick' },
            { path: 'cancelBtn', handler: 'onCancelBtnClick' },
            { path: 'prev1y', handler: 'onPrev1yClick' },
            { path: 'prev1m', handler: 'onPrev1mClick' },
            { path: 'next1m', handler: 'onNext1mClick' },
            { path: 'next1y', handler: 'onNext1yClick' },
            { path: 'yesterdayBtn', handler: 'onYesterdayBtnClick' },
            { path: 'todayBtn', handler: 'onTodayBtnClick' },
            { path: 'tomorrowBtn', handler: 'onTomorrowBtnClick' },
            { path: 'yearLabel', handler: 'onYearLabelClick' },
            { path: 'monthLabel', handler: 'onMonthLabelClick' },
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

    get tpl(): TemplateDecl {
        return DATETIME_PANEL_TPL;
    }

    _currentView: PanelView = 'date';
    _subPanel: any = null;

    onAfterInit(): void {
        super.onAfterInit();

        const type = this.getData('type') ?? 'datetime';

        if (type === 'datetime' || type === 'time') {
            this.removeCls('hidden', 'timeBar');
            this._initTimeArrows();
            this._updateTimeBar();
        }

        if (type === 'time') {
            this.addCls('hidden', 'dateView');
            this._switchToPanel('hour');
        }
    }

    onBeforeDispose(): void {
        this._disposeSubPanel();
        super.onBeforeDispose();
    }

    _disposeSubPanel(): void {
        if (this._subPanel) {
            try { this._subPanel.dispose(); } catch (e) { /* ignore */ }
            this._subPanel = null;
        }
    }

    _initTimeArrows(): void {
        this.setNodeText('▲', 'hourUp');
        this.setNodeText('▼', 'hourDown');
        this.setNodeText('▲', 'minuteUp');
        this.setNodeText('▼', 'minuteDown');
        this.setNodeText('▲', 'secondUp');
        this.setNodeText('▼', 'secondDown');
    }

    onYearLabelClick(): void {
        this._switchToPanel('year');
    }

    onMonthLabelClick(): void {
        this._switchToPanel('month');
    }

    onHourBtnClick(): void { this._switchToPanel('hour'); }
    onMinuteBtnClick(): void { this._switchToPanel('minute'); }
    onSecondBtnClick(): void { this._switchToPanel('second'); }

    onBackBtnClick(): void {
        const type = this.getData('type') ?? 'datetime';
        if (type === 'time') {
            this.emit('cancel', {});
        } else {
            this._switchBackToDate();
        }
    }

    onHourUpClick(): void {
        this._value = { ...this._value, hour: (this._value.hour + 1) % 24 };
        this._updateTimeBar();
        this.emit('change', { value: this._value });
    }

    onHourDownClick(): void {
        this._value = { ...this._value, hour: (this._value.hour + 23) % 24 };
        this._updateTimeBar();
        this.emit('change', { value: this._value });
    }

    onMinuteUpClick(): void {
        this._value = { ...this._value, minute: (this._value.minute + 1) % 60 };
        this._updateTimeBar();
        this.emit('change', { value: this._value });
    }

    onMinuteDownClick(): void {
        this._value = { ...this._value, minute: (this._value.minute + 59) % 60 };
        this._updateTimeBar();
        this.emit('change', { value: this._value });
    }

    onSecondUpClick(): void {
        this._value = { ...this._value, second: ((this._value.second ?? 0) + 1) % 60 };
        this._updateTimeBar();
        this.emit('change', { value: this._value });
    }

    onSecondDownClick(): void {
        this._value = { ...this._value, second: ((this._value.second ?? 0) + 59) % 60 };
        this._updateTimeBar();
        this.emit('change', { value: this._value });
    }

    _switchToPanel(view: PanelView): void {
        this._currentView = view;

        const type = this.getData('type') ?? 'datetime';
        if (type !== 'time') {
            this.addCls('hidden', 'dateView');
        }
        this.removeCls('hidden', 'subPanelContainer');

        this.addCls('hidden', 'dateNav');
        this.removeCls('hidden', 'viewLabel');
        this.removeCls('hidden', 'backBtn');
        this.setNodeText(VIEW_LABELS[view] ?? '', 'viewLabel');

        this._disposeSubPanel();

        const container = this.getNodeEl('subPanelContainer');
        if (!container) return;
        container.innerHTML = '';

        const value = this._value;
        let panelCmp: any = null;

        switch (view) {
            case 'year':
                panelCmp = new YearPanelComponent({ value, showPrevField: false, showNextField: false, showConfirm: false, showCancel: false });
                panelCmp.on('yearSelect', (ctx: any) => {
                    this._value = { ...this._value, year: ctx.data.value.year };
                    this._switchToPanel('month');
                });
                break;
            case 'month':
                panelCmp = new MonthPanelComponent({ value, showPrevField: false, showNextField: false, showConfirm: false, showCancel: false });
                panelCmp.on('monthSelect', (ctx: any) => {
                    this._value = { ...this._value, month: ctx.data.value.month };
                    this._switchBackToDate();
                });
                break;
            case 'hour':
                panelCmp = new HourPanelComponent({ value, showPrevField: false, showNextField: false, showConfirm: false, showCancel: false });
                panelCmp.on('hourSelect', (ctx: any) => {
                    this._value = { ...this._value, hour: ctx.data.value.hour };
                    this._updateTimeBar();
                    this._switchToPanel('minute');
                });
                break;
            case 'minute':
                panelCmp = new MinutePanelComponent({ value, showPrevField: false, showNextField: false, showConfirm: false, showCancel: false });
                panelCmp.on('minuteSelect', (ctx: any) => {
                    this._value = { ...this._value, minute: ctx.data.value.minute };
                    this._updateTimeBar();
                    this._switchToPanel('second');
                });
                break;
            case 'second':
                panelCmp = new SecondPanelComponent({ value, showPrevField: false, showNextField: false, showConfirm: false, showCancel: false });
                panelCmp.on('secondSelect', (ctx: any) => {
                    this._value = { ...this._value, second: ctx.data.value.second };
                    this._updateTimeBar();
                    this._switchBackToDate();
                });
                break;
        }

        if (panelCmp) {
            container.appendChild(panelCmp.el);
            this._subPanel = panelCmp;
        }
    }

    _switchBackToDate(): void {
        this._currentView = 'date';

        const type = this.getData('type') ?? 'datetime';
        if (type !== 'time') {
            this.removeCls('hidden', 'dateView');
        }
        this.addCls('hidden', 'subPanelContainer');

        this.removeCls('hidden', 'dateNav');
        this.addCls('hidden', 'viewLabel');
        this.addCls('hidden', 'backBtn');

        this._disposeSubPanel();

        this._updateLabel();
        this._updateDayGrid();
    }

    _updateTimeBar(): void {
        this.setNodeText(String(this._value.hour).padStart(2, '0'), 'hourBtn');
        this.setNodeText(String(this._value.minute).padStart(2, '0'), 'minuteBtn');
        this.setNodeText(String(this._value.second ?? 0).padStart(2, '0'), 'secondBtn');
    }

    _onDaySelect(day: number): void {
        const fixedDay = clampDay(this._viewYear, this._viewMonth, day);
        this._value = {
            ...this._value,
            year: this._viewYear,
            month: this._viewMonth,
            day: fixedDay,
        };
        this._updateDayGrid();
        this.emit('change', { value: this._value });
    }

    onConfirmBtnClick(): void {
        if (this._currentView !== 'date' && this._subPanel) {
            const subPanelValue = this._subPanel.panelValue;
            if (subPanelValue) {
                this._value = { ...this._value, ...subPanelValue };
                this._updateTimeBar();
            }
        }

        const type = this.getData('type') ?? 'datetime';
        if (this._currentView === 'date' || (type === 'time' && this._currentView === 'second')) {
            this.emit('confirm', { value: this._value });
        } else if (type === 'time') {
            this._switchToPanel(this._getNextTimeView());
        } else {
            this._switchBackToDate();
        }
    }

    onCancelBtnClick(): void {
        if (this._currentView === 'date') {
            this.emit('cancel', {});
        } else {
            const type = this.getData('type') ?? 'datetime';
            if (type === 'time') {
                this.emit('cancel', {});
            } else {
                this._switchBackToDate();
            }
        }
    }

    _getNextTimeView(): PanelView {
        const order: PanelView[] = ['hour', 'minute', 'second'];
        const idx = order.indexOf(this._currentView);
        if (idx >= 0 && idx < order.length - 1) {
            return order[idx + 1];
        }
        return 'date';
    }
}

DateTimePanelComponent.define(DateTimePanelComponentDefs);

export { DateTimePanelComponent };
export type DateTimePanelComponentInstance = InstanceType<typeof DateTimePanelComponent>;
