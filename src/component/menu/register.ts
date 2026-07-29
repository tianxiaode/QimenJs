import { MENU_ITEM_TPL } from './menu-item-tpl';
import { MenuComponent } from './MenuComponent';
import { MenuItemComponent } from './MenuItemComponent';

export function registerMenuTemplates(): void {
    MenuComponent.register();
    MenuItemComponent.register(MENU_ITEM_TPL);
}
