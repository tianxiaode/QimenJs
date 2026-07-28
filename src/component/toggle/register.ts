import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { TOGGLE_TPL, TOGGLE_EVENTS } from './toggle-tpl';
import { ToggleComponent } from './ToggleComponent';

export function registerToggleTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Toggle', TOGGLE_TPL);
    ToggleComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(TOGGLE_EVENTS);
}
