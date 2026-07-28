import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { BREADCRUMB_TPL } from './breadcrumb-tpl';

export function registerBreadcrumbTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Breadcrumb', BREADCRUMB_TPL);
}
