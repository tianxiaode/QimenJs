import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { TOGGLE_TPL } from './toggle-tpl';

export function registerToggleTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Toggle', TOGGLE_TPL);
}
