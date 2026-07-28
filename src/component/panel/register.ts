import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { PANEL_TPL, PANEL_EVENTS } from './panel-tpl';
import { PanelComponent } from './PanelComponent';

export function registerPanelTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Panel', PANEL_TPL);
    PanelComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(PANEL_EVENTS);
}
