import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { CHECKBOX_GROUP_FIELD_BODY_TPL } from './checkbox-group-field-body-tpl';

export function registerCheckboxGroupFieldBodyTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('CheckboxGroupFieldBody', CHECKBOX_GROUP_FIELD_BODY_TPL);
}
