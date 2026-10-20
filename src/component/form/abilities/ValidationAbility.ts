import type { AbilityDefinition } from '@/composable';
import { validate as doValidate } from '@qimenjs/validation';
import { REQUIRED_ERROR_MESSAGE } from '../constants';

/** 空值判断：''/null/undefined/NaN 视为未填写（0/false 是有效值） */
const isEmptyValue = (v: any): boolean =>
    v == null || v === '' || (typeof v === 'number' && isNaN(v));

export const ValidationAbility = {
    _shouldValidate(eventName: string): boolean {
        if (this.getData('required')) return true;
        if (!this.getData('validation')) return false;
        if (eventName === this.getData('validateTrigger')) return true;
        if (this.getData('validateTrigger') === 'blur' && eventName === 'change') return false;
        return false;
    },

    async _doValidate(): Promise<void> {
        if (this.getData('required') && isEmptyValue(this.getFormValue())) {
            this.setData('error', REQUIRED_ERROR_MESSAGE);
            return;
        }

        if (!this.getData('validation')) return;

        const rules = this.getData('validation');
        const ruleList = Array.isArray(rules) ? rules : [rules];
        const allErrors: any[] = [];

        for (const rule of ruleList) {
            if (typeof rule === 'boolean') continue;
            const errors = await doValidate.validate(this.getFormValue(), rule);
            if (errors) allErrors.push(...errors);
        }

        this.setData(
            'error',
            allErrors.length > 0 ? allErrors[0].message || String(allErrors[0]) : ''
        );
    },
} satisfies AbilityDefinition;
