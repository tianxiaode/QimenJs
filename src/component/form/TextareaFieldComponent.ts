import { InputFieldComponent } from './InputFieldComponent';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';

const TEXTAREA_FIELD_TPL: TemplateDecl = {
    tag: 'textarea',
    name: 'root',
    classes: 'q-textarea__field',
};

const TextareaFieldComponentDefs: Definitions = {
    options: {
        rows: null,
        resize: null,
    },
} as const;

class TextareaFieldComponent extends InputFieldComponent {
    static type = 'textarea-field';

    get tpl(): TemplateDecl {
        return TEXTAREA_FIELD_TPL;
    }

    _onRowsOptionChange(value: number | null): void {
        if (value != null) this.el?.setAttribute('rows', String(value));
        else this.el?.removeAttribute('rows');
    }

    _onResizeOptionChange(value: string | null): void {
        if (this.el) (this.el as HTMLElement).style.resize = value ?? 'vertical';
    }
}

TextareaFieldComponent.define(TextareaFieldComponentDefs);

export { TextareaFieldComponent };
export type TextareaFieldComponentInstance = InstanceType<typeof TextareaFieldComponent>;
