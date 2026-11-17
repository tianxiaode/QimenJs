import type { AbilityDefinition } from '@/composable';
import { DomEventsEngine } from '@/component-core/engine';
import { generateMinuteSecondDigits, type DateTimeValue } from '@/utils/date';
import type { DigitPart, DigitPanelState } from './types';
import '../date-panel.css';
import '../minutepanel.css';

const STATE_KEY = 'MinutePanelAbility:state';

export const MinutePanelAbility: AbilityDefinition = {
    renderMinutePanel(value: DateTimeValue): void {
        this.disposeMinutePanel();

        const container = this.getNodeEl('minutePanel');
        if (!container) return;

        const state: DigitPanelState = {
            value,
            fieldName: 'minute',
            tensSelected: Math.floor(value.minute / 10),
            onesSelected: value.minute % 10,
            selectingTens: true,
            container,
            rules: [],
        };
        this.setAbilityState(STATE_KEY, state);

        this._renderMinuteColumns();

        const rule = {
            event: 'click',
            path: container,
            handler: 'onMinutePanelClick',
            needsBinding: true,
        };
        DomEventsEngine.addEventRule(this, rule);
        state.rules.push(rule);
    },

    disposeMinutePanel(): void {
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

    onMinutePanelClick(domEvt: any): void {
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
            this._renderMinuteColumns();
        } else {
            state.onesSelected = parseInt(value);
            const minute = state.tensSelected * 10 + state.onesSelected;
            state.value = { ...state.value, minute };
            this._renderMinuteColumns();

            if (typeof this._onMinutePanelComplete === 'function') {
                this._onMinutePanelComplete(state.value);
            }
        }
    },

    getMinutePanelValue(): DateTimeValue | null {
        const state = this.abilityState(STATE_KEY) as DigitPanelState | undefined;
        return state?.value ?? null;
    },

    _renderMinuteColumns(): void {
        const state = this.abilityState(STATE_KEY) as DigitPanelState | undefined;
        if (!state?.container) return;

        const container = state.container;
        container.innerHTML = '';
        container.classList.add('q-dtpanel__digit-columns');
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
            tensGrid.appendChild(this._createMinuteCell(d, 'tens', 'q-dtpanel__high-btn', 'q-dtpanel__high-btn--active', state));
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
        for (const d of leftNums) leftSub.appendChild(this._createMinuteCell(d, 'ones', 'q-dtpanel__cell', 'q-dtpanel__cell--active', state));

        const rightSub = document.createElement('div');
        rightSub.className = 'q-dtpanel__digit-subcol';
        for (const d of rightNums) rightSub.appendChild(this._createMinuteCell(d, 'ones', 'q-dtpanel__cell', 'q-dtpanel__cell--active', state));

        body.appendChild(leftSub);
        body.appendChild(rightSub);
        onesCol.appendChild(body);

        container.appendChild(tensCol);
        container.appendChild(onesCol);
    },

    _createMinuteCell(
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
