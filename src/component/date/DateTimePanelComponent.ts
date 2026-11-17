/**
 * DateTimePanelComponent 日期时间组合面板
 *
 * 从 DatePanelComponent 派生，复用日历网格和导航逻辑，扩展时间选择能力。
 * 统一导航栏 + body(内容切换) + bottom(今天/时间栏) 三段式布局。
 * 面板切换类似 tab 页面：dateView 和 subPanelContainer 在 body 中切换显示。
 * bottom 区域始终可见：type='date' 显示"今天"，type='datetime'/'time' 显示时间栏。
 * 子面板导航栏通过 CSS 隐藏，confirm/cancel 由 DateTimePanel 统一接管，viewLabel 可点击回退。
 *
 * type='date'：纯日期选择
 * type='datetime'：日期 + 时间栏（默认）
 * type='time'：纯时间选择（隐藏日期视图，默认进入小时面板）
 *
 * 事件：change / confirm / cancel
 */

import type { TemplateDecl, DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { DATETIME_PANEL_TPL } from './datetime-panel-tpl';
import { clampDay, type DateTimeValue } from '@/utils/date';
import { DatePanelComponent } from './DatePanelComponent';
import { YearPanelAbility } from './abilities/YearPanelAbility';
import { MonthPanelAbility } from './abilities/MonthPanelAbility';
import { HourPanelAbility } from './abilities/HourPanelAbility';
import { MinutePanelAbility } from './abilities/MinutePanelAbility';
import { SecondPanelAbility } from './abilities/SecondPanelAbility';
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
        showSeconds: true,
    },
} as const;

class DateTimePanelComponent extends DatePanelComponent {
    static type = 'datetime-panel';

