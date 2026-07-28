import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { BUTTON_GROUP_EVENTS } from './button-group-tpl';
import { ButtonGroupComponent } from './ButtonGroupComponent';

export function registerButtonGroupTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    ButtonGroupComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(BUTTON_GROUP_EVENTS);
}
