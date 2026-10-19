import type { AbilityDefinition } from '@/composable';
import { validate as doValidate } from '@qimenjs/validation';

export const ValidationAbility = {
    _shouldValidate(eventName: string): boolean {
        if (!this.getData('validation')) return false;
        if (eventName === this.getData('validateTrigger')) return true;
        if (this.getData('validateTrigger') === 'blur' && eventName === 'change') return false;
        return false;
    },

    async _doValidate(): Promise<void> {
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
