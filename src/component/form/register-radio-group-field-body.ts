import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { RADIO_GROUP_FIELD_BODY_TPL } from './radio-group-field-body-tpl';

export function registerRadioGroupFieldBodyTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('RadioGroupFieldBody', RADIO_GROUP_FIELD_BODY_TPL);
}
