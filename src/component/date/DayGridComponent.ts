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
import type { TemplateDecl, DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { SYSTEM_EVENTS } from '@/events';
import { DAY_GRID_TPL } from './day-grid-tpl';
import { generateCalendarView, type CalendarDay } from '@/utils/date';
import './date-panel.css';

const TOTAL_WEEKDAYS = 7;
const TOTAL_DAY_CELLS = 42;
const DEFAULT_WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const DayGridComponentDefs: Definitions = {
    options: {
        year: null,
        month: null,
        selectedDay: null,
        startDayOfWeek: null,
    },
} as const;

class DayGridComponent extends Component {
    static type = 'day-grid';

    domEvents: DomEventsMap = {
        click: [
            { path: 'dayGrid', handler: 'onDayGridClick' },
        ],
    };

    get tpl(): TemplateDecl {
        return DAY_GRID_TPL;
    }

    _year: number = 2026;
    _month: number = 1;
    _selectedDay: number | undefined = undefined;
    _startDayOfWeek: number = 0;
    _lastClickedDay: number | undefined = undefined;
    _weekdayCells: HTMLElement[] = [];
    _dayCells: HTMLElement[] = [];

    onAfterInit(): void {
        this._year = this.getData('year') ?? 2026;
        this._month = this.getData('month') ?? 1;
        this._selectedDay = this.getData('selectedDay') ?? undefined;
        this._startDayOfWeek = this.getData('startDayOfWeek') ?? this._getWeekStart();

        this.systemOn(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, () => this.onLocaleChange());
        this.systemOn(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, () => this.onLocaleChange());

        this._createCells();
        this._applyWeekdays();
        this._applyGrid();
    }

    onLocaleChange(): void {
        const newStart = this._getWeekStart();
        if (newStart !== this._startDayOfWeek) {
            this._startDayOfWeek = newStart;
            this._applyWeekdays();
        }
        this._applyGrid();
    }

    onDayGridClick(domEvt: any): void {
        const originalEvent = domEvt?.data?.originalEvent;
        const target = (originalEvent?.target ?? domEvt?.target) as HTMLElement;
        const value = target?.dataset?.value;
        if (value === undefined) return;
        this._lastClickedDay = parseInt(value);
        this.emit('daySelect', { day: this._lastClickedDay });
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { day: this._lastClickedDay };
    }

    _getWeekStart(): number {
        return this.i18nConfig()?.weekStart ?? 0;
    }

    _getWeekdays(): string[] {
        const config = this.i18nConfig();
        return config?.weekdaysShort ?? config?.weekdays ?? DEFAULT_WEEKDAYS;
    }

    _createCells(): void {
        const row = this.getNodeEl('weekdayRow');
        const grid = this.getNodeEl('dayGrid');
        if (!row || !grid) return;

        row.innerHTML = '';
        grid.innerHTML = '';
        this._weekdayCells = [];
        this._dayCells = [];

        for (let i = 0; i < TOTAL_WEEKDAYS; i++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__weekday-cell';
            row.appendChild(cell);
            this._weekdayCells.push(cell);
        }

        this._dayCells = [];
        for (let i = 0; i < TOTAL_DAY_CELLS; i++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__day-cell';
            grid.appendChild(cell);
            this._dayCells.push(cell);
        }
    }

    _applyWeekdays(): void {
        const labels = this._getWeekdays();
        for (let i = 0; i < TOTAL_WEEKDAYS; i++) {
            const idx = (this._startDayOfWeek + i) % 7;
            this._weekdayCells[i].textContent = labels[idx] ?? '';
        }
    }

    _applyGrid(): void {
        const days: CalendarDay[] = generateCalendarView(
            this._year,
            this._month,
            this._startDayOfWeek
        );

        for (let i = 0; i < TOTAL_DAY_CELLS; i++) {
            const cell = this._dayCells[i];
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
                if (this._selectedDay !== undefined && day.date.getDate() === this._selectedDay) {
                    cell.classList.add('q-dtpanel__day-cell--active');
                }
            }

            if (day.isToday) {
                cell.classList.add('q-dtpanel__day-cell--today');
            }
        }
    }

    update(props?: Record<string, any>): void {
        if (this._dayCells.length === 0) {
            this._startDayOfWeek = props?.startDayOfWeek ?? this._startDayOfWeek;
            this._createCells();
            this._applyWeekdays();
        }

        let needWeekdayRefresh = false;

        if (props?.startDayOfWeek !== undefined && props.startDayOfWeek !== this._startDayOfWeek) {
            this._startDayOfWeek = props.startDayOfWeek;
            needWeekdayRefresh = true;
        }
        if (props?.year !== undefined) this._year = props.year;
        if (props?.month !== undefined) this._month = props.month;
        if (props?.selectedDay !== undefined) this._selectedDay = props.selectedDay;

        if (needWeekdayRefresh) this._applyWeekdays();
        this._applyGrid();
    }
}

DayGridComponent.define(DayGridComponentDefs);

export { DayGridComponent };
/** 日网格实例类型 */
export type DayGridComponentInstance = InstanceType<typeof DayGridComponent>;
