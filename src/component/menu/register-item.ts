import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { MENU_ITEM_TPL, MENU_ITEM_EVENTS } from './menu-item-tpl';
import { MenuItemComponent } from './MenuItemComponent';

export function registerMenuItemTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('MenuItem', MENU_ITEM_TPL);
    MenuItemComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(MENU_ITEM_EVENTS);
}
