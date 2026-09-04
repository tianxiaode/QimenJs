import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { CHECKBOX_GROUP_FIELD_BODY_TPL } from './checkbox-group-field-body-tpl';

class CheckboxGroupFieldBodyComponent extends Component {
    static type = 'CheckboxGroupFieldBody';

    get tpl(): TemplateDecl {
        return CHECKBOX_GROUP_FIELD_BODY_TPL;
    }
}

export { CheckboxGroupFieldBodyComponent };
export type CheckboxGroupFieldBodyComponentInstance = InstanceType<
    typeof CheckboxGroupFieldBodyComponent
>;
