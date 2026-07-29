import { OverflowMenuComponent } from './OverflowMenuComponent';
import { OVERFLOW_MENU_TPL } from './overflow-menu-tpl';

export function registerOverflowMenuTemplates(): void {
    OverflowMenuComponent.register(OVERFLOW_MENU_TPL);
}