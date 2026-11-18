import type { AbilityDefinition } from '@/composable';
import { DomEventsEngine } from '@/component-core/engine';
import { generateCalendarView, type CalendarDay, type DateTimeValue } from '@/utils/date';
import type { DayGridState } from './types';
import '../date-panel.css';

const TOTAL_WEEKDAYS = 7;
const TOTAL_DAY_CELLS = 42;
const DEFAULT_WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const STATE_KEY = 'DayGridAbility:state';

export const DayGridAbility: AbilityDefinition = {
    initDayGrid(): void {
        const state: DayGridState = {
            year: 2026,
            month: 1,
            selectedDay: undefined,
            startDayOfWeek: this.i18nConfig?.()?.weekStart ?? 0,
            minDate: null,
            maxDate: null,
            rangeStart: null,
            rangeEnd: null,
            weekdayCells: [],
            dayCells: [],
            rules: [],
        };
        this.setAbilityState(STATE_KEY, state);

        this._createDayCells();
        this._applyWeekdays();
        this._applyDayGrid();

        const gridEl = this.getNodeEl('dayGrid');
        if (gridEl) {
            const rule = {
                event: 'click',
                path: gridEl,
                handler: 'onDayGridClick',
                needsBinding: true,
            };
            DomEventsEngine.addEventRule(this, rule);
            state.rules.push(rule);
        }

        this.onCleanup(() => this.disposeDayGrid());
    },

    disposeDayGrid(): void {
        const state = this.abilityState(STATE_KEY) as DayGridState | undefined;
        if (!state) return;

        for (const rule of state.rules) {
            DomEventsEngine.removeEventRule(this, rule);
        }
        state.rules = [];

        const row = this.getNodeEl('weekdayRow');
        const grid = this.getNodeEl('dayGrid');
        if (row) row.innerHTML = '';
        if (grid) grid.innerHTML = '';
        state.weekdayCells = [];
        state.dayCells = [];

        this.setAbilityState(STATE_KEY, null);
    },

    onDayGridClick(domEvt: any): void {
        const state = this.abilityState(STATE_KEY) as DayGridState | undefined;
        if (!state) return;

        const originalEvent = domEvt?.data?.originalEvent;
        const target = (originalEvent?.target ?? domEvt?.target) as HTMLElement;
        const value = target?.dataset?.value;
        if (value === undefined) return;

        const day = parseInt(value);
        if (typeof this._onDaySelect === 'function') {
            this._onDaySelect(day);
        }
    },

    updateDayGrid(year: number, month: number, selectedDay?: number): void {
        const state = this.abilityState(STATE_KEY) as DayGridState | undefined;
        if (!state) return;

        state.year = year;
        state.month = month;
        state.selectedDay = selectedDay;

        this._applyDayGrid();
    },

    updateDayGridRange(rangeStart: DateTimeValue | null, rangeEnd: DateTimeValue | null): void {
        const state = this.abilityState(STATE_KEY) as DayGridState | undefined;
        if (!state) return;
        state.rangeStart = rangeStart;
        state.rangeEnd = rangeEnd;
        this._applyDayGrid();
    },

    updateDayGridBounds(minDate: DateTimeValue | null, maxDate: DateTimeValue | null): void {
        const state = this.abilityState(STATE_KEY) as DayGridState | undefined;
        if (!state) return;
        state.minDate = minDate;
        state.maxDate = maxDate;
        this._applyDayGrid();
    },

    _createDayCells(): void {
        const state = this.abilityState(STATE_KEY) as DayGridState | undefined;
        if (!state) return;

        const row = this.getNodeEl('weekdayRow');
        const grid = this.getNodeEl('dayGrid');
        if (!row || !grid) return;

        row.innerHTML = '';
        grid.innerHTML = '';
        state.weekdayCells = [];
        state.dayCells = [];

        for (let i = 0; i < TOTAL_WEEKDAYS; i++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__weekday-cell';
            row.appendChild(cell);
            state.weekdayCells.push(cell);
        }

        for (let i = 0; i < TOTAL_DAY_CELLS; i++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__day-cell';
            grid.appendChild(cell);
            state.dayCells.push(cell);
        }
    },

    _applyWeekdays(): void {
        const state = this.abilityState(STATE_KEY) as DayGridState | undefined;
        if (!state) return;

        const config = this.i18nConfig?.();
        const short = config?.weekdaysShort;
        const full = config?.weekdays;
        let labels: string[];
        if (short && full) {
            const shortMaxLen = Math.max(...short.map((s: string) => s.length));
            const fullMaxLen = Math.max(...full.map((s: string) => s.length));
            labels = shortMaxLen <= fullMaxLen ? short : full;
        } else {
            labels = short ?? full ?? DEFAULT_WEEKDAYS;
        }

        for (let i = 0; i < TOTAL_WEEKDAYS; i++) {
            const idx = (state.startDayOfWeek + i) % 7;
            state.weekdayCells[i].textContent = labels[idx] ?? '';
        }
    },

    _applyDayGrid(): void {
        const state = this.abilityState(STATE_KEY) as DayGridState | undefined;
        if (!state) return;

        const days: CalendarDay[] = generateCalendarView(
            state.year,
            state.month,
            state.startDayOfWeek
        );

        const minTime = state.minDate ? new Date(state.minDate.year, state.minDate.month - 1, state.minDate.day).getTime() : -Infinity;
        const maxTime = state.maxDate ? new Date(state.maxDate.year, state.maxDate.month - 1, state.maxDate.day).getTime() : Infinity;
        const rangeStartTime = state.rangeStart ? new Date(state.rangeStart.year, state.rangeStart.month - 1, state.rangeStart.day).getTime() : null;
        const rangeEndTime = state.rangeEnd ? new Date(state.rangeEnd.year, state.rangeEnd.month - 1, state.rangeEnd.day).getTime() : null;

        for (let i = 0; i < TOTAL_DAY_CELLS; i++) {
            const cell = state.dayCells[i];
            const day = days[i];
            if (!day) {
                cell.textContent = '';
                cell.className = 'q-dtpanel__day-cell';
                delete cell.dataset.value;
                continue;
            }

            cell.textContent = String(day.date.getDate());
            cell.className = 'q-dtpanel__day-cell';

            const dayTime = day.date.getTime();
            const isDisabled = dayTime < minTime || dayTime > maxTime;

            if (!day.isCurrentMonth) {
                cell.classList.add('q-dtpanel__day-cell--other-month');
            } else if (isDisabled) {
                cell.classList.add('q-dtpanel__day-cell--disabled');
                delete cell.dataset.value;
            } else {
                cell.dataset.value = String(day.date.getDate());
                if (state.selectedDay !== undefined && day.date.getDate() === state.selectedDay) {
                    cell.classList.add('q-dtpanel__day-cell--active');
                }
            }

            if (day.isCurrentMonth && rangeStartTime !== null) {
                if (dayTime === rangeStartTime) {
                    cell.classList.add('q-dtpanel__day-cell--range-start');
                } else if (rangeEndTime !== null && dayTime === rangeEndTime) {
                    cell.classList.add('q-dtpanel__day-cell--range-end');
                } else if (rangeEndTime !== null && dayTime > rangeStartTime && dayTime < rangeEndTime) {
                    cell.classList.add('q-dtpanel__day-cell--range-in');
                }
            }

            if (day.isToday) {
                cell.classList.add('q-dtpanel__day-cell--today');
            }
        }
    },
};
