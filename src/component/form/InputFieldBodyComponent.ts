import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { INPUT_FIELD_BODY_TPL } from './input-field-body-tpl';

class InputFieldBodyComponent extends Component {
    static type = 'InputFieldBody';

    get tpl(): TemplateDecl {
        return INPUT_FIELD_BODY_TPL;
    }
}

export { InputFieldBodyComponent };
export type InputFieldBodyComponentInstance = InstanceType<typeof InputFieldBodyComponent>;
