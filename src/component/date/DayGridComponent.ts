/**
 * DayGridComponent 日期网格组件（池化版）
 *
 * 7列×6行日历网格，含星期标题行。
 * 初始化时创建 7 个 weekday cell + 42 个 day cell，
 * update 时只更新 textContent/classList/dataset，不销毁重建 DOM。
 *
 * 星期标签和 weekStart 从 i18nConfig() 获取，
 * locale 切换时通过 onLocaleChange 自动刷新。
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

const TOTAL_WEEKDAYS = 7;
const TOTAL_DAY_CELLS = 42;
const DEFAULT_WEEKDAYS_SHORT = ['日', '一', '二', '三', '四', '五', '六'];

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
                _weekdayCells: [] as HTMLElement[],
                _dayCells: [] as HTMLElement[],
            };
        },

        onAfterInit(props?: DayGridProps): void {
            const self = this as any;
            self._year = props?.year ?? 2026;
            self._month = props?.month ?? 1;
            self._selectedDay = props?.selectedDay;
            self._startDayOfWeek = props?.startDayOfWeek ?? self._getWeekStart();
            self._createCells();
            self._applyWeekdays();
            self._applyGrid();
        },

        onLocaleChange(): void {
            const self = this as any;
            const newStart = self._getWeekStart();
            if (newStart !== self._startDayOfWeek) {
                self._startDayOfWeek = newStart;
                self._applyWeekdays();
            }
            self._applyGrid();
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

        _getWeekStart(): number {
            const self = this as any;
            return self.i18nConfig()?.weekStart ?? 0;
        },

        _getWeekdaysShort(): string[] {
            const self = this as any;
            return self.i18nConfig()?.weekdaysShort ?? DEFAULT_WEEKDAYS_SHORT;
        },

        _createCells(): void {
            const self = this as any;
            const row = self.nodeMap?.weekdayRow?.el as HTMLElement | null;
            const grid = self.nodeMap?.dayGrid?.el as HTMLElement | null;
            if (!row || !grid) return;

            self._weekdayCells = [];
            for (let i = 0; i < TOTAL_WEEKDAYS; i++) {
                const cell = document.createElement('div');
                cell.className = 'q-dtpanel__weekday-cell';
                row.appendChild(cell);
                self._weekdayCells.push(cell);
            }

            self._dayCells = [];
            for (let i = 0; i < TOTAL_DAY_CELLS; i++) {
                const cell = document.createElement('div');
                cell.className = 'q-dtpanel__day-cell';
                grid.appendChild(cell);
                self._dayCells.push(cell);
            }
        },

        _applyWeekdays(): void {
            const self = this as any;
            const labels = self._getWeekdaysShort();
            for (let i = 0; i < TOTAL_WEEKDAYS; i++) {
                const idx = (self._startDayOfWeek + i) % 7;
                self._weekdayCells[i].textContent = labels[idx] ?? '';
            }
        },

        _applyGrid(): void {
            const self = this as any;
            const days: CalendarDay[] = generateCalendarView(
                self._year,
                self._month,
                self._startDayOfWeek
            );

            for (let i = 0; i < TOTAL_DAY_CELLS; i++) {
                const cell = self._dayCells[i];
                const day = days[i];
                if (!day) {
                    cell.textContent = '';
                    cell.className = 'q-dtpanel__day-cell';
                    delete cell.dataset.value;
                    continue;
                }

                cell.textContent = String(day.date.getDate());
                cell.className = 'q-dtpanel__day-cell';

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
            }
        },

        update(props?: Partial<DayGridProps>): void {
            const self = this as any;
            let needWeekdayRefresh = false;

            if (
                props?.startDayOfWeek !== undefined &&
                props.startDayOfWeek !== self._startDayOfWeek
            ) {
                self._startDayOfWeek = props.startDayOfWeek;
                needWeekdayRefresh = true;
            }
            if (props?.year !== undefined) self._year = props.year;
            if (props?.month !== undefined) self._month = props.month;
            if (props?.selectedDay !== undefined) self._selectedDay = props.selectedDay;

            if (needWeekdayRefresh) self._applyWeekdays();
            self._applyGrid();
        },
    },
});

export type DayGridComponent = InstanceType<typeof DayGridComponent>;
