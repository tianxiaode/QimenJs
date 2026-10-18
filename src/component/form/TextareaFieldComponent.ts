import { InputFieldComponent } from './InputFieldComponent';
import type { TemplateDecl } from '@qimenjs/component-core';

const TEXTAREA_FIELD_TPL: TemplateDecl = {
    tag: 'textarea',
    name: 'root',
    classes: 'q-textarea__field',
};

class TextareaFieldComponent extends InputFieldComponent {
    static type = 'textarea-field';

    get tpl(): TemplateDecl {
        return TEXTAREA_FIELD_TPL;
    }
}

export { TextareaFieldComponent };
export type TextareaFieldComponentInstance = InstanceType<typeof TextareaFieldComponent>;
