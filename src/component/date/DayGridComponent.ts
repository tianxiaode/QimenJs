/**
 * DayGridComponent 日期网格组件
 *
 * 7列×5-6行日历网格，含星期标题行。
 * 非当月日期灰色不可点击，今天有小圆点标识。
 * 日期格子通过 data-value 标记，dayGrid 容器用 tplEvents 委托 click。
 * emits 自动转发 daySelect 事件，数据通过 getEventData 提取。
 *
 * 纯展示组件，不含导航栏。由 DatePanelComponent 组合使用。
 *
 * 事件：daySelect
 */

import { Component } from '@qimenjs/component-core';
import { generateCalendarView, type CalendarDay } from '@/utils/date/calendar';
import './date-panel.css';

export interface DayGridProps {
    year: number;
    month: number;
    selectedDay?: number;
    startDayOfWeek?: number;
}

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

export const DayGridComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-dtpanel__day-container',
        children: [
            {
                tag: 'div',
                name: 'weekdayRow',
                cls: 'q-dtpanel__weekday-row',
            },
            {
                tag: 'div',
                name: 'dayGrid',
                cls: 'q-dtpanel__day-grid',
            },
        ],
    },
    tplEvents: {
        dayGrid: { click: { handler: true, emits: ['daySelect'] } },
    },
    body: {
        type: 'DayGrid',

        onInitState() {
            return {
                _year: 2026,
                _month: 1,
                _selectedDay: undefined as number | undefined,
                _startDayOfWeek: 0,
                _lastClickedDay: undefined as number | undefined,
            };
        },

        onAfterInit(props?: DayGridProps): void {
            const self = this as any;
            self._year = props?.year ?? 2026;
            self._month = props?.month ?? 1;
            self._selectedDay = props?.selectedDay;
            self._startDayOfWeek = props?.startDayOfWeek ?? 0;
            self._renderWeekdays();
            self._renderGrid();
        },

        onDayGridClick(e: Event): void {
            const self = this as any;
            const target = e.target as HTMLElement;
            const value = target.dataset.value;
            if (value === undefined) return;
            self._lastClickedDay = parseInt(value);
        },

        getEventData(
            _nodeName: string,
            _eventName: string,
            _eventType: string
        ): Record<string, any> {
            const self = this as any;
            return { day: self._lastClickedDay };
        },

        _renderWeekdays(): void {
            const self = this as any;
            const row = self.nodeMap?.weekdayRow?.el as HTMLElement | null;
            if (!row) return;
            row.innerHTML = '';

            for (let i = 0; i < 7; i++) {
                const idx = (self._startDayOfWeek + i) % 7;
                const cell = document.createElement('div');
                cell.className = 'q-dtpanel__weekday-cell';
                cell.textContent = WEEKDAY_LABELS[idx];
                row.appendChild(cell);
            }
        },

        _renderGrid(): void {
            const self = this as any;
            const grid = self.nodeMap?.dayGrid?.el as HTMLElement | null;
            if (!grid) return;
            grid.innerHTML = '';

            const days: CalendarDay[] = generateCalendarView(
                self._year,
                self._month,
                self._startDayOfWeek
            );

            for (const day of days) {
                const cell = document.createElement('div');
                cell.className = 'q-dtpanel__day-cell';
                cell.textContent = String(day.date.getDate());

                if (!day.isCurrentMonth) {
                    cell.classList.add('q-dtpanel__day-cell--other-month');
                } else {
                    cell.dataset.value = String(day.date.getDate());
                    if (
                        self._selectedDay !== undefined &&
                        day.date.getDate() === self._selectedDay
                    ) {
                        cell.classList.add('q-dtpanel__day-cell--active');
                    }
                }

                if (day.isToday) {
                    cell.classList.add('q-dtpanel__day-cell--today');
                }

                grid.appendChild(cell);
            }
        },

        update(props?: Partial<DayGridProps>): void {
            const self = this as any;
            if (props?.year !== undefined) self._year = props.year;
            if (props?.month !== undefined) self._month = props.month;
            if (props?.selectedDay !== undefined) self._selectedDay = props.selectedDay;
            if (props?.startDayOfWeek !== undefined) self._startDayOfWeek = props.startDayOfWeek;
            self._renderWeekdays();
            self._renderGrid();
        },
    },
});

export type DayGridComponent = InstanceType<typeof DayGridComponent>;
