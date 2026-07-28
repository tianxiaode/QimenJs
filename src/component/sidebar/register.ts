import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { SIDEBAR_TPL } from './sidebar-tpl';

export function registerSidebarTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Sidebar', SIDEBAR_TPL);
}
