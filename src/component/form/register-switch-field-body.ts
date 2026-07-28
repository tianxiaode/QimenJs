import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { SWITCH_FIELD_BODY_TPL, SWITCH_FIELD_BODY_EVENTS } from './switch-field-body-tpl';
import { SwitchFieldBodyComponent } from './SwitchFieldBodyComponent';

export function registerSwitchFieldBodyTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('SwitchFieldBody', SWITCH_FIELD_BODY_TPL);
    SwitchFieldBodyComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(SWITCH_FIELD_BODY_EVENTS);
}
