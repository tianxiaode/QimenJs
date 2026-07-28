import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { FIELDSET_TPL, FIELDSET_EVENTS } from './fieldset-tpl';
import { FieldsetComponent } from './FieldsetComponent';

export function registerFieldsetTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Fieldset', FIELDSET_TPL);
    FieldsetComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(FIELDSET_EVENTS);
}
