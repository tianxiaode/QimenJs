import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { INPUT_FIELD_BODY_TPL, INPUT_FIELD_BODY_EVENTS } from './input-field-body-tpl';
import { InputFieldBodyComponent } from './InputFieldBodyComponent';

export function registerInputFieldBodyTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('InputFieldBody', INPUT_FIELD_BODY_TPL);
    InputFieldBodyComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(INPUT_FIELD_BODY_EVENTS);
}
