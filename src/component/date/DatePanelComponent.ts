/**
 * DatePanelComponent 日期主视图面板
 *
 * 包含日历网格 + 导航栏（6个翻页按钮）+ 底部快捷按钮。
 * 组合 DayGridComponent 作为子组件。
 * confirmBtn 用 emits 自动转发 confirm 事件，快捷按钮用 emits 自动转发 daySelect 事件。
 * 数据通过 getEventData 提取。
 * daySelect 来自 DayGrid 子组件，在 _onDaySelect 中手动 emit。
 * navigate 来自 dateLabel 点击，数据形状不同，手动 emit。
 *
 * 导航栏：← 返回 | ◀◀ ◀ ◀ | 年月标签 | ▶ ▶ ▶▶ | 确认 ✓
 * 底部：[昨天] [今天] [明天]
 *
 * 事件：daySelect / back / confirm / navigate
 */

import { Component } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';
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

class DatePanelComponent extends Component {
    get tpl(): TplNode {
        return DATE_PANEL_TPL;
    }

    _value: DateTimeValue = createDateTimeValue();
    _viewYear: number = 2026;
    _viewMonth: number = 1;

    onAfterInit(): void {
        this._value = this.options.value ?? createDateTimeValue();
        this._viewYear = this._value.year;
        this._viewMonth = this._value.month;

        this._updateLabel();
        this._updateDayGrid();

        const dayGridCmp = this.getNode('dayGrid');
        if (dayGridCmp) {
            dayGridCmp.on('daySelect', (data: any) => this._onDaySelect(data.day));
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

    onPrev10yClick(): void {
        this._navigate(-10, 0);
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

    onNext10yClick(): void {
        this._navigate(10, 0);
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

    onDateLabelClick(): void {
        this.emit('navigate', { year: this._viewYear, month: this._viewMonth });
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
        const locale = this.i18nConfig();
        const months = locale?.months;
        const text =
            months && months.length === 12
                ? `${this._viewYear} ${months[this._viewMonth - 1]}`
                : `${this._viewYear}年 ${String(this._viewMonth).padStart(2, '0')}月`;
        this.setNodeProp('text', text, 'dateLabel');
    }

    _updateDayGrid(): void {
        const dayGridCmp = this.getNode('dayGrid');
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

export { DatePanelComponent };
/** 日期面板实例类型 */
export type DatePanelComponentInstance = InstanceType<typeof DatePanelComponent>;
