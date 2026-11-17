import type { AbilityDefinition } from '@/composable';
import { DomEventsEngine } from '@/component-core/engine';
import type { DateTimeValue } from '@/utils/date';
import type { MonthPanelState } from './types';
import '../date-panel.css';
import '../monthpanel.css';

const STATE_KEY = 'MonthPanelAbility:state';

const MONTHS_SHORT_DEFAULT = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export const MonthPanelAbility: AbilityDefinition = {
    renderMonthPanel(container: HTMLElement, value: DateTimeValue): void {
        this.disposeMonthPanel();

        const state: MonthPanelState = {
            value,
            container,
            rules: [],
        };
        this.setAbilityState(STATE_KEY, state);

        this._renderMonthGrid();

        const rule = {
            event: 'click',
            path: container,
            handler: 'onMonthPanelClick',
            needsBinding: true,
        };
        DomEventsEngine.addEventRule(this, rule);
        state.rules.push(rule);

        this.onCleanup(() => this.disposeMonthPanel());
    },

    disposeMonthPanel(): void {
        const state = this.abilityState(STATE_KEY) as MonthPanelState | undefined;
        if (!state) return;

        for (const rule of state.rules) {
            DomEventsEngine.removeEventRule(this, rule);
        }
        state.rules = [];

        if (state.container) {
            state.container.innerHTML = '';
            state.container = null;
        }

        this.setAbilityState(STATE_KEY, null);
    },

    onMonthPanelClick(domEvt: any): void {
        const state = this.abilityState(STATE_KEY) as MonthPanelState | undefined;
        if (!state) return;

        const originalEvent = domEvt?.data?.originalEvent;
        const target = (originalEvent?.target ?? domEvt?.target) as HTMLElement;
        const value = target?.dataset?.value;
        if (value === undefined) return;

        const month = parseInt(value);
        state.value = { ...state.value, month };

        this._renderMonthGrid();

        if (typeof this._onMonthPanelComplete === 'function') {
            this._onMonthPanelComplete(state.value);
        }
    },

    getMonthPanelValue(): DateTimeValue | null {
        const state = this.abilityState(STATE_KEY) as MonthPanelState | undefined;
        return state?.value ?? null;
    },

    _renderMonthGrid(): void {
        const state = this.abilityState(STATE_KEY) as MonthPanelState | undefined;
        if (!state?.container) return;

        const container = state.container;
        container.innerHTML = '';
        container.className = 'q-dtpanel__grid';
        container.style.gridTemplateColumns = 'repeat(3, 1fr)';

        const monthsShort = this.i18nConfig?.()?.monthsShort ?? MONTHS_SHORT_DEFAULT;

        for (let m = 1; m <= 12; m++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__cell';
            cell.textContent = monthsShort[m - 1] ?? String(m).padStart(2, '0');
            cell.dataset.value = String(m);
            if (state.value.month === m) {
                cell.classList.add('q-dtpanel__cell--active');
            }
            container.appendChild(cell);
        }
    },
};
