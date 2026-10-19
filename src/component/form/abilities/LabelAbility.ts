import type { AbilityDefinition } from '@/composable';
import { LABEL_POSITION_MAP } from '../constants';

export const LabelAbility = {
    _onLabelOptionChange(value: string): void {
        if (value) {
            this.setNodeText(value, 'label');
            this.setNodeHidden(false, 'labelGroup');
            this._applyRequiredConfig();
        }
    },

    _onLabelPositionOptionChange(value: string): void {
        for (const cls of Object.values(LABEL_POSITION_MAP)) {
            this.removeCls(cls);
        }
        const cls = LABEL_POSITION_MAP[value];
        if (cls) this.addCls(cls);
    },

    _onLabelWidthOptionChange(value: string): void {
        if (value) {
            this.el.style.setProperty('--q-formfield-label-width', value);
        }
    },

    _onRequiredOptionChange(value: boolean): void {
        if (value && this.getData('label')) {
            this._applyRequiredConfig();
            this.setNodeHidden(false, 'requiredMark');
        } else {
            this.setNodeHidden(true, 'requiredMark');
        }
    },

    _onRequiredMarkOptionChange(_value: string): void {
        this._applyRequiredConfig();
    },

    _onRequiredMarkPositionOptionChange(_value: string): void {
        this._applyRequiredConfig();
    },

    _applyRequiredConfig(): void {
        const ui = this.i18nConfig?.()?.ui;
        const mark = this.getData('requiredMark') ?? ui?.requiredMark ?? '*';
        const position =
            this.getData('requiredMarkPosition') ?? ui?.requiredMarkPosition ?? 'after';

        const markEl = this.getNodeEl('requiredMark');
        if (markEl) {
            markEl.textContent = mark;
            markEl.classList.toggle('q-formfield__required-mark--before', position === 'before');
            markEl.classList.toggle('q-formfield__required-mark--after', position === 'after');
        }

        const separatorEl = this.getNodeEl('separator');
        if (separatorEl) {
            separatorEl.textContent = ui?.labelSeparator ?? '：';
        }
    },

    onLocaleChange(): void {
        this._applyRequiredConfig();
    },
} satisfies AbilityDefinition;
