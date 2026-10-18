import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, DomEventsMap } from '@qimenjs/component-core';
import { INPUT_FIELD_BODY_TPL } from './input-field-body-tpl';

class InputFieldBodyComponent extends Component {
    static type = 'InputFieldBody';

    get tpl(): TemplateDecl {
        return INPUT_FIELD_BODY_TPL;
    }

    domEvents: DomEventsMap = {
        input: [{ path: 'field', emits: ['input'] }],
        focus: [{ path: 'field', emits: ['focus'] }],
        blur: [{ path: 'field', emits: ['blur'] }],
        change: [{ path: 'field', emits: ['change'] }],
    };
}

export { InputFieldBodyComponent };
export type InputFieldBodyComponentInstance = InstanceType<typeof InputFieldBodyComponent>;
