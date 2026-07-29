import { FormFieldComponent } from './FormFieldComponent';
import { InputFieldBodyComponent } from './InputFieldBodyComponent';
import { CheckboxGroupFieldBodyComponent } from './CheckboxGroupFieldBodyComponent';
import { RadioGroupFieldBodyComponent } from './RadioGroupFieldBodyComponent';
import { SwitchFieldBodyComponent } from './SwitchFieldBodyComponent';
import { TextareaFieldBodyComponent } from './TextareaFieldBodyComponent';

import { FORMFIELD_TPL } from './formfield-tpl';
import { INPUT_FIELD_BODY_TPL } from './input-field-body-tpl';
import { CHECKBOX_GROUP_FIELD_BODY_TPL } from './checkbox-group-field-body-tpl';
import { RADIO_GROUP_FIELD_BODY_TPL } from './radio-group-field-body-tpl';
import { SWITCH_FIELD_BODY_TPL } from './switch-field-body-tpl';
import { TEXTAREA_FIELD_BODY_TPL } from './textarea-field-body-tpl';

export function registerFormTemplates(): void {
    FormFieldComponent.register(FORMFIELD_TPL);
    InputFieldBodyComponent.register(INPUT_FIELD_BODY_TPL);
    CheckboxGroupFieldBodyComponent.register(CHECKBOX_GROUP_FIELD_BODY_TPL);
    RadioGroupFieldBodyComponent.register(RADIO_GROUP_FIELD_BODY_TPL);
    SwitchFieldBodyComponent.register(SWITCH_FIELD_BODY_TPL);
    TextareaFieldBodyComponent.register(TEXTAREA_FIELD_BODY_TPL);
}
