import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { ENTITY_TOOLBAR_EVENTS } from './entity-toolbar-tpl';
import { EntityToolbarComponent } from './EntityToolbarComponent';

export function registerEntityToolbarTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    EntityToolbarComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(ENTITY_TOOLBAR_EVENTS);
}
