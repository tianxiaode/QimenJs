import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { TABS_TPL } from './tabs-tpl';

export function registerTabsTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Tabs', TABS_TPL);
}
