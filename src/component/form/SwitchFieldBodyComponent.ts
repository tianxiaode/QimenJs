import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { SWITCH_FIELD_BODY_TPL } from './switch-field-body-tpl';

class SwitchFieldBodyComponent extends Component {
    static type = 'switch-field-body';

    get tpl(): TemplateDecl {
        return SWITCH_FIELD_BODY_TPL;
    }
}

export { SwitchFieldBodyComponent };
export type SwitchFieldBodyComponentInstance = InstanceType<typeof SwitchFieldBodyComponent>;
