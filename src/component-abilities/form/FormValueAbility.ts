/**
 * FormValueAbility — 表单值统一接口能力（已废弃）
 *
 * @deprecated 表单值接口已改为组件 body 方法（getFormValue/setFormValue 等），
 * 不再通过 Ability 注入。InputComponent 直接在 body 中定义，
 * 其他组件通过 replace() 覆写方法自定义逻辑。
 *
 * 保留此文件仅为向后兼容，新组件请勿使用。
 */

import type { AbilityDefinition } from '@/composable';

export const FormValueAbility = {
    get formValue(): any {
        return this.value;
    },
    set formValue(v: any) {
        this.value = v;
    },

    get formDisplayValue(): any {
        return this.value;
    },

    get formError(): string {
        return this.error ?? '';
    },
    set formError(v: string) {
        if (typeof this.error !== 'undefined') {
            this.error = v;
        }
    },

    formReset(defaultValue?: any): void {
        this.formValue = defaultValue ?? '';
        this.formError = '';
    },
} satisfies AbilityDefinition;
