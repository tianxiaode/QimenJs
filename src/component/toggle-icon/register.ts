import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { TOGGLE_ICON_TPL, TOGGLE_ICON_EVENTS } from './toggle-icon-tpl';
import { ToggleIconComponent } from './ToggleIconComponent';

export function registerToggleIconTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('ToggleIcon', TOGGLE_ICON_TPL);
    ToggleIconComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(TOGGLE_ICON_EVENTS);
}
