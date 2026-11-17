import type { AbilityDefinition } from '@/composable';
import { DomEventsEngine } from '@/component-core/engine';
import { generateYearDigits, splitToDigits, type DateTimeValue } from '@/utils/date';
import type { DigitPosition, YearPanelState } from './types';
import '../yearpanel.css';

const POSITION_ORDER: DigitPosition[] = ['thousands', 'hundreds', 'tens', 'ones'];

const STATE_KEY = 'YearPanelAbility:state';

function createState(value: DateTimeValue): YearPanelState {
    const [th, h, t, o] = splitToDigits(value.year);
    return {
        digits: { thousands: th, hundreds: h, tens: t, ones: o },
        currentPosition: 'thousands',
        value,
        container: null,
        rules: [],
    };
}

export const YearPanelAbility: AbilityDefinition = {
    renderYearPanel(value: DateTimeValue): void {
        this.disposeYearPanel();

        const container = this.getNodeEl('yearPanel');
        if (!container) return;

        const state = createState(value);
        this.setAbilityState(STATE_KEY, state);
        state.container = container;

        this._renderYearColumns();

        const rule = {
            event: 'click',
            path: container,
            handler: 'onYearPanelClick',
            needsBinding: true,
        };
        DomEventsEngine.addEventRule(this, rule);
        state.rules.push(rule);
    },

    disposeYearPanel(): void {
        const state = this.abilityState(STATE_KEY) as YearPanelState | undefined;
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

    onYearPanelClick(domEvt: any): void {
        const state = this.abilityState(STATE_KEY) as YearPanelState | undefined;
        if (!state) return;

        const originalEvent = domEvt?.data?.originalEvent;
        const target = (originalEvent?.target ?? domEvt?.target) as HTMLElement;
        const position = target?.dataset?.position as DigitPosition | undefined;
        const digit = target?.dataset?.value;
        if (!position || digit === undefined) return;

        state.digits[position] = parseInt(digit);

        const year =
            (state.digits.thousands >= 0 ? state.digits.thousands * 1000 : 0) +
            (state.digits.hundreds >= 0 ? state.digits.hundreds * 100 : 0) +
            (state.digits.tens >= 0 ? state.digits.tens * 10 : 0) +
            (state.digits.ones >= 0 ? state.digits.ones : 0);

        state.value = { ...state.value, year };

        this._renderYearColumns();

        const posIdx = POSITION_ORDER.indexOf(position);
        const nextPos = POSITION_ORDER[posIdx + 1];
        if (nextPos) {
            state.currentPosition = nextPos;
        } else {
            if (typeof this._onYearPanelComplete === 'function') {
                this._onYearPanelComplete(state.value);
            }
        }
    },

    getYearPanelValue(): DateTimeValue | null {
        const state = this.abilityState(STATE_KEY) as YearPanelState | undefined;
        return state?.value ?? null;
    },

    _renderYearColumns(): void {
        const state = this.abilityState(STATE_KEY) as YearPanelState | undefined;
        if (!state?.container) return;

        const container = state.container;
        container.innerHTML = '';
        container.classList.add('q-dtpanel__digit-columns');

        const digits = generateYearDigits(state.value.year);

        for (const pos of POSITION_ORDER) {
            const col = document.createElement('div');
            col.className = 'q-dtpanel__digit-col';

            const header = document.createElement('div');
            header.className = 'q-dtpanel__digit-header';
            header.textContent = state.digits[pos] >= 0 ? String(state.digits[pos]) : '–';
            col.appendChild(header);

            if (pos === 'thousands') {
                for (const d of digits.thousands) {
                    col.appendChild(
                        this._createYearCell(d, pos, 'q-dtpanel__high-btn', 'q-dtpanel__high-btn--active', state)
                    );
                }
            } else {
                const nums = digits[pos];
                const splitIdx = nums.findIndex(d => d >= 5);
                const leftNums = splitIdx >= 0 ? nums.slice(0, splitIdx) : nums;
                const rightNums = splitIdx >= 0 ? nums.slice(splitIdx) : [];

                const body = document.createElement('div');
                body.className = 'q-dtpanel__digit-split';

                const leftCol = document.createElement('div');
                leftCol.className = 'q-dtpanel__digit-subcol';
                for (const d of leftNums) leftCol.appendChild(this._createYearCell(d, pos, 'q-dtpanel__cell', 'q-dtpanel__cell--active', state));

                const rightCol = document.createElement('div');
                rightCol.className = 'q-dtpanel__digit-subcol';
                for (const d of rightNums) rightCol.appendChild(this._createYearCell(d, pos, 'q-dtpanel__cell', 'q-dtpanel__cell--active', state));

                body.appendChild(leftCol);
                body.appendChild(rightCol);
                col.appendChild(body);
            }

            container.appendChild(col);
        }
    },

    _createYearCell(
        d: number,
        pos: DigitPosition,
        baseCls: string,
        activeCls: string,
        state: YearPanelState
    ): HTMLElement {
        const cell = document.createElement('div');
        cell.className = baseCls;
        cell.textContent = String(d);
        cell.dataset.position = pos;
        cell.dataset.value = String(d);
        if (state.digits[pos] === d) cell.classList.add(activeCls);
        return cell;
    },
};
