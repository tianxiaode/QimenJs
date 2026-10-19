import type { AbilityDefinition } from '@/composable';
import type { FormFieldAbilityHost } from './types';
import { LABEL_POSITION_MAP } from '../constants';

export const LabelAbility = {
    _onLabelOptionChange(this: FormFieldAbilityHost, value: string): void {
        if (value) {
            this.setNodeText(value, 'label');
            this.setNodeHidden(false, 'labelGroup');
            this._applyRequiredConfig();
        }
    },

    _onLabelPositionOptionChange(this: FormFieldAbilityHost, value: string): void {
        for (const cls of Object.values(LABEL_POSITION_MAP)) {
            this.removeCls(cls);
        }
        const cls = LABEL_POSITION_MAP[value];
        if (cls) this.addCls(cls);
    },

    _onLabelWidthOptionChange(this: FormFieldAbilityHost, value: string): void {
        if (value) {
            this.el.style.setProperty('--q-formfield-label-width', value);
        }
    },

    _onRequiredOptionChange(this: FormFieldAbilityHost, value: boolean): void {
        if (value && this.getData('label')) {
            this._applyRequiredConfig();
            this.setNodeHidden(false, 'requiredMark');
        } else {
            this.setNodeHidden(true, 'requiredMark');
        }
    },

    _onRequiredMarkOptionChange(this: FormFieldAbilityHost, _value: string): void {
        this._applyRequiredConfig();
    },

    _onRequiredMarkPositionOptionChange(this: FormFieldAbilityHost, _value: string): void {
        this._applyRequiredConfig();
    },

    _applyRequiredConfig(this: FormFieldAbilityHost): void {
        const ui = this.i18nConfig?.()?.ui;
        const mark = this.getData('requiredMark') ?? ui?.requiredMark ?? '*';
        const position = this.getData('requiredMarkPosition') ?? ui?.requiredMarkPosition ?? 'after';

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

    onLocaleChange(this: FormFieldAbilityHost): void {
        this._applyRequiredConfig();
    },
} satisfies AbilityDefinition;
