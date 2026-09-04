import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { TEXTAREA_FIELD_BODY_TPL } from './textarea-field-body-tpl';

class TextareaFieldBodyComponent extends Component {
    static type = 'TextareaFieldBody';

    get tpl(): TemplateDecl {
        return TEXTAREA_FIELD_BODY_TPL;
    }
}

export { TextareaFieldBodyComponent };
export type TextareaFieldBodyComponentInstance = InstanceType<typeof TextareaFieldBodyComponent>;
