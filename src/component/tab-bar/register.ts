import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { TAB_BAR_EVENTS } from './tab-bar-tpl';
import { TabBarComponent } from './TabBarComponent';

export function registerTabBarTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    TabBarComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(TAB_BAR_EVENTS);
}
