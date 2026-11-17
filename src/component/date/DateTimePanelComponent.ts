/**
 * DateTimePanelComponent 日期时间组合面板
 *
 * 从 DatePanelComponent 派生，复用日历网格和导航逻辑，扩展时间选择能力。
 * 统一导航栏 + body(内容切换) + bottom(今天/时间栏) 三段式布局。
 *
 * 交互模式：
 * - 顶部栏显示 "年 月 日"，各部分可点击切换到对应选择面板
 * - 底部时间栏显示 "时:分:秒"，各部分可点击切换到对应选择面板
 * - 选中面板内容立即更新值，不退出面板（用户主动切换）
 * - 点击"日"标签回到日期视图；点击日期格子触发 change 事件
 * - 确认按钮(✓)始终可见，点击触发 confirm 事件
 *
 * type='date'：纯日期选择
 * type='datetime'：日期 + 时间栏（默认）
 * type='time'：纯时间选择（隐藏日期视图，默认进入小时面板）
 *
 * 事件：change / confirm
 */

import type { TemplateDecl, DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { DATETIME_PANEL_TPL } from './datetime-panel-tpl';
import { clampDay, type DateTimeValue } from '@/utils/date';
import { DatePanelComponent } from './DatePanelComponent';
import { DayGridAbility } from './abilities/DayGridAbility';
import { YearPanelAbility } from './abilities/YearPanelAbility';
import { MonthPanelAbility } from './abilities/MonthPanelAbility';
import { HourPanelAbility } from './abilities/HourPanelAbility';
import { MinutePanelAbility } from './abilities/MinutePanelAbility';
import { SecondPanelAbility } from './abilities/SecondPanelAbility';
import type { PanelView } from './abilities/types';
import './datetime-panel.css';

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
            { path: 'yearLabel', handler: 'onYearLabelClick' },
            { path: 'monthLabel', handler: 'onMonthLabelClick' },
            { path: 'dayLabel', handler: 'onDayLabelClick' },
            { path: 'confirmBtn', handler: 'onConfirmBtnClick' },
            { path: 'todayBtn', handler: 'onTodayBtnClick' },
            { path: 'hourBtn', handler: 'onHourBtnClick' },
            { path: 'minuteBtn', handler: 'onMinuteBtnClick' },
            { path: 'secondBtn', handler: 'onSecondBtnClick' },
        ],
    };

    get tpl(): TemplateDecl {
        return DATETIME_PANEL_TPL;
    }

    _currentView: PanelView = 'date';
    _onYearPanelComplete: ((value: DateTimeValue) => void) | null = null;
    _onMonthPanelComplete: ((value: DateTimeValue) => void) | null = null;
    _onHourPanelComplete: ((value: DateTimeValue) => void) | null = null;
    _onMinutePanelComplete: ((value: DateTimeValue) => void) | null = null;
    _onSecondPanelComplete: ((value: DateTimeValue) => void) | null = null;

    onAfterInit(): void {
        this.initDayGrid();
        super.onAfterInit();

        const type = this.getData('type') ?? 'datetime';

        this.removeCls('hidden', 'todayBtn');
        this.setNodeText('@common.today', 'todayBtn');

        this.setNodeText('✓', 'confirmBtn');

        if (type !== 'date') {
            this.removeCls('hidden', 'timeBar');
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
    }

    _updateDayGrid(): void {
        this.updateDayGrid(
            this._viewYear,
            this._viewMonth,
            this._value.year === this._viewYear && this._value.month === this._viewMonth
                ? this._value.day
                : undefined
        );
    }

    _updateLabel(): void {
        super._updateLabel();
        this.setNodeText(`${String(this._value.day).padStart(2, '0')}日`, 'dayLabel');
    }

    onBeforeDispose(): void {
        this._disposeSubPanel();
        this.disposeDayGrid();
        super.onBeforeDispose();
    }

    _disposeSubPanel(): void {
        this.disposeYearPanel?.();
        this.disposeMonthPanel?.();
        this.disposeHourPanel?.();
        this.disposeMinutePanel?.();
        this.disposeSecondPanel?.();
    }

    onYearLabelClick(): void {
        this._switchToPanel('year');
    }

    onMonthLabelClick(): void {
        this._switchToPanel('month');
    }

    onDayLabelClick(): void {
        if (this._currentView !== 'date') {
            this._switchBackToDate();
        }
    }

    onHourBtnClick(): void { this._switchToPanel('hour'); }
    onMinuteBtnClick(): void { this._switchToPanel('minute'); }
    onSecondBtnClick(): void { this._switchToPanel('second'); }

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

    _switchToPanel(view: PanelView): void {
        this._currentView = view;

        this.addCls('hidden', 'dateView');
        this.addCls('hidden', 'yearPanel');
        this.addCls('hidden', 'monthPanel');
        this.addCls('hidden', 'hourPanel');
        this.addCls('hidden', 'minutePanel');
        this.addCls('hidden', 'secondPanel');

        this.removeCls('hidden', `${view}Panel`);

        this._disposeSubPanel();

        const value = this._value;

        switch (view) {
            case 'year':
                this.renderYearPanel(value);
                this._onYearPanelComplete = (v: DateTimeValue) => {
                    this._value = { ...this._value, year: v.year };
                    this._updateLabel();
                };
                break;
            case 'month':
                this.renderMonthPanel(value);
                this._onMonthPanelComplete = (v: DateTimeValue) => {
                    this._value = { ...this._value, month: v.month };
                    this._updateLabel();
                };
                break;
            case 'hour':
                this.renderHourPanel(value);
                this._onHourPanelComplete = (v: DateTimeValue) => {
                    this._value = { ...this._value, hour: v.hour };
                    this._updateTimeBar();
                };
                break;
            case 'minute':
                this.renderMinutePanel(value);
                this._onMinutePanelComplete = (v: DateTimeValue) => {
                    this._value = { ...this._value, minute: v.minute };
                    this._updateTimeBar();
                };
                break;
            case 'second':
                this.renderSecondPanel(value);
                this._onSecondPanelComplete = (v: DateTimeValue) => {
                    this._value = { ...this._value, second: v.second };
                    this._updateTimeBar();
                };
                break;
        }
    }

    _switchBackToDate(): void {
        this._currentView = 'date';

        this.addCls('hidden', 'yearPanel');
        this.addCls('hidden', 'monthPanel');
        this.addCls('hidden', 'hourPanel');
        this.addCls('hidden', 'minutePanel');
        this.addCls('hidden', 'secondPanel');

        const type = this.getData('type') ?? 'datetime';
        if (type !== 'time') {
            this.removeCls('hidden', 'dateView');
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
        this.emit('confirm', { value: this._value });
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

DateTimePanelComponent.use(DayGridAbility);
DateTimePanelComponent.use(YearPanelAbility);
DateTimePanelComponent.use(MonthPanelAbility);
DateTimePanelComponent.use(HourPanelAbility);
DateTimePanelComponent.use(MinutePanelAbility);
DateTimePanelComponent.use(SecondPanelAbility);
DateTimePanelComponent.define(DateTimePanelComponentDefs);

export { DateTimePanelComponent };
export type DateTimePanelComponentInstance = InstanceType<typeof DateTimePanelComponent>;
