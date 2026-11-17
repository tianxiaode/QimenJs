import type { AbilityDefinition } from '@/composable';
import { DomEventsEngine } from '@/component-core/engine';
import { generateMinuteSecondDigits, type DateTimeValue } from '@/utils/date';
import type { DigitPart, DigitPanelState } from './types';
import '../date-panel.css';
import '../secondpanel.css';

const STATE_KEY = 'SecondPanelAbility:state';

export const SecondPanelAbility: AbilityDefinition = {
    renderSecondPanel(value: DateTimeValue): void {
        this.disposeSecondPanel();

        const container = this.getNodeEl('secondPanel');
        if (!container) return;

        const state: DigitPanelState = {
            value,
            fieldName: 'second',
            tensSelected: Math.floor((value.second ?? 0) / 10),
            onesSelected: (value.second ?? 0) % 10,
            selectingTens: true,
            container,
            rules: [],
        };
        this.setAbilityState(STATE_KEY, state);

        this._renderSecondColumns();

        const rule = {
            event: 'click',
            path: container,
            handler: 'onSecondPanelClick',
            needsBinding: true,
        };
        DomEventsEngine.addEventRule(this, rule);
        state.rules.push(rule);
    },

    disposeSecondPanel(): void {
        const state = this.abilityState(STATE_KEY) as DigitPanelState | undefined;
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

    onSecondPanelClick(domEvt: any): void {
        const state = this.abilityState(STATE_KEY) as DigitPanelState | undefined;
        if (!state) return;

        const originalEvent = domEvt?.data?.originalEvent;
        const target = (originalEvent?.target ?? domEvt?.target) as HTMLElement;
        const part = target?.dataset?.digit as DigitPart | undefined;
        const value = target?.dataset?.value;
        if (!part || value === undefined) return;

        if (part === 'tens') {
            state.tensSelected = parseInt(value);
            state.selectingTens = false;
            this._renderSecondColumns();
        } else {
            state.onesSelected = parseInt(value);
            const second = state.tensSelected * 10 + state.onesSelected;
            state.value = { ...state.value, second };
            this._renderSecondColumns();

            if (typeof this._onSecondPanelComplete === 'function') {
                this._onSecondPanelComplete(state.value);
            }
        }
    },

    getSecondPanelValue(): DateTimeValue | null {
        const state = this.abilityState(STATE_KEY) as DigitPanelState | undefined;
        return state?.value ?? null;
    },

    _renderSecondColumns(): void {
        const state = this.abilityState(STATE_KEY) as DigitPanelState | undefined;
        if (!state?.container) return;

        const container = state.container;
        container.innerHTML = '';
        container.className = 'q-dtpanel__digit-columns';
        container.style.gridTemplateColumns = '1fr 1fr';

        const digits = generateMinuteSecondDigits();

        const tensCol = document.createElement('div');
        tensCol.className = 'q-dtpanel__digit-col';

        const tensHeader = document.createElement('div');
        tensHeader.className = 'q-dtpanel__digit-header';
        tensHeader.textContent = state.tensSelected >= 0 ? String(state.tensSelected) : '–';
        tensCol.appendChild(tensHeader);

        const tensGrid = document.createElement('div');
        tensGrid.className = 'q-dtpanel__digit-tens-grid';
        for (const d of digits.tens) {
            tensGrid.appendChild(this._createSecondCell(d, 'tens', 'q-dtpanel__high-btn', 'q-dtpanel__high-btn--active', state));
        }
        tensCol.appendChild(tensGrid);

        const onesCol = document.createElement('div');
        onesCol.className = 'q-dtpanel__digit-col';

        const onesHeader = document.createElement('div');
        onesHeader.className = 'q-dtpanel__digit-header';
        onesHeader.textContent = state.onesSelected >= 0 ? String(state.onesSelected) : '–';
        onesCol.appendChild(onesHeader);

        const splitIdx = digits.ones.findIndex(d => d >= 5);
        const leftNums = splitIdx >= 0 ? digits.ones.slice(0, splitIdx) : digits.ones;
        const rightNums = splitIdx >= 0 ? digits.ones.slice(splitIdx) : [];

        const body = document.createElement('div');
        body.className = 'q-dtpanel__digit-split';

        const leftSub = document.createElement('div');
        leftSub.className = 'q-dtpanel__digit-subcol';
        for (const d of leftNums) leftSub.appendChild(this._createSecondCell(d, 'ones', 'q-dtpanel__cell', 'q-dtpanel__cell--active', state));

        const rightSub = document.createElement('div');
        rightSub.className = 'q-dtpanel__digit-subcol';
        for (const d of rightNums) rightSub.appendChild(this._createSecondCell(d, 'ones', 'q-dtpanel__cell', 'q-dtpanel__cell--active', state));

        body.appendChild(leftSub);
        body.appendChild(rightSub);
        onesCol.appendChild(body);

        container.appendChild(tensCol);
        container.appendChild(onesCol);
    },

    _createSecondCell(
        d: number,
        part: DigitPart,
        baseCls: string,
        activeCls: string,
        state: DigitPanelState
    ): HTMLElement {
        const cell = document.createElement('div');
        cell.className = baseCls;
        cell.textContent = String(d);
        cell.dataset.digit = part;
        cell.dataset.value = String(d);
        const selected = part === 'tens' ? state.tensSelected : state.onesSelected;
        if (selected === d) cell.classList.add(activeCls);
        return cell;
    },
};
