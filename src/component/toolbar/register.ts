import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { TOOLBAR_EVENTS } from './toolbar-tpl';
import { ToolbarComponent } from './ToolbarComponent';

export function registerToolbarTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    ToolbarComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(TOOLBAR_EVENTS);
}