    domEvents: DomEventsMap = {
        click: [
            { path: 'viewLabel', handler: 'onViewLabelClick' },
            { path: 'confirmBtn', handler: 'onConfirmBtnClick' },
            { path: 'cancelBtn', handler: 'onCancelBtnClick' },
            { path: 'subConfirmBtn', handler: 'onSubConfirmBtnClick' },
            { path: 'subCancelBtn', handler: 'onSubCancelBtnClick' },
            { path: 'prev1y', handler: 'onPrev1yClick' },
            { path: 'prev1m', handler: 'onPrev1mClick' },
            { path: 'next1m', handler: 'onNext1mClick' },
            { path: 'next1y', handler: 'onNext1yClick' },
            { path: 'todayBtn', handler: 'onTodayBtnClick' },
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
    _onYearPanelComplete: ((value: DateTimeValue) => void) | null = null;
    _onMonthPanelComplete: ((value: DateTimeValue) => void) | null = null;
    _onHourPanelComplete: ((value: DateTimeValue) => void) | null = null;
    _onMinutePanelComplete: ((value: DateTimeValue) => void) | null = null;
    _onSecondPanelComplete: ((value: DateTimeValue) => void) | null = null;

    onAfterInit(): void {
        super.onAfterInit();

        const type = this.getData('type') ?? 'datetime';

        this.removeCls('hidden', 'todayBtn');
        this.setNodeText('@common.today', 'todayBtn');

        this._updateDayGrid();

        if (type !== 'date') {
            this.removeCls('hidden', 'timeBar');
            this._initTimeArrows();
            this._updateTimeBar();

            const showSeconds = this.getData('showSeconds') ?? true;
            if (!showSeconds) {
                this.addCls('hidden', 'secondGroup');
                this.addCls('hidden', 'timeSep2');
            }
        }

        if (type === 'time') {
            this.addCls('hidden', 'dateView');
            this._switchToPanel('hour');
        }
    }

    _updateQuickBtns(): void {
        // DateTimePanel 只有 todayBtn，不需要 yesterday/tomorrow
    }

    onBeforeDispose(): void {
        this._disposeSubPanel();
        super.onBeforeDispose();
    }

    _disposeSubPanel(): void {
        this.disposeYearPanel?.();
        this.disposeMonthPanel?.();
        this.disposeHourPanel?.();
        this.disposeMinutePanel?.();
        this.disposeSecondPanel?.();
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
        const showSeconds = this.getData('showSeconds') ?? true;
        if (showSeconds) {
            this.setNodeText('▲', 'secondUp');
            this.setNodeText('▼', 'secondDown');
        }
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

    onViewLabelClick(): void {
        const type = this.getData('type') ?? 'datetime';
        if (type === 'time') {
            this.emit('cancel', {});
        } else {
            this._switchBackToDate();
        }
    }

    onTodayBtnClick(): void {
        const d = new Date();
        this._value = {
            ...this._value,
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate(),
        };
        this._viewYear = this._value.year;
        this._viewMonth = this._value.month;
        this._updateLabel();
        this._updateDayGrid();
        this.emit('change', { value: this._value });
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

        this.addCls('hidden', 'confirmBtn');
        this.addCls('hidden', 'cancelBtn');

        this.setNodeText('@common.confirm', 'subConfirmBtn');
        this.setNodeText('@common.cancel', 'subCancelBtn');

        this._disposeSubPanel();

        const content = this.getNodeEl('subPanelContent');
        if (!content) return;
        content.innerHTML = '';

        const value = this._value;

        switch (view) {
            case 'year':
                this.renderYearPanel(content, value);
                this._onYearPanelComplete = (v: DateTimeValue) => {
                    this._value = { ...this._value, year: v.year };
                    this._switchToPanel('month');
                };
                break;
            case 'month':
                this.renderMonthPanel(content, value);
                this._onMonthPanelComplete = (v: DateTimeValue) => {
                    this._value = { ...this._value, month: v.month };
                    this._switchBackToDate();
                };
                break;
            case 'hour':
                this.renderHourPanel(content, value);
                this._onHourPanelComplete = (v: DateTimeValue) => {
                    this._value = { ...this._value, hour: v.hour };
                    this._updateTimeBar();
                    this._switchToPanel('minute');
                };
                break;
            case 'minute':
                this.renderMinutePanel(content, value);
                this._onMinutePanelComplete = (v: DateTimeValue) => {
                    this._value = { ...this._value, minute: v.minute };
                    this._updateTimeBar();
                    const showSeconds = this.getData('showSeconds') ?? true;
                    if (showSeconds) {
                        this._switchToPanel('second');
                    } else {
                        this._switchBackToDate();
                    }
                };
                break;
            case 'second':
                this.renderSecondPanel(content, value);
                this._onSecondPanelComplete = (v: DateTimeValue) => {
                    this._value = { ...this._value, second: v.second };
                    this._updateTimeBar();
                    this._switchBackToDate();
                };
                break;
        }
    }

    _switchBackToDate(): void {
        this._currentView = 'date';

        const type = this.getData('type') ?? 'datetime';
        if (type !== 'time') {
            this.removeCls('hidden', 'dateView');
        }
        this.addCls('hidden', 'subPanelContainer');

        if (this.getData('showConfirm')) {
            this.removeCls('hidden', 'confirmBtn');
        }
        if (this.getData('showCancel')) {
            this.removeCls('hidden', 'cancelBtn');
        }

        this._disposeSubPanel();

        this._updateLabel();
        this._updateDayGrid();
    }

    _updateTimeBar(): void {
        this.setNodeText(String(this._value.hour).padStart(2, '0'), 'hourBtn');
        this.setNodeText(String(this._value.minute).padStart(2, '0'), 'minuteBtn');
        const showSeconds = this.getData('showSeconds') ?? true;
        if (showSeconds) {
            this.setNodeText(String(this._value.second ?? 0).padStart(2, '0'), 'secondBtn');
        }
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
        this._syncPanelValues();
        if (this._currentView !== 'date' && this._subPanel) {
            const subPanelValue = this._subPanel.panelValue;
            if (subPanelValue) {
                this._value = { ...this._value, ...subPanelValue };
                this._updateTimeBar();
            }
        }

        const type = this.getData('type') ?? 'datetime';
        const showSeconds = this.getData('showSeconds') ?? true;
        const isLastTimeView = this._currentView === 'second' || (!showSeconds && this._currentView === 'minute');
        if (this._currentView === 'date' || (type === 'time' && isLastTimeView)) {
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

    onSubConfirmBtnClick(): void {
        this._syncPanelValues();
        if (this._subPanel) {
            const subPanelValue = this._subPanel.panelValue;
            if (subPanelValue) {
                this._value = { ...this._value, ...subPanelValue };
                this._updateTimeBar();
            }
        }

        const type = this.getData('type') ?? 'datetime';
        if (type === 'time') {
            this.emit('confirm', { value: this._value });
        } else {
            this._switchBackToDate();
        }
    }

    onSubCancelBtnClick(): void {
        const type = this.getData('type') ?? 'datetime';
        if (type === 'time') {
            this.emit('cancel', {});
        } else {
            this._switchBackToDate();
        }
    }

    _getNextTimeView(): PanelView {
        const showSeconds = this.getData('showSeconds') ?? true;
        const order: PanelView[] = showSeconds ? ['hour', 'minute', 'second'] : ['hour', 'minute'];
        const idx = order.indexOf(this._currentView);
        if (idx >= 0 && idx < order.length - 1) {
            return order[idx + 1];
        }
        return 'date';
    }

    _syncPanelValues(): void {
        const yearValue = this.getYearPanelValue?.();
        if (yearValue) {
            this._value = { ...this._value, year: yearValue.year };
        }
        const monthValue = this.getMonthPanelValue?.();
        if (monthValue) {
            this._value = { ...this._value, month: monthValue.month };
        }
        const hourValue = this.getHourPanelValue?.();
        if (hourValue) {
            this._value = { ...this._value, hour: hourValue.hour };
        }
        const minuteValue = this.getMinutePanelValue?.();
        if (minuteValue) {
            this._value = { ...this._value, minute: minuteValue.minute };
        }
        const secondValue = this.getSecondPanelValue?.();
        if (secondValue) {
            this._value = { ...this._value, second: secondValue.second };
        }
        this._updateTimeBar();
    }
}

DateTimePanelComponent.use(YearPanelAbility);
DateTimePanelComponent.use(MonthPanelAbility);
DateTimePanelComponent.use(HourPanelAbility);
DateTimePanelComponent.use(MinutePanelAbility);
DateTimePanelComponent.use(SecondPanelAbility);
DateTimePanelComponent.define(DateTimePanelComponentDefs);

export { DateTimePanelComponent };
export type DateTimePanelComponentInstance = InstanceType<typeof DateTimePanelComponent>;
