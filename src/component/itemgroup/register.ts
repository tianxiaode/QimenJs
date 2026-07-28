import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { ITEMGROUP_BASE_TPL } from './itemgroup-tpl';

export function registerItemGroupTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('ItemGroupBase', ITEMGROUP_BASE_TPL);
}
