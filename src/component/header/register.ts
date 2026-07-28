import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { HEADER_TPL } from './header-tpl';

export function registerHeaderTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Header', HEADER_TPL);
}
