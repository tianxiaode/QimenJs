import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { MENU_EVENTS } from './menu-tpl';
import { MenuComponent } from './MenuComponent';
import { registerMenuItemTemplates } from './register-item';

export function registerMenuTemplates(): void {
    registerMenuItemTemplates();

    const registry = TemplateRegistrar.getInstance();
    MenuComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(MENU_EVENTS);
}
