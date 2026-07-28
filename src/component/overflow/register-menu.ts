import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { OVERFLOW_MENU_TPL } from './overflow-menu-tpl';
import { OverflowMenuComponent } from './OverflowMenuComponent';

export function registerOverflowMenuTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('OverflowMenu', OVERFLOW_MENU_TPL);
}
