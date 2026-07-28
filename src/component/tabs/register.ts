import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { TABS_TPL } from './tabs-tpl';

export function registerTabsTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Tabs', TABS_TPL);
}
