/**
 * @deprecated 请使用 DateTimePanelComponent（type='date' 等价于 DatePanel）。
 * DatePanelComponent 保留向后兼容，后续版本可能移除。
 *
 * DatePanelComponent 日期主视图面板
 *
 * 包含日历网格 + 导航栏（6个翻页按钮）+ 底部快捷按钮。
 * 组合 DayGridComponent 作为子组件。
 * confirmBtn 用 emits 自动转发 confirm 事件，快捷按钮用 emits 自动转发 daySelect 事件。
 * 数据通过 getEventData 提取。
 * daySelect 来自 DayGrid 子组件，在 _onDaySelect 中手动 emit。
 * navigate 来自 yearLabel/monthLabel 点击，带 target 字段区分目标面板。
 *
 * 导航栏：← 返回 | ◀◀ | 2026年 ▲▼ | 11月 ▲▼ | ▶▶ | 确认 ✓
 * 底部：[昨天] [今天] [明天]
 *
 * 事件：daySelect / back / confirm / navigate
 */

import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { SYSTEM_EVENTS } from '@/events';
import { DATE_PANEL_TPL } from './date-panel-tpl';
import {
    addDays,
    addMonths,
    addYears,
    clampDay,
    createDateTimeValue,
    type DateTimeValue,
} from '@/utils/date';
import './date-panel.css';

const DatePanelComponentDefs: Definitions = {
    options: {
        value: null,
        showPrevField: true,
        showConfirm: true,
        showCancel: true,
    },
} as const;

class DatePanelComponent extends Component {
    static type = 'date-panel';

    domEvents: DomEventsMap = {
        click: [
            { path: 'prevFieldBtn', handler: 'onPrevFieldBtnClick' },
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
        ],
    };

    get tpl(): TemplateDecl {
        return DATE_PANEL_TPL;
    }

    _value: DateTimeValue = createDateTimeValue();
    _viewYear: number = 2026;
    _viewMonth: number = 1;

    onAfterInit(): void {
        this._value = this.getData('value') ?? createDateTimeValue();
        this._viewYear = this._value.year;
        this._viewMonth = this._value.month;

        if (this.getData('showPrevField')) {
            this.removeCls('hidden', 'prevFieldBtn');
        }
        if (this.getData('showConfirm')) {
            this.removeCls('hidden', 'confirmBtn');
        }
        if (this.getData('showCancel')) {
            this.removeCls('hidden', 'cancelBtn');
        }

        this.systemOn(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, () => this.onLocaleChange());
        this.systemOn(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, () => this.onLocaleChange());

        this._updateLabel();
        this._updateDayGrid();
        this._updateQuickBtns();

        const dayGridCmp = this.getComponent('dayGrid');
        if (dayGridCmp) {
            dayGridCmp.on('daySelect', (ctx: any) => this._onDaySelect(ctx.data.day));
        }
    }

    onLocaleChange(): void {
        this._updateLabel();
    }

    onPrevFieldBtnClick(): void {
        this.emit('prevField', {});
    }

    onConfirmBtnClick(): void {
        this.emit('confirm', { value: this._value });
    }

    onCancelBtnClick(): void {
        this.emit('cancel', {});
    }

    onPrev1yClick(): void {
        this._navigate(-1, 0);
    }

    onPrev1mClick(): void {
        this._navigate(0, -1);
    }

    onNext1mClick(): void {
        this._navigate(0, 1);
    }

    onNext1yClick(): void {
        this._navigate(1, 0);
    }

    onYesterdayBtnClick(): void {
        const d = addDays(new Date(), -1);
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
    }

    onTomorrowBtnClick(): void {
        const d = addDays(new Date(), 1);
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
    }

    onYearLabelClick(): void {
        this.emit('navigate', { target: 'year', year: this._viewYear, month: this._viewMonth });
    }

    onMonthLabelClick(): void {
        this.emit('navigate', { target: 'month', year: this._viewYear, month: this._viewMonth });
    }

    _navigate(yearDelta: number, monthDelta: number): void {
        const d = addMonths(
            addYears(new Date(this._viewYear, this._viewMonth - 1, 1), yearDelta),
            monthDelta
        );
        this._viewYear = d.getFullYear();
        this._viewMonth = d.getMonth() + 1;
        this._updateLabel();
        this._updateDayGrid();
    }

    _updateLabel(): void {
        const yearText = `${this._viewYear}`;
        const monthText = String(this._viewMonth).padStart(2, '0');
        this.setNodeText(yearText, 'yearLabel');
        this.setNodeText(monthText, 'monthLabel');
    }

    _updateQuickBtns(): void {
        this.setNodeText('@common.yesterday', 'yesterdayBtn');
        this.setNodeText('@common.today', 'todayBtn');
        this.setNodeText('@common.tomorrow', 'tomorrowBtn');
        this.addCls('q-dtpanel__quick-btn--today', 'todayBtn');
    }

    _updateDayGrid(): void {
        const dayGridCmp = this.getComponent('dayGrid');
        if (dayGridCmp) {
            dayGridCmp.update({
                year: this._viewYear,
                month: this._viewMonth,
                selectedDay:
                    this._value.year === this._viewYear && this._value.month === this._viewMonth
                        ? this._value.day
                        : undefined,
            });
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
        this.emit('daySelect', { value: this._value });
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    get panelValue(): DateTimeValue {
        return this._value;
    }
}

DatePanelComponent.define(DatePanelComponentDefs);

export { DatePanelComponent };
/** 日期面板实例类型 */
export type DatePanelComponentInstance = InstanceType<typeof DatePanelComponent>;
