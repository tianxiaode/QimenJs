import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { MENU_ITEM_TPL } from './menu-item-tpl';

export function registerMenuItemTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('MenuItem', MENU_ITEM_TPL);
}
