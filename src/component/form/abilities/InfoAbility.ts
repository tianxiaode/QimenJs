import type { AbilityDefinition } from '@/composable';
import type { FormFieldAbilityHost } from './types';

export const InfoAbility = {
    _onErrorOptionChange(this: FormFieldAbilityHost, value: string): void {
        if (value) {
            this.addError(value);
            this.addCls('q-formfield--error');
        } else {
            this.removeError();
            this.removeCls('q-formfield--error');
        }
    },

    _onHelpOptionChange(this: FormFieldAbilityHost, value: string): void {
        if (value) {
            this.addHelp(value);
        } else {
            this.removeHelp();
        }
    },

    _onInfoOptionChange(this: FormFieldAbilityHost, value: any): void {
        if (this._infoItem) {
            const infoGroup = this.getComponent('infoGroup') as any;
            if (infoGroup) {
                const idx = infoGroup.items?.indexOf(this._infoItem);
                if (idx != null && idx >= 0) infoGroup.removeAt(idx);
            }
            this._infoItem = null;
        }
        if (value) {
            const data = typeof value === 'string' ? { text: value } : value;
            this.addInfo(data);
            const infoGroup = this.getComponent('infoGroup') as any;
            this._infoItem = infoGroup?.items?.[infoGroup.items.length - 1] ?? null;
        }
    },

    addError(this: FormFieldAbilityHost, text: string): any {
        const infoGroup = this.getComponent('infoGroup') as any;
        return infoGroup?.addError(text);
    },

    removeError(this: FormFieldAbilityHost): void {
        const infoGroup = this.getComponent('infoGroup') as any;
        infoGroup?.removeError();
    },

    addHelp(this: FormFieldAbilityHost, text: string): any {
        const infoGroup = this.getComponent('infoGroup') as any;
        return infoGroup?.addHelp(text);
    },

    removeHelp(this: FormFieldAbilityHost): void {
        const infoGroup = this.getComponent('infoGroup') as any;
        infoGroup?.removeHelp();
    },

    addInfo(this: FormFieldAbilityHost, data: Record<string, any>): any {
        const infoGroup = this.getComponent('infoGroup') as any;
        return infoGroup?.addInfo(data);
    },

    removeInfo(this: FormFieldAbilityHost, index: number): any {
        const infoGroup = this.getComponent('infoGroup') as any;
        return infoGroup?.removeInfo(index);
    },
} satisfies AbilityDefinition;
