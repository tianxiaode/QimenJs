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
import { addDays } from '@/utils/date/calculation/days';
import { addMonths } from '@/utils/date/calculation/months';
import { addYears } from '@/utils/date/calculation/years';
import { clampDay, type DateTimeValue } from '@/utils/date/datetime-picker';
import './date-panel.css';

export interface DatePanelProps {
    value: DateTimeValue;
}

export const DatePanelComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-dtpanel',
        children: [
            {
                tag: 'div',
                name: 'nav',
                cls: 'q-dtpanel__nav',
                children: [
                    { tag: 'button', name: 'backBtn', cls: 'q-dtpanel__nav-btn', i18n: 'back' },
                    {
                        tag: 'div',
                        name: 'dateNav',
                        cls: 'q-dtpanel__date-nav',
                        children: [
                            {
                                tag: 'button',
                                name: 'prev10y',
                                cls: 'q-dtpanel__nav-btn',
                                i18n: 'prev10y',
                            },
                            {
                                tag: 'button',
                                name: 'prev1y',
                                cls: 'q-dtpanel__nav-btn',
                                i18n: 'prev1y',
                            },
                            {
                                tag: 'button',
                                name: 'prev1m',
                                cls: 'q-dtpanel__nav-btn',
                                i18n: 'prev1m',
                            },
                            { tag: 'span', name: 'dateLabel', cls: 'q-dtpanel__date-nav-label' },
                            {
                                tag: 'button',
                                name: 'next1m',
                                cls: 'q-dtpanel__nav-btn',
                                i18n: 'next1m',
                            },
                            {
                                tag: 'button',
                                name: 'next1y',
                                cls: 'q-dtpanel__nav-btn',
                                i18n: 'next1y',
                            },
                            {
                                tag: 'button',
                                name: 'next10y',
                                cls: 'q-dtpanel__nav-btn',
                                i18n: 'next10y',
                            },
                        ],
                    },
                    {
                        tag: 'button',
                        name: 'confirmBtn',
                        cls: 'q-dtpanel__nav-btn q-dtpanel__nav-confirm',
                        i18n: 'confirm',
                    },
                ],
            },
            {
                name: 'dayGrid',
                type: 'DayGrid',
            },
            {
                tag: 'div',
                name: 'quickRow',
                cls: 'q-dtpanel__quick-row',
                children: [
                    {
                        tag: 'button',
                        name: 'yesterdayBtn',
                        cls: 'q-dtpanel__quick-btn',
                        i18n: 'yesterday',
                    },
                    { tag: 'button', name: 'todayBtn', cls: 'q-dtpanel__quick-btn', i18n: 'today' },
                    {
                        tag: 'button',
                        name: 'tomorrowBtn',
                        cls: 'q-dtpanel__quick-btn',
                        i18n: 'tomorrow',
                    },
                ],
            },
        ],
    },
    tplEvents: {
        backBtn: { click: { handler: true } },
        confirmBtn: { click: { handler: true, emits: ['confirm'] } },
        prev10y: { click: { handler: true } },
        prev1y: { click: { handler: true } },
        prev1m: { click: { handler: true } },
        next1m: { click: { handler: true } },
        next1y: { click: { handler: true } },
        next10y: { click: { handler: true } },
        yesterdayBtn: { click: { handler: true, emits: ['daySelect'] } },
        todayBtn: { click: { handler: true, emits: ['daySelect'] } },
        tomorrowBtn: { click: { handler: true, emits: ['daySelect'] } },
        dateLabel: { click: { handler: true } },
    },
    body: {
        type: 'DatePanel',

        onInitState() {
            return {
                _value: null as DateTimeValue | null,
                _viewYear: 2026,
                _viewMonth: 1,
            };
        },

        onAfterInit(props?: DatePanelProps): void {
            const self = this as any;
            self._value = props?.value ?? {
                year: 2026,
                month: 1,
                day: 1,
                hour: 0,
                minute: 0,
                second: 0,
            };
            self._viewYear = self._value.year;
            self._viewMonth = self._value.month;

            self._updateLabel();
            self._updateDayGrid();

            const dayGridCmp = self.nodeMap?.dayGrid?.component;
            if (dayGridCmp) {
                dayGridCmp.on('daySelect', (data: any) => self._onDaySelect(data.day));
            }
        },

        onBackBtnClick(): void {
            const self = this as any;
            self.emit('back', {});
        },

        onConfirmBtnClick(): void {},

        onPrev10yClick(): void {
            const self = this as any;
            self._navigate(-10, 0);
        },

        onPrev1yClick(): void {
            const self = this as any;
            self._navigate(-1, 0);
        },

        onPrev1mClick(): void {
            const self = this as any;
            self._navigate(0, -1);
        },

        onNext1mClick(): void {
            const self = this as any;
            self._navigate(0, 1);
        },

        onNext1yClick(): void {
            const self = this as any;
            self._navigate(1, 0);
        },

        onNext10yClick(): void {
            const self = this as any;
            self._navigate(10, 0);
        },

        onYesterdayBtnClick(): void {
            const self = this as any;
            const d = addDays(new Date(), -1);
            self._value = {
                ...self._value,
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
            };
            self._viewYear = self._value.year;
            self._viewMonth = self._value.month;
            self._updateLabel();
            self._updateDayGrid();
        },

        onTodayBtnClick(): void {
            const self = this as any;
            const d = new Date();
            self._value = {
                ...self._value,
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
            };
            self._viewYear = self._value.year;
            self._viewMonth = self._value.month;
            self._updateLabel();
            self._updateDayGrid();
        },

        onTomorrowBtnClick(): void {
            const self = this as any;
            const d = addDays(new Date(), 1);
            self._value = {
                ...self._value,
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
            };
            self._viewYear = self._value.year;
            self._viewMonth = self._value.month;
            self._updateLabel();
            self._updateDayGrid();
        },

        onDateLabelClick(): void {
            const self = this as any;
            self.emit('navigate', { year: self._viewYear, month: self._viewMonth });
        },

        _navigate(yearDelta: number, monthDelta: number): void {
            const self = this as any;
            const d = addMonths(
                addYears(new Date(self._viewYear, self._viewMonth - 1, 1), yearDelta),
                monthDelta
            );
            self._viewYear = d.getFullYear();
            self._viewMonth = d.getMonth() + 1;
            self._updateLabel();
            self._updateDayGrid();
        },

        _updateLabel(): void {
            const self = this as any;
            const label = self.nodeMap?.dateLabel?.el as HTMLElement | null;
            if (label) {
                label.textContent = `${self._viewYear}年 ${String(self._viewMonth).padStart(2, '0')}月`;
            }
        },

        _updateDayGrid(): void {
            const self = this as any;
            const dayGridCmp = self.nodeMap?.dayGrid?.component;
            if (dayGridCmp) {
                dayGridCmp.update({
                    year: self._viewYear,
                    month: self._viewMonth,
                    selectedDay:
                        self._value.year === self._viewYear && self._value.month === self._viewMonth
                            ? self._value.day
                            : undefined,
                });
            }
        },

        _onDaySelect(day: number): void {
            const self = this as any;
            const fixedDay = clampDay(self._viewYear, self._viewMonth, day);
            self._value = {
                ...self._value,
                year: self._viewYear,
                month: self._viewMonth,
                day: fixedDay,
            };
            self._updateDayGrid();
            self.emit('daySelect', { value: self._value });
        },

        getEventData(
            _nodeName: string,
            _eventName: string,
            _eventType: string
        ): Record<string, any> {
            const self = this as any;
            return { value: self._value };
        },

        get panelValue(): DateTimeValue {
            const self = this as any;
            return self._value;
        },
    },
});

export type DatePanelComponent = InstanceType<typeof DatePanelComponent>;
