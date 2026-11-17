import type { AbilityDefinition } from '@/composable';
import { DomEventsEngine } from '@/component-core/engine';
import type { DateTimeValue } from '@/utils/date';
import type { HourPanelState } from './types';
import '../date-panel.css';
import '../hourpanel.css';

const STATE_KEY = 'HourPanelAbility:state';

export const HourPanelAbility: AbilityDefinition = {
    renderHourPanel(value: DateTimeValue): void {
        this.disposeHourPanel();

        const container = this.getNodeEl('hourPanel');
        if (!container) return;

        const state: HourPanelState = {
            value,
            container,
            rules: [],
        };
        this.setAbilityState(STATE_KEY, state);

        this._renderHourGrid();

        const rule = {
            event: 'click',
            path: container,
            handler: 'onHourPanelClick',
            needsBinding: true,
        };
        DomEventsEngine.addEventRule(this, rule);
        state.rules.push(rule);
    },

    disposeHourPanel(): void {
        const state = this.abilityState(STATE_KEY) as HourPanelState | undefined;
        if (!state) return;

        for (const rule of state.rules) {
            DomEventsEngine.removeEventRule(this, rule);
        }
        state.rules = [];

        if (state.container) {
            state.container.innerHTML = '';
        }

        this.setAbilityState(STATE_KEY, null);
    },

    onHourPanelClick(domEvt: any): void {
        const state = this.abilityState(STATE_KEY) as HourPanelState | undefined;
        if (!state) return;

        const originalEvent = domEvt?.data?.originalEvent;
        const target = (originalEvent?.target ?? domEvt?.target) as HTMLElement;
        const value = target?.dataset?.value;
        if (value === undefined) return;

        const hour = parseInt(value);
        state.value = { ...state.value, hour };

        this._renderHourGrid();

        if (typeof this._onHourPanelComplete === 'function') {
            this._onHourPanelComplete(state.value);
        }
    },

    getHourPanelValue(): DateTimeValue | null {
        const state = this.abilityState(STATE_KEY) as HourPanelState | undefined;
        return state?.value ?? null;
    },

    _renderHourGrid(): void {
        const state = this.abilityState(STATE_KEY) as HourPanelState | undefined;
        if (!state?.container) return;

        const container = state.container;
        container.innerHTML = '';
        container.className = 'q-dtpanel__grid';
        container.style.gridTemplateColumns = 'repeat(4, 1fr)';

        for (let h = 0; h <= 23; h++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__cell';
            cell.textContent = String(h).padStart(2, '0');
            cell.dataset.value = String(h);
            if (state.value.hour === h) {
                cell.classList.add('q-dtpanel__cell--active');
            }
            container.appendChild(cell);
        }
    },
};
