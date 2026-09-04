import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { RADIO_GROUP_FIELD_BODY_TPL } from './radio-group-field-body-tpl';

class RadioGroupFieldBodyComponent extends Component {
    static type = 'RadioGroupFieldBody';

    get tpl(): TemplateDecl {
        return RADIO_GROUP_FIELD_BODY_TPL;
    }
}

export { RadioGroupFieldBodyComponent };
export type RadioGroupFieldBodyComponentInstance = InstanceType<typeof RadioGroupFieldBodyComponent>;
