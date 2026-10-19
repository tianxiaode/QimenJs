import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';

const INPUT_FIELD_TPL: TemplateDecl = {
    tag: 'input',
    classes: 'q-input__field',
};

const InputFieldComponentDefs: Definitions = {
    options: {
        value: '',
        inputType: null,
        placeholder: null,
        readonly: false,
        maxLength: null,
        disabled: false,
        min: null,
        max: null,
        step: null,
        inputMode: null,
    },
} as const;

class InputFieldComponent extends Component {
    static type = 'input-field';

    get tpl(): TemplateDecl {
        return INPUT_FIELD_TPL;
    }

    _onValueOptionChange(value: string): void {
        const el = this.el as HTMLInputElement | undefined;
        if (el && el.value !== value) el.value = value;
    }

    _onInputTypeOptionChange(value: string | null): void {
        if (value) this.el?.setAttribute('type', value);
        else this.el?.removeAttribute('type');
    }

    _onPlaceholderOptionChange(value: string | null): void {
        if (value) this.el?.setAttribute('placeholder', value);
        else this.el?.removeAttribute('placeholder');
    }

    _onReadonlyOptionChange(value: boolean): void {
        if (value) this.el?.setAttribute('readonly', 'true');
        else this.el?.removeAttribute('readonly');
    }

    _onMaxLengthOptionChange(value: number | null): void {
        if (value != null) this.el?.setAttribute('maxlength', String(value));
        else this.el?.removeAttribute('maxlength');
    }

    _onDisabledOptionChange(value: boolean): void {
        if (value) this.el?.setAttribute('disabled', 'true');
        else this.el?.removeAttribute('disabled');
    }

    _onMinOptionChange(value: number | null): void {
        if (value != null) this.el?.setAttribute('min', String(value));
        else this.el?.removeAttribute('min');
    }

    _onMaxOptionChange(value: number | null): void {
        if (value != null) this.el?.setAttribute('max', String(value));
        else this.el?.removeAttribute('max');
    }

    _onStepOptionChange(value: number | null): void {
        if (value != null) this.el?.setAttribute('step', String(value));
        else this.el?.removeAttribute('step');
    }

    _onInputModeOptionChange(value: string | null): void {
        if (value) this.el?.setAttribute('inputmode', value);
        else this.el?.removeAttribute('inputmode');
    }

    focus(): void {
        (this.el as HTMLInputElement | undefined)?.focus();
    }

    blur(): void {
        (this.el as HTMLInputElement | undefined)?.blur();
    }

    select(): void {
        (this.el as HTMLInputElement | undefined)?.select();
    }
}

InputFieldComponent.define(InputFieldComponentDefs);

export { InputFieldComponent };
export type InputFieldComponentInstance = InstanceType<typeof InputFieldComponent>;
