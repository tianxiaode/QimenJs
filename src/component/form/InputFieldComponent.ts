import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, DomEventsMap } from '@qimenjs/component-core';

const INPUT_FIELD_TPL: TemplateDecl = {
    tag: 'input',
    classes: 'q-input__field',
};

class InputFieldComponent extends Component {
    static type = 'input-field';

    get tpl(): TemplateDecl {
        return INPUT_FIELD_TPL;
    }

    domEvents: DomEventsMap = {
        input: [{ path: 'root', emits: ['input'] }],
        focus: [{ path: 'root', emits: ['focus'] }],
        blur: [{ path: 'root', emits: ['blur'] }],
        change: [{ path: 'root', emits: ['change'] }],
    };
}

export { InputFieldComponent };
export type InputFieldComponentInstance = InstanceType<typeof InputFieldComponent>;
